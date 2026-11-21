/**
 * Writes `packages/theme/themes/apple/theme.json` and `finishes.json` from the Apple palette and
 * HIG metrics in `apple.ts`.
 *
 *   bun scripts/theme/generate-apple.ts
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { themeFiles } from "./apple";

const theme = path.join(repo, "packages", "theme");
const outDir = path.join(theme, "themes", "apple");
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
  press: unknown;
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
write("finishes.json", {
  press: files.finishes.press,
  ...files.finishes.style,
  dark: files.finishes.dark,
  light: files.finishes.light,
});
console.log(`wrote ${path.relative(repo, outDir)}/{theme,finishes}.json`);
