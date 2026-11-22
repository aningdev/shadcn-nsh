/**
 * Writes `packages/theme/themes/winui/theme.json` and `semantics.json` from the WinUI 3
 * (Windows 11 / Fluent 2) palette and metrics in `winui.ts`.
 *
 *   bun scripts/theme/generate-winui.ts
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { mergeFinishes, type SplitFinishes } from "./tokens";
import { winuiThemeFiles } from "./winui";

const theme = path.join(repo, "packages", "theme");
const outDir = path.join(theme, "themes", "winui");
const read = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(theme, file), "utf8"));

const defaults = read("theme.json") as {
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};
const semantics = read("semantics.json") as {
  finishes: SplitFinishes<Record<string, unknown>>;
};

const files = winuiThemeFiles({
  theme: defaults.cssVars.theme,
  light: defaults.cssVars.light,
  dark: defaults.cssVars.dark,
  lightFinishes: mergeFinishes(semantics.finishes, "light"),
  darkFinishes: mergeFinishes(semantics.finishes, "dark"),
});

fs.mkdirSync(outDir, { recursive: true });
const write = (name: string, value: unknown) =>
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
write("theme.json", files.theme);
write("semantics.json", files.semantics);
console.log(`wrote ${path.relative(repo, outDir)}/{theme,semantics}.json`);
