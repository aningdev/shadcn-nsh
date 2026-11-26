/**
 * The component rules `docs/ARCHITECTURE.md` P8 and P9 state: no theme geometry picked by name
 * (`Record<Controls>`, `controls()`), no theme-name comparison, no colour literal outside a theme
 * role, no state colour written into a Tailwind class; an import that stays inside its layer; and a
 * doc comment on every export. The rules, the two markers (`// color: <why>`, `// state: <why>`) and
 * the allowlist for the two checked conventions live in `scripts/ui-rules/rules.ts`.
 *
 *   bun scripts/ui-rules.ts
 *
 * Run by `bun run check`.
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "./port/lib";
import { allowlist, violations } from "./ui-rules/rules";

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
  controls:
    "read slot parts via `./lib/look` rather than calling `controls()` directly in components",
  "theme-name": "read what the theme states (a dimension, a finish), not which theme it is",
  colour: "read a theme role (`colors.*`, `finish.*`), or mark the line `// color: <why>`",
  state: "use `hoverStyle` / `activeStyle` / `hovered()`, or mark the line `// state: <why>`",
  layer:
    "import inside the layer: a relative path in `packages/ui` (never a component from `lib/`), " +
    "`nsh` / `nsh/base`, `@shadcn-nsh/theme` itself, or `lucide`",
  jsdoc: "say with a `/** … */` above it what the export is for",
};

/** The allowlist entry did not excuse anything: the line it was added for is fixed or gone. */
const stale = allowlist.filter((entry) => {
  const file = path.join(repo, entry.file);
  if (!fs.existsSync(file)) return true;
  return !violations(fs.readFileSync(file, "utf8"), entry.file, []).some(
    (violation) =>
      violation.rule === entry.rule && entry.match === (violation.match ?? violation.text),
  );
});

if (problems.length > 0 || stale.length > 0) {
  for (const problem of problems) {
    console.error(
      `${problem.file}:${problem.line}:${problem.column}: ${problem.rule}: \`${problem.text}\` — ${advice[problem.rule]}`,
    );
  }
  for (const entry of stale) {
    console.error(
      `${entry.file}: allowlist entry \`${entry.match}\` (${entry.rule}) excuses nothing any more ` +
        `— it was for ${entry.reason}; drop it`,
    );
  }
  console.error(
    `\nui rules: ${problems.length} violation(s) in packages/ui (docs/ARCHITECTURE.md P8, P9)`,
  );
  process.exit(1);
}
console.log(
  "ui rules: OK — no theme preset or name in a component, colours from theme roles or marked " +
    "`// color:`, imports inside their layer, every export documented",
);
