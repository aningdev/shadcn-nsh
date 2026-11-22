/**
 * Writes `packages/theme/tokens/themes/shadcn/` (DTCG 2025.10 source) from the shadcn default
 * theme and compiles `packages/theme/themes/shadcn/{theme,semantics}.json` via `tokens:build`.
 *
 *   bun scripts/theme/generate-shadcn.ts          # emits DTCG source, compiles, prints palette sRGB
 *
 * The values are quoted from `references/shadcn-ui` in `shadcn.ts` and written as DTCG color
 * objects (with `oklch` components and `hex` fallbacks); `tokens:build` compiles them into the
 * canonical `oklch()` runtime files in one command for the author.
 *
 * Not part of the check pipeline: it reads `references/` (read-only) and writes a theme, so it
 * runs when the shadcn baseline is re-read, not on every check.
 */
import { emitDtcgTheme } from "./dtcg";
import { conversionTable, themeFiles } from "./shadcn";

const { sourceFiles, builtFiles } = emitDtcgTheme(themeFiles());
console.log(`wrote ${sourceFiles.length} DTCG files under packages/theme/tokens/themes/shadcn/`);
for (const file of builtFiles) console.log(`compiled ${file}`);

const table = conversionTable();
console.log(`\nwhat the palette's oklch() lands on in sRGB (${table.length} distinct values):`);
for (const row of table) console.log(`  ${row.oklch.padEnd(28)} ${row.hex}`);
