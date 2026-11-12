/**
 * Runs the render check (`<root>/demos/render.test.tsx`) in a headless browser. The test writes
 * its screenshots to `shots/` beside it, relative to the directory it runs in, so it runs there.
 *
 *   bun scripts/port/render.ts [--filter <name>]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { portPaths, readMap, repo } from "./lib";

const demos = portPaths(readMap()).demos;
const shots = path.join(demos, "shots");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });

// A CLI built with `install.sh --source` looks for runtimes under its checkout. Prefer an
// installed runtime tree (`~/.nsh/runtime`) when present so `port:render` does not rebuild wasm.
const env = { ...process.env };
if (!env.NSH_RUNTIME) {
  const installed = path.join(process.env.HOME ?? "", ".nsh", "runtime");
  if (fs.existsSync(path.join(installed, "web"))) env.NSH_RUNTIME = installed;
}

const result = spawnSync(
  "nsh",
  ["test", "render.test.tsx", "--target", "web", ...process.argv.slice(2)],
  { cwd: demos, stdio: "inherit", env },
);
console.log(`screenshots: ${path.relative(repo, shots)}`);
process.exit(result.status ?? 1);
