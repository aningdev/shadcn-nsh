/**
 * Fills the **empty** port region of a new component from the pinned upstream, as `port-map.json`
 * routes it. This is the draft `port:new` starts from; a region that already holds code is never
 * touched, because the look is this library's now (`docs/ARCHITECTURE.md`): a change upstream made
 * is adopted by editing the code, not by refilling it.
 *
 *   bun scripts/port/vendor.ts           # every region still empty
 *   bun scripts/port/vendor.ts <id>      # the draft of one component: its file, and lib files still empty
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  defaultUiRel,
  readMap,
  readRegion,
  regions,
  renderRegion,
  repo,
  targetPath,
  writeRegion,
} from "./lib";

const map = readMap();
const id = process.argv[2];
if (id !== undefined && !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error(`port:vendor: an id is kebab-case, got ${id}`);
  process.exit(1);
}
/** A component's draft: its own file, plus any lib file whose region no code reached yet. */
const libPrefix = path.posix.join(map.root, "packages/ui/lib") + "/";
const own = (target: string) => id !== undefined && target === defaultUiRel(map, id);
const inDraft = (target: string) => id === undefined || own(target) || target.startsWith(libPrefix);

const written = new Set<string>();
let skipped = 0;
let ownRegions = 0;

for (const [upstream, entry] of Object.entries(map.files)) {
  if (id === undefined && entry.owned) {
    console.log(`own    ${upstream} → ${path.relative(repo, targetPath(map, entry.owned))}`);
  }
}

for (const { upstream, target } of regions(map)) {
  if (!inDraft(target)) continue;
  if (own(target)) ownRegions += 1;
  const file = targetPath(map, target);
  const rel = path.relative(repo, file);
  if (!fs.existsSync(file)) {
    console.error(`${rel}: missing (write it with a "// @port ${upstream}" region)`);
    process.exitCode = 1;
    continue;
  }
  const current = fs.readFileSync(file, "utf8");
  const region = readRegion(current, upstream);
  if (region === null) {
    console.error(`${rel}: no "// @port ${upstream}" region`);
    process.exitCode = 1;
    continue;
  }
  if (region.trim() !== "") {
    // With an id, a lib region that holds code belongs to some other component: not our draft.
    if (!id || own(target)) skipped += 1;
    continue;
  }
  const { body, names } = renderRegion(map, upstream, target);
  fs.writeFileSync(file, writeRegion(current, upstream, body));
  written.add(file);
  console.log(`region ${upstream} → ${rel} (${names.length})`);
}

if (id !== undefined && ownRegions === 0) {
  console.error(`port:vendor: no region is the draft of ${id}`);
  process.exit(1);
}
if (written.size > 0) {
  spawnSync("vp", ["fmt", ...[...written]], { cwd: repo, stdio: "inherit" });
  console.log(
    `port:vendor: filled ${written.size} file(s); ${skipped} region(s) already hold code and were left alone`,
  );
} else {
  console.log(`port:vendor: nothing to fill (${skipped} region(s) already hold code)`);
}
