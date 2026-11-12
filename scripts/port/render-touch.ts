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

const env = { ...process.env };
if (!env.NSH_RUNTIME) {
  const installed = path.join(process.env.HOME ?? "", ".nsh", "runtime");
  if (fs.existsSync(path.join(installed, "web"))) env.NSH_RUNTIME = installed;
}

const result = spawnSync(
  "nsh",
  ["test", "render-touch.test.tsx", "--target", "ios", ...process.argv.slice(2)],
  { cwd: demos, stdio: "inherit", env },
);
if (result.error) {
  console.error(`port:render:touch: cannot run nsh: ${result.error.message}`);
  process.exit(1);
}
console.log(`touch screenshots: ${path.relative(repo, shots)}`);
process.exit(result.status ?? 1);
