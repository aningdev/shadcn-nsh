/**
 * Build & check compiled theme runtime files (`theme.json`, `semantics.json`) for every theme
 * whose source of truth lives in `packages/theme/tokens/themes/<id>/theme.resolver.json`.
 *
 *   bun run tokens:build          # write compiled files for every DTCG-sourced theme
 *   bun run tokens:build --check  # fail if any committed compiled file differs from its source
 */
import fs from "node:fs";
import path from "node:path";

import { compileSemanticsJson, compileThemeJson } from "./compile";

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

/** Compile a DTCG-sourced theme into all of its shipped runtime JSON targets. */
export function buildThemeTargets(themeId: string, repoRoot = defaultRepoRoot): CompiledTarget[] {
  const resolverPath = path.join(
    repoRoot,
    "packages/theme/tokens/themes",
    themeId,
    "theme.resolver.json",
  );
  const themeText = `${JSON.stringify(compileThemeJson(resolverPath), null, 2)}\n`;
  const semanticsText = `${JSON.stringify(compileSemanticsJson(resolverPath), null, 2)}\n`;

  const targets: CompiledTarget[] = [
    { relPath: `packages/theme/themes/${themeId}/theme.json`, content: themeText },
    { relPath: `packages/theme/themes/${themeId}/semantics.json`, content: semanticsText },
  ];

  // The `default` theme is both the build-time root theme and the `theme-default` copy.
  if (themeId === "default") {
    targets.unshift(
      { relPath: "packages/theme/theme.json", content: themeText },
      { relPath: "packages/theme/semantics.json", content: semanticsText },
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
