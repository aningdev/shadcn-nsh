/**
 * Writes `packages/theme/themes/shadcn/theme.json` and `finishes.json` from the shadcn default
 * theme: the two files the experiment in `docs/specs/theme-shadcn.md` runs on.
 *
 *   bun scripts/theme/generate-shadcn.ts          # writes them, prints the oklch → hex table
 *
 * The values are quoted from `references/shadcn-ui` in `shadcn.ts` and converted with
 * `oklch.ts`; the keys and their order come from the default `packages/theme/theme.json` and
 * `finishes.json`, so the two sets stay comparable (`themes.test.ts` checks it).
 *
 * Not part of the check pipeline: it reads `references/` (read-only) and writes a theme, so it
 * runs when the shadcn baseline is re-read, not on every check.
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { conversionTable, themeFiles } from "./shadcn";

const theme = path.join(repo, "packages", "theme");
const outDir = path.join(theme, "themes", "shadcn");
const read = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(theme, file), "utf8"));

const defaults = read("theme.json") as {
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};
const finishes = read("finishes.json") as {
  light: Record<string, string>;
  dark: Record<string, string>;
};

const files = themeFiles({
  theme: defaults.cssVars.theme,
  light: defaults.cssVars.light,
  dark: defaults.cssVars.dark,
  lightFinishes: finishes.light,
  darkFinishes: finishes.dark,
});

fs.mkdirSync(outDir, { recursive: true });
const write = (name: string, value: unknown) =>
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
write("theme.json", files.theme);
write("finishes.json", files.finishes);
console.log(`wrote ${path.relative(repo, outDir)}/{theme,finishes}.json`);

const table = conversionTable();
console.log(`\noklch → sRGB (${table.length} distinct values):`);
for (const row of table) console.log(`  ${row.oklch.padEnd(28)} ${row.hex}`);
