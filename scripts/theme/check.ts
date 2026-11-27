/**
 * Unified Theme v5 verification CLI (`docs/theme.md`):
 * - `build`     (`scripts/theme/build.ts`): compiled artifacts match TS sources
 * - `lint`      (role keyset, color resolution, surface/ergonomic/motion invariants)
 * - `contrast`  (`scripts/theme/contrast.ts`): WCAG 2.2 AA contrast & fill separation
 * - `semantics` (`scripts/theme/semantics.ts`): `docs/theme-values.md` is current
 *
 *   bun scripts/theme/check.ts
 *   bun scripts/theme/check.ts --only build|lint|contrast|semantics
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { type AppTheme, type SurfaceRole } from "../../packages/theme/schema";
import { ALL_THEMES, BUILD_ROOT_THEME } from "../../packages/theme/themes";
import { checkAllTokens } from "./build";
import { resolveColour, varsOf } from "./color";
import { checkContrast } from "./contrast";
import { validateThemeInvariants } from "./invariants";
import { checkSemantics } from "./semantics";

type CheckKind = "build" | "lint" | "contrast" | "semantics";
const ALL_CHECKS: readonly CheckKind[] = ["build", "lint", "contrast", "semantics"];

const root = join(import.meta.dir, "../..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

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

function parseOnly(argv: string[]): CheckKind[] {
  const at = argv.indexOf("--only");
  if (at === -1) return [...ALL_CHECKS];
  const raw = argv[at + 1];
  const selected = raw
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) as CheckKind[] | undefined;
  if (!selected || selected.length === 0) {
    throw new Error("--only requires one or more of: build, lint, contrast, semantics");
  }
  for (const item of selected) {
    if (!ALL_CHECKS.includes(item)) {
      throw new Error(
        `unknown --only target "${item}" (expected build, lint, contrast, or semantics)`,
      );
    }
  }
  return selected;
}

function validateTheme(entry: AppTheme, fail: (message: string) => void) {
  const { id, theme } = entry;
  const tag = `theme(${id})`;

  const onDisk = JSON.parse(read(`packages/theme/themes/${id}/theme.json`));
  if (JSON.stringify(onDisk) !== JSON.stringify(theme)) {
    fail(`${tag}: themes/${id}/theme.json is stale (run \`bun run theme:build\`)`);
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

function runBuildCheck(): string[] {
  const { themes, problems } = checkAllTokens(root);
  if (problems.length > 0) {
    return [
      ...problems.map((p) => `theme:build: ${p}`),
      "theme:build: run `bun run theme:build` to regenerate theme artifacts",
    ];
  }
  console.log(`theme:build ok — ${themes.length} themes (${themes.join(", ")}) up to date`);
  return [];
}

function runThemeLint(): string[] {
  const failures: string[] = [];
  const fail = (m: string) => failures.push(`theme-lint: ${m}`);
  for (const file of ["theme.json", "DESIGN.md", "light.tokens.json", "dark.tokens.json"]) {
    if (
      read(`packages/theme/${file}`) !== read(`packages/theme/themes/${BUILD_ROOT_THEME}/${file}`)
    ) {
      fail(`packages/theme/${file} differs from packages/theme/themes/${BUILD_ROOT_THEME}/${file}`);
    }
  }
  for (const t of ALL_THEMES) validateTheme(t, fail);
  if (failures.length === 0) {
    console.log(
      `theme-lint: ${ALL_THEMES.length} themes × ${EXPECTED_LIGHT_KEYS.length} per-mode keys, ${SURFACE_ROLES.length} surfaces — ok`,
    );
  }
  return failures;
}

function runContrastCheck(): string[] {
  const { log, failures } = checkContrast();
  for (const line of log) console.log(line);
  return failures;
}

function runSemanticsCheck(): string[] {
  const { rowTotal, error } = checkSemantics(root);
  if (error) return [error];
  console.log(`docs:semantics: docs/theme-values.md is current (${rowTotal} rows).`);
  return [];
}

if (import.meta.main) {
  let checks: CheckKind[];
  try {
    checks = parseOnly(process.argv.slice(2));
  } catch (error) {
    console.error(`check:theme: ${(error as Error).message}`);
    process.exit(1);
  }

  const runners: Record<CheckKind, () => string[]> = {
    build: runBuildCheck,
    lint: runThemeLint,
    contrast: runContrastCheck,
    semantics: runSemanticsCheck,
  };

  const failures = checks.flatMap((check) => runners[check]());
  if (failures.length > 0) {
    for (const f of failures) console.error(f);
    process.exit(1);
  }
}
