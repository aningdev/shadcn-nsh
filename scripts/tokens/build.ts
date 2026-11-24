/**
 * Build & check compiled theme runtime files (`theme.json`, `semantics.json`) and standalone
 * per-appearance DTCG 2025.10 Format files (`light.tokens.json`, `dark.tokens.json`) for every
 * theme whose source of truth lives in `packages/theme/tokens/themes/<id>/theme.resolver.json`.
 *
 *   bun run tokens:build          # write compiled files for every DTCG-sourced theme
 *   bun run tokens:build --check  # fail if any committed compiled file differs from its source
 */
import fs from "node:fs";
import path from "node:path";

import { BASE_SLOTS } from "../theme/slots";
import { slotsDoc } from "../theme/slots-dtcg";
import { BUILD_ROOT_THEME } from "../theme/tokens";
import { compileAppearanceTokensJson, compileSemanticsJson, compileThemeJson } from "./compile";
import { compileDesignMd } from "./design-md";
import { FORMAT_SCHEMA_URL } from "./types";

const defaultRepoRoot = path.resolve(import.meta.dir, "..", "..");

export interface CompiledTarget {
  /** Path relative to the repo root. */
  relPath: string;
  /** Canonical formatted JSON output (`\n`-terminated). */
  content: string;
}

/** Discover every theme directory under `packages/theme/tokens/themes/` that has a resolver. */
export function discoverDtcgThemes(repoRoot = defaultRepoRoot): string[] {
  const themesDir = path.join(repoRoot, "packages/theme/tokens/themes");
  if (!fs.existsSync(themesDir)) return [];
  return fs
    .readdirSync(themesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(themesDir, name, "theme.resolver.json")))
    .sort();
}

/**
 * The base slot source: the values every theme inherits (`scripts/theme/slots.ts` is their source, so
 * a slot is added in one place and lands in a DTCG file the same build writes).
 */
export const BASE_SLOTS_PATH = "packages/theme/tokens/base/slots.tokens.json";

/** The base slot group, as the DTCG source file every theme's resolver reads first. */
export function baseSlotsTarget(): CompiledTarget {
  return {
    relPath: BASE_SLOTS_PATH,
    content: `${JSON.stringify({ $schema: FORMAT_SCHEMA_URL, ...slotsDoc(BASE_SLOTS) }, null, 2)}\n`,
  };
}

/** Compile a DTCG-sourced theme into all of its shipped runtime and DTCG targets. */
export function buildThemeTargets(themeId: string, repoRoot = defaultRepoRoot): CompiledTarget[] {
  const resolverPath = path.join(
    repoRoot,
    "packages/theme/tokens/themes",
    themeId,
    "theme.resolver.json",
  );
  const themeText = `${JSON.stringify(compileThemeJson(resolverPath), null, 2)}\n`;
  const semanticsText = `${JSON.stringify(compileSemanticsJson(resolverPath), null, 2)}\n`;
  const lightTokensText = `${JSON.stringify(compileAppearanceTokensJson(resolverPath, "light"), null, 2)}\n`;
  const darkTokensText = `${JSON.stringify(compileAppearanceTokensJson(resolverPath, "dark"), null, 2)}\n`;
  const designMdText = compileDesignMd(resolverPath);

  const targets: CompiledTarget[] = [
    { relPath: `packages/theme/themes/${themeId}/theme.json`, content: themeText },
    { relPath: `packages/theme/themes/${themeId}/semantics.json`, content: semanticsText },
    { relPath: `packages/theme/themes/${themeId}/light.tokens.json`, content: lightTokensText },
    { relPath: `packages/theme/themes/${themeId}/dark.tokens.json`, content: darkTokensText },
    { relPath: `packages/theme/themes/${themeId}/DESIGN.md`, content: designMdText },
  ];

  // The build root's pair lands at `packages/theme/` too: the artifacts an app installs.
  if (themeId === BUILD_ROOT_THEME) {
    targets.unshift(
      { relPath: "packages/theme/theme.json", content: themeText },
      { relPath: "packages/theme/semantics.json", content: semanticsText },
      { relPath: "packages/theme/light.tokens.json", content: lightTokensText },
      { relPath: "packages/theme/dark.tokens.json", content: darkTokensText },
      { relPath: "packages/theme/DESIGN.md", content: designMdText },
    );
  }

  return targets;
}

/** Every file the sources build: the base slot group, then each theme's runtime and DTCG outputs. */
export function* allTargets(repoRoot = defaultRepoRoot): Generator<CompiledTarget> {
  yield baseSlotsTarget();
  for (const themeId of discoverDtcgThemes(repoRoot)) yield* buildThemeTargets(themeId, repoRoot);
}

/** Write compiled runtime files for every DTCG-sourced theme. */
export function buildAllTokens(repoRoot = defaultRepoRoot): {
  themes: string[];
  written: string[];
  unchanged: string[];
} {
  const themes = discoverDtcgThemes(repoRoot);
  const written: string[] = [];
  const unchanged: string[] = [];

  for (const target of allTargets(repoRoot)) {
    const abs = path.join(repoRoot, target.relPath);
    const existing = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
    if (existing === target.content) {
      unchanged.push(target.relPath);
      continue;
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, target.content);
    written.push(target.relPath);
  }

  return { themes, written, unchanged };
}

/** Check every DTCG-sourced theme's compiled files match what its source builds. */
export function checkAllTokens(repoRoot = defaultRepoRoot): {
  themes: string[];
  problems: string[];
} {
  const themes = discoverDtcgThemes(repoRoot);
  const problems: string[] = [];

  for (const target of allTargets(repoRoot)) {
    const abs = path.join(repoRoot, target.relPath);
    if (!fs.existsSync(abs)) {
      problems.push(`${target.relPath} is missing`);
      continue;
    }
    if (fs.readFileSync(abs, "utf8") !== target.content) {
      problems.push(`${target.relPath} differs from what packages/theme/tokens builds`);
    }
  }

  return { themes, problems };
}

if (import.meta.main) {
  const check = process.argv.includes("--check");
  if (check) {
    const { themes, problems } = checkAllTokens();
    if (problems.length > 0) {
      for (const p of problems) console.error(`tokens:build: ${p}`);
      console.error("tokens:build: run `bun run tokens:build` to regenerate compiled theme files");
      process.exit(1);
    }
    console.log(
      `tokens:build ok — ${themes.length} theme${themes.length === 1 ? "" : "s"} (${themes.join(", ")}) match DTCG sources`,
    );
  } else {
    const { themes, written, unchanged } = buildAllTokens();
    for (const file of written) console.log(`tokens:build: wrote ${file}`);
    console.log(
      `tokens:build ok — ${themes.length} theme${themes.length === 1 ? "" : "s"} (${themes.join(", ")}), ${written.length} written, ${unchanged.length} unchanged`,
    );
  }
}
