/**
 * Right-to-left: `packages/ui` writes an asymmetric side in NSH's start/end form, so a component
 * mirrors under `direction: "rtl"` instead of keeping its left/right physically. A symmetric pair
 * (`left: 0, right: 0`) and an object marked `// physical: <why>` (anchored to the screen, not the
 * reading direction) are the two exceptions; the rule lives in `scripts/rtl/rules.ts`.
 *
 *   bun scripts/rtl-lint.ts
 *
 * Run by `bun run check`.
 */
import fs from "node:fs";
import path from "node:path";

import { violations } from "./rtl/rules";

const repo = path.resolve(import.meta.dir, "..");

const ui = path.join(repo, "packages/ui");

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

const problems = walk(ui).flatMap((file) =>
  violations(fs.readFileSync(file, "utf8"), path.relative(repo, file)).map((problem) => {
    const place = `${problem.file}:${problem.line}:${problem.column}`;
    return (
      `${place}: \`${problem.property}\` keeps its physical side; write \`${problem.suggestion}\` ` +
      `so it mirrors, or mark the object \`// physical: <why>\` (line ${problem.objectLine})`
    );
  }),
);

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  console.error(
    `\nrtl: ${problems.length} side(s) do not follow the reading direction (docs/ARCHITECTURE.md)`,
  );
  process.exit(1);
}
console.log("rtl: OK — asymmetric sides use start/end, or say why they are physical");
