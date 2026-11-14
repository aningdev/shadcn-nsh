/**
 * The port's gate. Fails when:
 *   1. the upstream checkout is not at the commit `port-map.json` pins;
 *   2. an upstream file or declaration is neither ported, pending nor excluded (with a reason),
 *      the map names a declaration or file upstream does not have, or a route points at no file;
 *   3. upstream changed a declaration we have a destination for since the map was reviewed
 *      (`upstream.reviewed`): the changes are listed, and `bun run port:review` marks them read;
 *   4. a scaffold still holds `TODO(port)`.
 *
 * It does **not** compare a region with upstream: the components are this library's, and a look
 * may differ on purpose (`docs/ARCHITECTURE.md`, `docs/port.md`).
 *
 * Warns when the commit `nsh --version` prints is not the baseline: the baseline follows the
 * installed CLI, and the nightly moves on its own, so that is a `bun run port:bump` reminder rather
 * than a failure (docs/toolchain.md).
 *
 *   bun scripts/port/check.ts            # the gate
 *   bun scripts/port/check.ts --status   # also list what is pending, by file
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { catalog } from "../catalog";
import { auditMap, upstreamChanges, upstreamHead } from "./changes";
import { readMap, repo } from "./lib";

const map = readMap();
const problems: string[] = [];
const warnings: string[] = [];

// 1. The pinned commit.
const head = upstreamHead();
if (head !== map.upstream.commit) {
  problems.push(
    `upstream is at ${head.slice(0, 8)}, the map pins ${map.upstream.commit.slice(0, 8)}`,
  );
}

// The installed CLI against the baseline. It never fails the gate in either direction
// (older or newer): the baseline is whatever the installed CLI prints, and the nightly
// moves on its own — `bun run port:bump` is how the two agree again.
const version = (spawnSync("nsh", ["--version"], { encoding: "utf8" }).stdout ?? "").trim();
const installed = /\(([0-9a-f]{7,})/.exec(version)?.[1];
if (!installed) {
  warnings.push(
    `no nsh CLI on PATH (${version || "not found"}): install it with 'curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly' (docs/toolchain.md)`,
  );
} else if (!map.upstream.commit.startsWith(installed)) {
  warnings.push(
    `installed nightly ${installed} differs from baseline ${map.upstream.commit.slice(0, 7)}: run \`bun run port:bump\``,
  );
}

// 2. Every upstream file and declaration is accounted for, and nothing else is.
const audit = auditMap(map);
problems.push(...audit.gaps);

// 3. Upstream's changes since the reviewed commit. Only meaningful at the baseline: elsewhere
//    the working tree is not what `upstream.commit` names.
let review: ReturnType<typeof upstreamChanges> | null = null;
if (head === map.upstream.commit) {
  try {
    review = upstreamChanges(map);
  } catch (error) {
    problems.push((error as Error).message);
  }
}

// Skeletons leave `TODO(port)` until the shell / demos / docs are filled in.
function walkTodos(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "shots" || entry.name === "node_modules" || entry.name === ".nsh")
        continue;
      walkTodos(abs);
      continue;
    }
    if (!/\.(tsx?|md|json)$/.test(entry.name)) continue;
    const text = fs.readFileSync(abs, "utf8");
    if (text.includes("TODO(port)")) {
      problems.push(`${path.relative(repo, abs)}: unfinished TODO(port)`);
    }
  }
}
for (const root of catalog().paths.todoRoots) walkTodos(root);

const { counts } = audit;
const total = counts.ported + counts.owned + counts.pending + counts.excluded;
console.log(
  `port: ${counts.ported} ported, ${counts.owned} owned, ${counts.pending} pending, ${counts.excluded} excluded (${total} upstream items at ${map.upstream.commit.slice(0, 8)})`,
);
if (process.argv.includes("--status")) {
  for (const [file, entry] of Object.entries(map.files)) {
    if (entry.pending === true) console.log(`  pending  ${file}`);
  }
  for (const [file, names] of audit.pendingByFile) {
    if (map.files[file].pending !== true) console.log(`  pending  ${file}: ${names.join(", ")}`);
  }
}

if (review && review.items.length > 0) {
  console.error(
    `\nport: upstream changed ${review.items.length} declaration(s) we have a destination for, since ${review.reviewed.slice(0, 8)}:`,
  );
  for (const item of review.items) {
    console.error(`  ${item.kind.padEnd(7)} ${item.file}: ${item.name} → ${item.target}`);
  }
  console.error(
    "port: review these (the look is ours: adopt a change by editing the code), then `bun run port:review`",
  );
  process.exitCode = 1;
}
if (warnings.length > 0) {
  for (const warning of warnings) console.error(`port: warning — ${warning}`);
}
if (problems.length > 0) {
  for (const problem of problems) console.error(`port: ${problem}`);
  process.exit(1);
}
