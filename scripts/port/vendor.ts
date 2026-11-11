/**
 * Fills the ported regions and copies from the pinned upstream, as `port-map.json` routes them.
 * Ported code is produced here, never typed by hand:
 *
 *   bun scripts/port/vendor.ts        # then `vp fmt` on what it wrote
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { readMap, regions, renderRegion, repo, targetPath, upstreamDir, writeRegion } from "./lib";

const map = readMap();
const written = new Set<string>();

for (const [upstream, entry] of Object.entries(map.files)) {
  if (!entry.copy) continue;
  const to = targetPath(map, entry.copy);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(upstreamDir(map), upstream), to);
  written.add(to);
  console.log(`copy   ${upstream} → ${path.relative(repo, to)}`);
}

for (const { upstream, target } of regions(map)) {
  const file = targetPath(map, target);
  if (!fs.existsSync(file)) {
    console.error(
      `${path.relative(repo, file)}: missing (write it with a "// @port ${upstream}" region)`,
    );
    process.exitCode = 1;
    continue;
  }
  const { body, names } = renderRegion(map, upstream, target);
  try {
    fs.writeFileSync(file, writeRegion(fs.readFileSync(file, "utf8"), upstream, body));
  } catch (error) {
    console.error(`${path.relative(repo, file)}: ${(error as Error).message}`);
    process.exitCode = 1;
    continue;
  }
  written.add(file);
  console.log(`region ${upstream} → ${path.relative(repo, file)} (${names.length})`);
}

if (written.size > 0) {
  spawnSync("vp", ["fmt", ...written], { cwd: repo, stdio: "inherit" });
}
