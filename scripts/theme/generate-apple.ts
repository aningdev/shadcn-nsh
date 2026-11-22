/**
 * Writes `packages/theme/tokens/themes/apple/` (DTCG 2025.10 source) from the Apple palette and
 * HIG metrics in `apple.ts`, and compiles `packages/theme/themes/apple/{theme,semantics}.json` via
 * `tokens:build`.
 *
 *   bun scripts/theme/generate-apple.ts
 */
import { appleDtcgOutput } from "./apple";
import { emitDtcgTheme } from "./dtcg";

const { sourceFiles, builtFiles } = emitDtcgTheme(appleDtcgOutput());
console.log(`wrote ${sourceFiles.length} DTCG files under packages/theme/tokens/themes/apple/`);
for (const file of builtFiles) console.log(`compiled ${file}`);
