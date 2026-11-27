/**
 * One-way compiler from Theme v5 TS specs (`packages/theme/themes/`) to:
 * - `theme.json` (NSH runtime CSS vars, always including `font-sans` / `font-mono`)
 * - `{light,dark}.tokens.json` (W3C DTCG 2025.10 exports)
 * - `DESIGN.md` (Google Labs DESIGN.md spec)
 *
 *   bun run tokens:build
 *   bun run tokens:build --check
 */
import fs from "node:fs";
import path from "node:path";

import type { AppTheme } from "../../packages/theme/schema";
import { ALL_THEMES, BUILD_ROOT_THEME } from "../../packages/theme/themes";
import { exportDesignMd, exportDtcgTokens } from "./export";

const defaultRepoRoot = path.resolve(import.meta.dir, "..", "..");

export interface CompiledTarget {
  readonly relPath: string;
  readonly content: string;
}

/** Build compiled targets for one `AppTheme`. */
export function buildThemeTargets(entry: AppTheme): CompiledTarget[] {
  const themeText = `${JSON.stringify(entry.theme, null, 2)}\n`;
  const lightTokensText = `${JSON.stringify(exportDtcgTokens(entry, "light"), null, 2)}\n`;
  const darkTokensText = `${JSON.stringify(exportDtcgTokens(entry, "dark"), null, 2)}\n`;
  const designMdText = exportDesignMd(entry);

  const targets: CompiledTarget[] = [
    { relPath: `packages/theme/themes/${entry.id}/theme.json`, content: themeText },
    { relPath: `packages/theme/themes/${entry.id}/light.tokens.json`, content: lightTokensText },
    { relPath: `packages/theme/themes/${entry.id}/dark.tokens.json`, content: darkTokensText },
    { relPath: `packages/theme/themes/${entry.id}/DESIGN.md`, content: designMdText },
  ];

  if (entry.id === BUILD_ROOT_THEME) {
    targets.unshift(
      { relPath: "packages/theme/theme.json", content: themeText },
      { relPath: "packages/theme/light.tokens.json", content: lightTokensText },
      { relPath: "packages/theme/dark.tokens.json", content: darkTokensText },
      { relPath: "packages/theme/DESIGN.md", content: designMdText },
    );
  }

  return targets;
}

export function* allTargets(): Generator<CompiledTarget> {
  for (const theme of ALL_THEMES) yield* buildThemeTargets(theme);
}

export function buildAllTokens(repoRoot = defaultRepoRoot): {
  themes: string[];
  written: string[];
  unchanged: string[];
} {
  const themes = ALL_THEMES.map((t) => t.id);
  const written: string[] = [];
  const unchanged: string[] = [];

  for (const target of allTargets()) {
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

export function checkAllTokens(repoRoot = defaultRepoRoot): {
  themes: string[];
  problems: string[];
} {
  const themes = ALL_THEMES.map((t) => t.id);
  const problems: string[] = [];

  for (const target of allTargets()) {
    const abs = path.join(repoRoot, target.relPath);
    if (!fs.existsSync(abs)) {
      problems.push(`${target.relPath} is missing`);
      continue;
    }
    if (fs.readFileSync(abs, "utf8") !== target.content) {
      problems.push(`${target.relPath} differs from what packages/theme/themes builds`);
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
      console.error("tokens:build: run `bun run tokens:build` to regenerate theme artifacts");
      process.exit(1);
    }
    console.log(`tokens:build ok — ${themes.length} themes (${themes.join(", ")}) up to date`);
  } else {
    const { themes, written, unchanged } = buildAllTokens();
    for (const file of written) console.log(`tokens:build: wrote ${file}`);
    console.log(
      `tokens:build ok — ${themes.length} themes (${themes.join(", ")}), ${written.length} written, ${unchanged.length} unchanged`,
    );
  }
}
