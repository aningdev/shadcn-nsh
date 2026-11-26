/**
 * Children read once: each read of `props.children` builds the children again (new native views),
 * so a control reads them once, in the place where the children go — through `AsText`
 * (`packages/ui/lib/utils.tsx`), a component whose props are getters, where a string child is
 * drawn as a `Text`. Every component under `packages/ui` and `packages/ui/lib` is checked; the
 * rule lives in `scripts/children/rules.ts`.
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
        `them again; read them once in the component's own body (a \`children-lint:\` comment ` +
        `sanctions the one place a read must sit there)`
      );
    }
    return (
      `${place}: \`${problem.where}\` reads its children ${problem.reads} times; read them once ` +
      `where they are drawn (docs/ARCHITECTURE.md)`
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
