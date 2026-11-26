/**
 * Theme v5 integrity lint (`docs/decisions/0020-theme-v5.md`).
 *
 *   bun scripts/theme-lint.ts
 *   Run by `bun run check`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { materials } from "../packages/theme/materials";
import {
  SHARED_TYPE_SCALE,
  type AppTheme,
  type SurfaceRole,
  type TypeRole,
} from "../packages/theme/schema";
import { ALL_THEMES, BUILD_ROOT_THEME } from "../packages/theme/themes";
import { resolveColour, varsOf } from "./theme/css-colour";
import { parseColor } from "./theme/oklch";

const root = join(import.meta.dir, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const failures: string[] = [];
const fail = (m: string) => failures.push(m);

const EXPECTED_LIGHT_KEYS = [
  "accent",
  "background",
  "border",
  "brand",
  "card",
  "destructive",
  "faint",
  "foreground",
  "info",
  "input",
  "line",
  "muted",
  "muted-foreground",
  "popover",
  "primary",
  "primary-foreground",
  "ring",
  "secondary",
  "success",
  "surface",
  "warning",
] as const;

const REQUIRED_THEME_KEYS = [
  "media",
  "on-media",
  "radius",
  "radius-container",
  "radius-control",
  "radius-modal",
  "scrim",
] as const;

const OPTIONAL_THEME_KEYS = new Set(["font-sans", "font-mono"]);

// 1. Build-root artifacts must match themes/nsh-gallery byte for byte.
for (const file of ["theme.json", "DESIGN.md", "light.tokens.json", "dark.tokens.json"]) {
  if (
    read(`packages/theme/${file}`) !== read(`packages/theme/themes/${BUILD_ROOT_THEME}/${file}`)
  ) {
    fail(`packages/theme/${file} differs from packages/theme/themes/${BUILD_ROOT_THEME}/${file}`);
  }
}

// 2. Per-theme checks across ALL_THEMES.
const ALLOWED_SPACING = new Set([4, 8, 12, 16, 24, 32]);
const TYPE_ORDER: readonly TypeRole[] = [
  "caption",
  "detail",
  "body",
  "label",
  "title",
  "headline",
  "display",
];
const SURFACE_ROLES: readonly SurfaceRole[] = [
  "card",
  "raised",
  "inset",
  "channel",
  "plate",
  "overlay",
  "modal",
  "inverse",
  "glass",
  "accent",
  "fill",
];

function validateTheme(entry: AppTheme) {
  const { id, theme, spec } = entry;
  const tag = `theme(${id})`;

  // Compiled theme.json parity & keysets
  const onDisk = JSON.parse(read(`packages/theme/themes/${id}/theme.json`));
  if (JSON.stringify(onDisk) !== JSON.stringify(theme)) {
    fail(`${tag}: themes/${id}/theme.json is stale (run \`bun run tokens:build\`)`);
  }

  for (const k of Object.keys(theme.cssVars.theme)) {
    if (!REQUIRED_THEME_KEYS.includes(k as never) && !OPTIONAL_THEME_KEYS.has(k)) {
      fail(`${tag}: unexpected cssVars.theme key \`${k}\``);
    }
    if (
      OPTIONAL_THEME_KEYS.has(k) &&
      (!theme.cssVars.theme[k] || !theme.cssVars.theme[k]!.trim())
    ) {
      fail(`${tag}: optional \`${k}\` must be non-empty when set`);
    }
  }
  for (const req of REQUIRED_THEME_KEYS) {
    if (!(req in theme.cssVars.theme)) fail(`${tag}: missing cssVars.theme.\`${req}\``);
  }
  for (const mode of ["light", "dark"] as const) {
    const keys = Object.keys(theme.cssVars[mode]).sort();
    if (JSON.stringify(keys) !== JSON.stringify([...EXPECTED_LIGHT_KEYS])) {
      fail(`${tag}: cssVars.${mode} keyset mismatch`);
    }
    const cssVars = { ...theme.cssVars.theme, ...theme.cssVars[mode] };
    const vars = varsOf(cssVars);
    for (const k of EXPECTED_LIGHT_KEYS) {
      try {
        resolveColour(cssVars[k]!, vars);
      } catch (e) {
        fail(`${tag}: ${mode}.${k} invalid color (${(e as Error).message})`);
      }
    }
  }

  // Radii monotonicity
  const { control, container, modal } = spec.tokens.radius;
  if (control < 0 || container < control || modal < container) {
    fail(`${tag}: radii must satisfy 0 <= control <= container <= modal`);
  }

  // Metrics scales
  for (const tierName of ["pointer", "touch"] as const) {
    const h = spec.metrics.height[tierName];
    const ic = spec.metrics.icon[tierName];
    if (!(h.sm <= h.md && h.md <= h.lg)) fail(`${tag}: ${tierName} heights must not decrease`);
    if (!(ic.sm <= ic.md && ic.md <= ic.lg)) fail(`${tag}: ${tierName} icons must not decrease`);
    for (const [k, v] of Object.entries(h)) {
      if (v % 4 !== 0) fail(`${tag}: height.${tierName}.${k}=${v} not on 4px grid`);
    }
    for (const [k, v] of Object.entries(ic)) {
      if (v % 4 !== 0) fail(`${tag}: icon.${tierName}.${k}=${v} not on 4px grid`);
    }
    const citations = spec.meta?.scaleCitations ?? {};
    const spacingEntries: [string, number][] = [
      [`metrics.density.${tierName}.pad`, spec.metrics.density[tierName].pad],
      [`metrics.density.${tierName}.gap`, spec.metrics.density[tierName].gap],
      [`metrics.control.${tierName}.padding`, spec.metrics.control[tierName].padding],
      [`metrics.control.${tierName}.gap`, spec.metrics.control[tierName].gap],
      [`metrics.item.${tierName}.pad`, spec.metrics.item[tierName].pad],
    ];
    for (const [pathKey, val] of spacingEntries) {
      if (!ALLOWED_SPACING.has(val) && !citations[pathKey]) {
        fail(`${tag}: ${pathKey}=${val} is off the scale without meta.scaleCitations entry`);
      }
    }
  }
  if (spec.metrics.hit.touch < 44) {
    fail(`${tag}: metrics.hit.touch=${spec.metrics.hit.touch} must be >= 44`);
  }

  // Shared type scale monotonicity
  for (const tierName of ["pointer", "touch"] as const) {
    for (let i = 1; i < TYPE_ORDER.length; i += 1) {
      const prev = SHARED_TYPE_SCALE[TYPE_ORDER[i - 1]!].fontSize[tierName];
      const cur = SHARED_TYPE_SCALE[TYPE_ORDER[i]!].fontSize[tierName];
      if (cur < prev) fail(`${tag}: shared type scale ${TYPE_ORDER[i]} < ${TYPE_ORDER[i - 1]}`);
    }
  }

  // Feedback invariants
  if (spec.feedback.press.scale <= 0 || spec.feedback.press.scale > 1) {
    fail(`${tag}: feedback.press.scale must be in (0, 1]`);
  }
  if (spec.feedback.press.accent.opacity <= 0 || spec.feedback.press.accent.opacity > 1) {
    fail(`${tag}: feedback.press.accent.opacity must be in (0, 1]`);
  }

  // Material fallback opacity floor
  for (const role of SURFACE_ROLES) {
    const s = spec.surfaces[role];
    for (const mode of ["light", "dark"] as const) {
      const merged = { ...s, ...s[mode] };
      if (!merged.material) continue;
      const minOpacity = materials[merged.material].fallback.minOpacity;
      const bg = merged.background;
      if (
        typeof bg === "object" &&
        bg !== null &&
        "alpha" in bg &&
        bg.alpha !== undefined &&
        bg.alpha < minOpacity
      ) {
        fail(
          `${tag}: surfaces.${role}.${mode} material ${merged.material} alpha ${bg.alpha} < ${minOpacity}`,
        );
      } else if (typeof bg === "string" && bg.startsWith("oklch(")) {
        const rgb = parseColor(bg);
        if ((rgb.a ?? 1) < minOpacity) {
          fail(
            `${tag}: surfaces.${role}.${mode} material ${merged.material} alpha ${rgb.a} < ${minOpacity}`,
          );
        }
      }
    }
  }
}

for (const t of ALL_THEMES) validateTheme(t);

if (failures.length > 0) {
  for (const f of failures) console.error(`theme-lint: ${f}`);
  process.exit(1);
}
console.log(
  `theme-lint: ${ALL_THEMES.length} themes × ${EXPECTED_LIGHT_KEYS.length} per-mode keys, ${SURFACE_ROLES.length} surfaces — ok`,
);
