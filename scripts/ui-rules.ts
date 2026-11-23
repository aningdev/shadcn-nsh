/**
 * The component rules `docs/ARCHITECTURE.md` P8 states: no theme geometry picked by name
 * (`Record<Controls>`, `controls()`), no theme-name comparison, no colour literal outside a theme
 * role, and no state colour written into a Tailwind class. The rules and the two markers
 * (`// color: <why>`, `// state: <why>`) live in `scripts/ui-rules/rules.ts`.
 *
 *   bun scripts/ui-rules.ts
 *
 * Run by `bun run check`.
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "./port/lib";
import { violations } from "./ui-rules/rules";

const ui = path.join(repo, "packages/ui");

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });

const problems = walk(ui).flatMap((file) =>
  violations(fs.readFileSync(file, "utf8"), path.relative(repo, file)),
);

const advice: Record<(typeof problems)[number]["rule"], string> = {
  controls: "pick a control dimension with `control()`, not a theme's whole geometry",
  "theme-name": "read what the theme states (a dimension, a finish), not which theme it is",
  colour: "read a theme role (`colors.*`, `finish.*`), or mark the line `// color: <why>`",
  state: "use `hoverStyle` / `activeStyle` / `hovered()`, or mark the line `// state: <why>`",
};

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(
      `${problem.file}:${problem.line}:${problem.column}: ${problem.rule}: \`${problem.text}\` — ${advice[problem.rule]}`,
    );
  }
  console.error(
    `\nui rules: ${problems.length} violation(s) in packages/ui (docs/ARCHITECTURE.md P8)`,
  );
  process.exit(1);
}
console.log(
  "ui rules: OK — no theme preset or name in a component, colours from theme roles or marked `// color:`",
);
