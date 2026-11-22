/**
 * Writes `packages/theme/tokens/themes/material/` (DTCG 2025.10 source) from the Material 3
 * Expressive palette and metrics in `m3.ts`, and compiles
 * `packages/theme/themes/material/{theme,semantics}.json` via `tokens:build`.
 *
 *   bun scripts/theme/generate-material.ts
 */
import { emitDtcgTheme } from "./dtcg";
import { m3DtcgOutput } from "./m3";

const { sourceFiles, builtFiles } = emitDtcgTheme(m3DtcgOutput());
console.log(`wrote ${sourceFiles.length} DTCG files under packages/theme/tokens/themes/material/`);
for (const file of builtFiles) console.log(`compiled ${file}`);
