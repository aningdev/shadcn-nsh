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

import { compileAppearanceTokensJson, compileSemanticsJson, compileThemeJson } from "./compile";

const defaultRepoRoot = path.resolve(import.meta.dir, "..", "..");

/** Format JSON matching `vp fmt` (compact single-line primitive arrays up to 100 chars). */
function formatTokensJson(value: unknown, indent = 0): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every((item) => item === null || typeof item !== "object")) {
      const oneLine = `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
      if (pad.length + oneLine.length <= 100) return oneLine;
    }
    return `[\n${value.map((item) => `${pad}  ${formatTokensJson(item, indent + 1)}`).join(",\n")}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  return `{\n${entries.map(([k, v]) => `${pad}  ${JSON.stringify(k)}: ${formatTokensJson(v, indent + 1)}`).join(",\n")}\n${pad}}`;
}

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
  const lightTokensText = `${formatTokensJson(compileAppearanceTokensJson(resolverPath, "light"))}\n`;
  const darkTokensText = `${formatTokensJson(compileAppearanceTokensJson(resolverPath, "dark"))}\n`;

  const targets: CompiledTarget[] = [
    { relPath: `packages/theme/themes/${themeId}/theme.json`, content: themeText },
    { relPath: `packages/theme/themes/${themeId}/semantics.json`, content: semanticsText },
    { relPath: `packages/theme/themes/${themeId}/light.tokens.json`, content: lightTokensText },
    { relPath: `packages/theme/themes/${themeId}/dark.tokens.json`, content: darkTokensText },
  ];

  // The `default` theme is both the build-time root theme and the `theme-default` copy.
  if (themeId === "default") {
    targets.unshift(
      { relPath: "packages/theme/theme.json", content: themeText },
      { relPath: "packages/theme/semantics.json", content: semanticsText },
      { relPath: "packages/theme/light.tokens.json", content: lightTokensText },
      { relPath: "packages/theme/dark.tokens.json", content: darkTokensText },
    );
  }

  return targets;
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

  for (const themeId of themes) {
    for (const target of buildThemeTargets(themeId, repoRoot)) {
      const abs = path.join(repoRoot, target.relPath);
      const existing = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
      if (existing === target.content) {
        unchanged.push(target.relPath);
      } else {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, target.content);
        written.push(target.relPath);
      }
    }
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

  for (const themeId of themes) {
    for (const target of buildThemeTargets(themeId, repoRoot)) {
      const abs = path.join(repoRoot, target.relPath);
      if (!fs.existsSync(abs)) {
        problems.push(`${target.relPath} is missing`);
        continue;
      }
      const existing = fs.readFileSync(abs, "utf8");
      if (existing !== target.content) {
        problems.push(`${target.relPath} differs from what packages/theme/tokens builds`);
      }
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
