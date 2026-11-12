/**
 * The touch half of the render check: runs `render-touch.test.tsx` on the iOS simulator, where
 * the page measures a finger's idiom (a headless browser always measures a fine pointer). Needs
 * Xcode's iPhone simulator; the run says so and stops when none is available.
 *
 *   bun scripts/port/render-touch.ts [--filter <name>]
 *
 * The screenshots land in the same `shots/` as the pointer pass, as `<id>-touch-<scheme>.png`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { portPaths, readMap, repo } from "./lib";

const demos = portPaths(readMap()).demos;
const shots = path.join(demos, "shots");
fs.mkdirSync(shots, { recursive: true });

// An installed CLI finds its runtimes next to `bin/nsh`, so nothing sets `NSH_RUNTIME`
// here; a caller that sets it still gets it through `process.env`.
const env = { ...process.env };

// The touch render check, then the appearance check (a page switched to dark at run time).
let status = 0;
for (const file of ["render-touch.test.tsx", "appearance-touch.test.tsx"]) {
  const result = spawnSync("nsh", ["test", file, "--target", "ios", ...process.argv.slice(2)], {
    cwd: demos,
    stdio: "inherit",
    env,
  });
  if (result.error) {
    console.error(`port:render:touch: cannot run nsh: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) status = result.status ?? 1;
}
console.log(`touch screenshots: ${path.relative(repo, shots)}`);
console.log("one page of them all: bun run port:sheet");
process.exit(status);
