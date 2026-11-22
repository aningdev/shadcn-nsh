/**
 * Writes `packages/theme/tokens/themes/winui/` (DTCG 2025.10 source) from the WinUI 3
 * (Windows 11) palette and metrics in `winui.ts`, and compiles
 * `packages/theme/themes/winui/{theme,semantics}.json` via `tokens:build`.
 *
 *   bun scripts/theme/generate-winui.ts
 */
import { emitDtcgTheme } from "./dtcg";
import { winuiDtcgOutput } from "./winui";

const { sourceFiles, builtFiles } = emitDtcgTheme(winuiDtcgOutput());
console.log(`wrote ${sourceFiles.length} DTCG files under packages/theme/tokens/themes/winui/`);
for (const file of builtFiles) console.log(`compiled ${file}`);
