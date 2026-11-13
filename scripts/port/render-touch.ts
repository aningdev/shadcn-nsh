/**
 * The touch half of the render check: runs `render-touch.test.tsx` on the iOS simulator, where
 * the page measures a finger's idiom (a headless browser always measures a fine pointer). Needs
 * Xcode's iPhone simulator; the run says so and stops when none is available.
 *
 *   bun scripts/port/render-touch.ts [--only <id,...>] [--filter <name>]
 *
 * `--only` runs the pages of the ids named (matched whole: the test names carry `id=`), the way
 * the pointer pass does.
 *
 * The screenshots land in the same `shots/` as the pointer pass, as `<id>-touch-<scheme>.png`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { catalog } from "../catalog";
import { repo } from "./lib";

const demos = catalog().paths.demos;
const shots = path.join(demos, "shots");
fs.mkdirSync(shots, { recursive: true });

/** The ids `--only` names, validated; and the arguments `nsh test` takes besides them. */
const onlyAt = process.argv.indexOf("--only");
const only =
  onlyAt >= 0
    ? (process.argv[onlyAt + 1] ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : undefined;
if (onlyAt >= 0 && (!only || only.length === 0)) {
  console.error("render-touch: --only takes a comma-separated list of ids");
  process.exit(1);
}
const unknown = (only ?? []).filter((id) => !catalog().components.some((c) => c.id === id));
if (unknown.length > 0) {
  console.error(`render-touch: no component is called ${unknown.join(", ")}`);
  process.exit(1);
}
const passthrough = process.argv.slice(2).filter((arg, index, all) => {
  if (arg === "--only") return false;
  return all[index - 1] !== "--only";
});

// An installed CLI finds its runtimes next to `bin/nsh`, so nothing sets `NSH_RUNTIME`
// here; a caller that sets it still gets it through `process.env`.
const env = { ...process.env };

// The touch render check, then the appearance check (a page switched to dark at run time).
let status = 0;
const files: { file: string; filter?: string }[] = only
  ? only.map((id) => ({ file: "render-touch.test.tsx", filter: `id=${id}:` }))
  : [{ file: "render-touch.test.tsx" }];
// The appearance check is the same page in two appearances, not a pair of pages: `--only` runs
// it whole (it is one test per page the table names).
files.push({ file: "appearance-touch.test.tsx" });
for (const { file, filter } of files) {
  if (status !== 0) break;
  const result = spawnSync(
    "nsh",
    ["test", file, "--target", "ios", ...(filter ? ["--filter", filter] : passthrough)],
    { cwd: demos, stdio: "inherit", env },
  );
  if (result.error) {
    console.error(`port:render:touch: cannot run nsh: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) status = result.status ?? 1;
}
console.log(`touch screenshots: ${path.relative(repo, shots)}`);
console.log("one page of them all: bun run port:sheet");
process.exit(status);
