/**
 * Writes `packages/theme/tokens/themes/solid-glass/` (DTCG 2025.10 source) from the Solid Glass
 * stylesheet (`solid-glass.ts`) and compiles `packages/theme/themes/solid-glass/{theme,semantics}.json`
 * via `tokens:build`.
 *
 *   bun scripts/theme/generate-solid-glass.ts      # emits DTCG source, compiles, prints palette sRGB
 *
 * The values are quoted from `deeplethe/solid-glass` in `solid-glass.ts` and written as DTCG color
 * objects (with `oklch` components and `hex` fallbacks); `tokens:build` compiles them into the
 * canonical `oklch()` runtime files in one command for the author.
 *
 * Not part of the check pipeline: it writes a theme, so it runs when the material is re-read, not
 * on every check.
 */
import { emitDtcgTheme } from "./dtcg";
import { oklch, toOklchText } from "./oklch";
import { themeFiles } from "./solid-glass";

/** Every string of a document in canonical `oklch()`, as `to-oklch.ts` does for the default files. */
const canonical = (value: unknown): unknown => {
  if (typeof value === "string") return toOklchText(value);
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));
  }
  return value;
};

const files = themeFiles();
const { sourceFiles, builtFiles } = emitDtcgTheme(files);
console.log(
  `wrote ${sourceFiles.length} DTCG files under packages/theme/tokens/themes/solid-glass/`,
);
for (const file of builtFiles) console.log(`compiled ${file}`);

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

const palette = colors(canonical({ cssVars: files.cssVars, finishes: files.finishes }));
console.log(`\nwhat the material's oklch() lands on in sRGB (${palette.length} distinct values):`);
for (const value of palette) console.log(`  ${value.padEnd(32)} ${oklch(value)}`);
