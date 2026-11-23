/**
 * Writes the draft a new component starts from: the declarations the pinned upstream routes to its
 * file, dropped in under its imports, as `port-map.json` says. A file that already declares one of
 * them has been drafted and is left alone, because the look is this library's now
 * (`docs/ARCHITECTURE.md`): a change upstream made is adopted by editing the code, not by drafting
 * it again.
 *
 *   bun scripts/port/vendor.ts           # the draft of every file that has none yet
 *   bun scripts/port/vendor.ts <id>      # one component: its file, and a lib file it needs whole
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  declarations,
  defaultUiRel,
  insertDraft,
  isSource,
  readMap,
  repo,
  routed,
  targetPath,
  targets,
} from "./lib";

const map = readMap();
const id = process.argv[2];
if (id !== undefined && !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error(`port:vendor: an id is kebab-case, got ${id}`);
  process.exit(1);
}
/**
 * A component's draft: its own file, plus a lib file that is one upstream file's whole destination
 * (never a file some symbols of that file are routed to, which belongs to another component).
 */
const libPrefix = path.posix.join(map.root, "packages/ui/lib") + "/";
const own = (target: string) => id !== undefined && target === defaultUiRel(map, id);
const inDraft = (upstream: string, target: string) =>
  own(target) || (target.startsWith(libPrefix) && map.files[upstream]?.to === target);

const written = new Set<string>();
let drafted = 0;
let settled = 0;
let ownTargets = 0;

for (const [upstream, entry] of Object.entries(map.files)) {
  if (id === undefined && entry.owned) {
    console.log(`own    ${upstream} → ${path.relative(repo, targetPath(map, entry.owned))}`);
  }
}

for (const { upstream, target } of targets(map)) {
  if (!inDraft(upstream, target) || !isSource(target)) continue;
  if (own(target)) ownTargets += 1;
  const file = targetPath(map, target);
  const rel = path.relative(repo, file);
  if (!fs.existsSync(file)) {
    console.error(`${rel}: missing (create it with port:new, which writes its header)`);
    process.exitCode = 1;
    continue;
  }
  const current = fs.readFileSync(file, "utf8");
  const have = new Set(declarations(rel, current).flatMap((declaration) => declaration.names));
  const want = routed(map, upstream, target);
  const held = want.filter((one) => have.has(one.name));
  // One declaration of the upstream's in the file means the file was drafted: leave its look alone.
  if (held.length > 0 || want.length === 0) {
    settled += 1;
    continue;
  }
  fs.writeFileSync(file, insertDraft(current, want.map((one) => one.text).join("\n\n")));
  written.add(file);
  drafted += want.length;
  console.log(`draft  ${upstream} → ${rel} (${want.length})`);
}

if (id !== undefined && ownTargets === 0) {
  console.error(`port:vendor: no target is the draft of ${id}`);
  process.exit(1);
}
if (written.size > 0) {
  spawnSync("vp", ["fmt", ...[...written]], { cwd: repo, stdio: "inherit" });
  console.log(
    `port:vendor: drafted ${drafted} declaration(s) into ${written.size} file(s); ${settled} file(s) already held theirs`,
  );
} else {
  console.log(`port:vendor: nothing to draft (${settled} file(s) already hold their declarations)`);
}
