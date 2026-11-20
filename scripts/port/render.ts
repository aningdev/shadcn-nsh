/**
 * Runs the render check (`<root>/demos/render.test.tsx`) in a headless browser. The test writes
 * its screenshots to `shots/` beside it, relative to the directory it runs in, so it runs there.
 *
 *   bun scripts/port/render.ts [--only <id,...>] [--changed [<ref>]] [--shard <i>/<n>] [--jobs <n>]
 *                              [--filter <name>] [--no-baseline]
 *
 * `--only` runs the pages of the ids named (a comma-separated list of catalog ids, matched
 * whole: `--only table` leaves `data-table` alone), which is what a family's change needs. The
 * test names carry `id=` so `nsh test`'s substring `--filter` can name one alone.
 * `--changed` narrows the same list to the pages the diff since `<ref>` (default `origin/main`)
 * reaches (`scripts/port/affected.ts`); with `--only` it keeps the pages both name. Neither flag
 * runs the whole table. `--shard i/n` then keeps every n-th of those pages (CI's runners split the
 * table this way, `.github/workflows/check.yml`).
 *
 * The pages are drawn by a pool of `nsh test` processes, one id each, `--jobs` at a time (default:
 * half the cores, at most six; `--jobs 1` is one process for the whole table, the run as it was).
 * `--filter` names pages `nsh test` picks itself, so it stays a single process.
 * `--no-baseline` skips the comparison with `baseline/`, which was recorded on macOS: another
 * platform draws text differently, so there only the component ↔ reference pairs are a gate.
 *
 * The pictures are compared here, after the test, which only takes them: byte for byte, or
 * within a page's `tolerance` (the avatar's circular photos) or the antialiasing budget every
 * page shares (`render-cases.ts`). A difference beyond that fails the gate.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { catalog } from "../catalog";
import { changedIds, narrowed } from "./affected";
import { repo } from "./lib";
import {
  comparePairs,
  jobCount,
  onlyIds,
  shardIds,
  runPages,
  softwareBrowser,
  testArgs,
} from "./render-shared";

const demos = catalog().paths.demos;

const only = onlyIds();
const changed = changedIds("render");
/** The pages to draw: `--only` and `--changed` both narrow, and together they intersect. */
const ids = shardIds(narrowed(only, changed));
if (ids?.length === 0) {
  console.log("render: nothing to draw");
  process.exit(0);
}
/** The same list for `baseline.ts`: it re-records (or checks) those pictures alone. */
const onlyArg = ids ? ["--only", ids.join(",")] : [];
const shots = path.join(demos, "shots");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });

// An installed CLI finds its runtimes next to `bin/nsh`, so nothing sets `NSH_RUNTIME`
// here; a caller that sets it still gets it through `process.env`.
const env = { ...process.env };

const browserScript = softwareBrowser();
const args = testArgs();
let status: number;
try {
  status = await runPages({
    pass: "render",
    testFile: "render.test.tsx",
    cwd: demos,
    env,
    ids,
    args,
    browser: browserScript.script,
    jobs: jobCount(),
  });
} finally {
  browserScript.done();
}
console.log(`screenshots: ${path.relative(repo, shots)}`);
console.log("one page of them all: bun run port:sheet");

const differs =
  status === 0
    ? comparePairs({
        pass: "render",
        shots,
        name: (id, scheme) => `${id}-pointer-${scheme}`,
        only: ids,
      })
    : 0;

if (differs > 0) process.exit(1);
// A filtered run holds only some of the shots, so it cannot be compared with the whole baseline;
// a narrowed run (`--only`, `--changed`, `--shard`) holds exactly the ids it names, which `baseline.ts`
// checks on their own.
if (status === 0) {
  if (args.includes("--filter")) {
    console.log("baseline: skipped for a filtered run");
  } else if (process.argv.includes("--no-baseline")) {
    console.log("baseline: skipped (--no-baseline)");
  } else {
    const compare = spawnSync("bun", [path.join(import.meta.dir, "baseline.ts"), ...onlyArg], {
      cwd: repo,
      stdio: "inherit",
    });
    if ((compare.status ?? 1) !== 0) process.exit(compare.status ?? 1);
  }
}
process.exit(status);
