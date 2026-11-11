/**
 * Runs the render check (`<root>/demos/render.test.tsx`) in a headless browser. The test writes
 * its screenshots to `shots/` beside it, relative to the directory it runs in, so it runs there.
 *
 *   bun scripts/port/render.ts [--filter <name>]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { readMap, repo } from "./lib";

const demos = path.join(repo, readMap().root, "demos");
const shots = path.join(demos, "shots");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });

const result = spawnSync(
  "nsh",
  ["test", "render.test.tsx", "--target", "web", ...process.argv.slice(2)],
  { cwd: demos, stdio: "inherit" },
);
console.log(`screenshots: ${path.relative(repo, shots)}`);
process.exit(result.status ?? 1);
