/**
 * Theme v5 integrity lint (`docs/decisions/0020-theme-v5.md`).
 *
 *   bun scripts/theme-lint.ts
 *   Run by `bun run check`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { type AppTheme, type SurfaceRole } from "../packages/theme/schema";
import { ALL_THEMES, BUILD_ROOT_THEME } from "../packages/theme/themes";
import { resolveColour, varsOf } from "./theme/css-colour";
import { validateThemeInvariants } from "./theme/invariants";

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
  "font-mono",
  "font-sans",
  "media",
  "on-media",
  "radius",
  "radius-lg",
  "radius-md",
  "radius-xl",
  "scrim",
] as const;

const FONT_THEME_KEYS = new Set(["font-sans", "font-mono"]);

// 1. Build-root artifacts must match themes/nsh-gallery byte for byte.
for (const file of ["theme.json", "DESIGN.md", "light.tokens.json", "dark.tokens.json"]) {
  if (
    read(`packages/theme/${file}`) !== read(`packages/theme/themes/${BUILD_ROOT_THEME}/${file}`)
  ) {
    fail(`packages/theme/${file} differs from packages/theme/themes/${BUILD_ROOT_THEME}/${file}`);
  }
}

// 2. Per-theme checks across ALL_THEMES.
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
  const { id, theme } = entry;
  const tag = `theme(${id})`;

  // Compiled theme.json parity & keysets
  const onDisk = JSON.parse(read(`packages/theme/themes/${id}/theme.json`));
  if (JSON.stringify(onDisk) !== JSON.stringify(theme)) {
    fail(`${tag}: themes/${id}/theme.json is stale (run \`bun run tokens:build\`)`);
  }

  for (const k of Object.keys(theme.cssVars.theme)) {
    if (!REQUIRED_THEME_KEYS.includes(k as never)) {
      fail(`${tag}: unexpected cssVars.theme key \`${k}\``);
    }
    if (FONT_THEME_KEYS.has(k) && (!theme.cssVars.theme[k] || !theme.cssVars.theme[k]!.trim())) {
      fail(`${tag}: \`${k}\` must be a non-empty string`);
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

  for (const msg of validateThemeInvariants(entry)) fail(msg);
}

for (const t of ALL_THEMES) validateTheme(t);

if (failures.length > 0) {
  for (const f of failures) console.error(`theme-lint: ${f}`);
  process.exit(1);
}
console.log(
  `theme-lint: ${ALL_THEMES.length} themes × ${EXPECTED_LIGHT_KEYS.length} per-mode keys, ${SURFACE_ROLES.length} surfaces — ok`,
);
