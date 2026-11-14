/**
 * Rewrites the default theme files (`packages/theme/theme.json`, `finishes.json`) so every color
 * is canonical `oklch()`: tokens, gradients, shadows, `color-mix()` innards. NSH reads `oklch()`
 * wherever a color is a string, and the alternative themes (`themes/shadcn/`) are generated in
 * that form, so the default theme is written the same way.
 *
 *   bun scripts/theme/to-oklch.ts          # rewrites them in place, prints what changed
 *
 * Idempotent: a file already in the form is written back unchanged (`themes.test.ts` asserts
 * each file is its own fixed point). The conversion is lossless — `oklch.ts` lands every value
 * back on the same 8-bit channels — so no color moves.
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { toOklchText } from "./oklch";

const theme = path.join(repo, "packages", "theme");
const files = ["theme.json", "finishes.json"];

/** Every string in a JSON document, its colors converted; keys and numbers stay as they are. */
const convert = (value: unknown): unknown => {
  if (typeof value === "string") return toOklchText(value);
  if (Array.isArray(value)) return value.map(convert);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, convert(item)] as const),
    );
  }
  return value;
};

let changed = 0;
for (const name of files) {
  const file = path.join(theme, name);
  const before = fs.readFileSync(file, "utf8");
  const after = `${JSON.stringify(convert(JSON.parse(before)), null, 2)}\n`;
  if (after !== before) changed += 1;
  fs.writeFileSync(file, after);
  console.log(`${path.relative(repo, file)}: ${after === before ? "unchanged" : "rewritten"}`);
}
console.log(changed === 0 ? "already oklch()" : `${changed} file(s) rewritten`);
