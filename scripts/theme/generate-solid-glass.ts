/**
 * Writes `packages/theme/themes/solid-glass/theme.json` and `semantics.json` from the Solid Glass
 * stylesheet (`solid-glass.ts`): the two data files of the third theme the demos can switch to.
 *
 *   bun scripts/theme/generate-solid-glass.ts      # writes them, prints the palette's sRGB
 *
 * The values are quoted from `deeplethe/solid-glass` in `solid-glass.ts` and written as canonical
 * `oklch()`, the form every theme file here holds (`scripts/theme/oklch.ts`); the report below
 * prints what each one lands on in sRGB, which is how a value can be read against the original.
 * The keys and their order come from the default `packages/theme/theme.json` and
 * `semantics.json`, so the three sets stay comparable (`themes.test.ts` checks it).
 *
 * Not part of the check pipeline: it writes a theme, so it runs when the material is re-read, not
 * on every check.
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { oklch, toOklchText } from "./oklch";
import { themeFiles } from "./solid-glass";
import { semanticsWithStyle } from "./style";
import { mergeFinishes, type SplitFinishes } from "./tokens";

const theme = path.join(repo, "packages", "theme");
const outDir = path.join(theme, "themes", "solid-glass");
const read = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(theme, file), "utf8"));

const defaults = read("theme.json") as {
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};
const semantics = read("semantics.json") as Record<string, unknown> & {
  finishes: SplitFinishes<Record<string, unknown>>;
};

/** Every string of a document in canonical `oklch()`, as `to-oklch.ts` does for the default files. */
const canonical = (value: unknown): unknown => {
  if (typeof value === "string") return toOklchText(value);
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));
  }
  return value;
};

const files = themeFiles({
  theme: defaults.cssVars.theme,
  light: defaults.cssVars.light,
  dark: defaults.cssVars.dark,
  lightFinishes: mergeFinishes(semantics.finishes, "light"),
  darkFinishes: mergeFinishes(semantics.finishes, "dark"),
});

fs.mkdirSync(outDir, { recursive: true });
const write = (name: string, value: unknown) =>
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(canonical(value), null, 2)}\n`);
write("theme.json", files.theme);
write("semantics.json", semanticsWithStyle(files.semantics, semantics));
console.log(`wrote ${path.relative(repo, outDir)}/{theme,semantics}.json`);

/** Every distinct `oklch()` a file holds, in the order it first appears. */
function colors(value: unknown, seen = new Set<string>()): string[] {
  if (typeof value === "string") {
    for (const match of value.matchAll(/oklch\([^()]*\)/g))
      if (!/^oklch\(\s*from\b/i.test(match[0])) seen.add(match[0]);
  } else if (Array.isArray(value)) {
    for (const item of value) colors(item, seen);
  } else if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) colors(item, seen);
  }
  return [...seen];
}

const palette = colors(canonical(files));
console.log(`\nwhat the material's oklch() lands on in sRGB (${palette.length} distinct values):`);
for (const value of palette) console.log(`  ${value.padEnd(32)} ${oklch(value)}`);
