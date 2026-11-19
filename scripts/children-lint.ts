/**
 * Children read once: each read of `props.children` builds the children again (new native views),
 * so a control reads them once — through `childrenOf` when it needs them for more than one thing.
 * Every component under `packages/ui` and `packages/ui/lib` is checked; the rule lives in
 * `scripts/children/rules.ts`.
 *
 *   bun scripts/children-lint.ts
 *
 * Run by `bun run check`.
 */
import fs from "node:fs";
import path from "node:path";

import { files, violations } from "./children/rules";
import { repo } from "./port/lib";

const FILES = files(repo);

const problems = FILES.flatMap((file) => {
  const full = path.join(repo, file);
  if (!fs.existsSync(full)) {
    return [`${file}: listed in scripts/children/rules.ts but missing`];
  }
  return violations(fs.readFileSync(full, "utf8"), file).map((problem) => {
    const place = `${problem.file}:${problem.line}:${problem.column}`;
    if (problem.kind === "nested") {
      return (
        `${place}: \`${problem.where}\` reads its children inside a function, so each call reads ` +
        `them again; read them once in the component's own body`
      );
    }
    return (
      `${place}: \`${problem.where}\` reads its children ${problem.reads} times; read them once ` +
      `and share it with \`childrenOf\` (packages/ui/lib/children.ts)`
    );
  });
});

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  console.error(
    `\nchildren: ${problems.length} read(s) build the children more than once (docs/ARCHITECTURE.md)`,
  );
  process.exit(1);
}
console.log(`children: OK — ${FILES.length} controls read their children once`);
