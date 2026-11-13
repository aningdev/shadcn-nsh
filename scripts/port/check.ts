/**
 * The port's gate. Fails when:
 *   1. the upstream checkout is not at the commit `port-map.json` pins;
 *   2. an upstream file or declaration is neither ported, pending nor excluded (with a reason);
 *   3. a ported region or copy differs from upstream (run `bun run port:vendor`);
 *   4. the map names a file or declaration upstream does not have.
 *
 * Warns when the commit `nsh --version` prints is not the baseline: the baseline
 * follows the installed CLI, and the nightly moves on its own, so that is a
 * `bun run port:bump` reminder rather than a failure (docs/toolchain.md).
 *
 *   bun scripts/port/check.ts            # the gate
 *   bun scripts/port/check.ts --status   # also list what is pending, by file
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { catalog } from "../catalog";
import {
  declarations,
  normalize,
  readMap,
  readRegion,
  regions,
  renderRegion,
  repo,
  route,
  targetPath,
  upstreamDir,
  upstreamFiles,
  writeRegion,
} from "./lib";

const map = readMap();
const problems: string[] = [];
const warnings: string[] = [];
const counts = { ported: 0, pending: 0, excluded: 0 };
const pendingByFile = new Map<string, string[]>();

// 1. The pinned commit.
const head = spawnSync("git", ["-C", path.join(repo, "references/nsh"), "rev-parse", "HEAD"], {
  encoding: "utf8",
}).stdout.trim();
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

// 2 and 4. Every upstream file and declaration is accounted for, and nothing else is.
const files = upstreamFiles(map);
for (const file of Object.keys(map.files)) {
  if (!files.includes(file)) problems.push(`${file}: in the map, not upstream`);
}
for (const file of files) {
  const entry = map.files[file];
  if (!entry) {
    problems.push(`${file}: not in the map`);
    continue;
  }
  if (typeof entry.exclude === "string") {
    counts.excluded += 1;
    continue;
  }
  if (entry.copy) {
    counts.ported += 1;
    continue;
  }
  if (!/\.tsx?$/.test(file)) {
    if (entry.pending === true) counts.pending += 1;
    else problems.push(`${file}: not a module, so it needs "copy", "exclude" or "pending": true`);
    continue;
  }
  const source = fs.readFileSync(path.join(upstreamDir(map), file), "utf8");
  const names = declarations(file, source).map((d) => d.names[0]);
  for (const name of names) {
    const to = route(entry, name);
    if (to.kind === "unmapped") problems.push(`${file}: ${name} is not routed`);
    else if (to.kind === "pending") {
      counts.pending += 1;
      pendingByFile.set(file, [...(pendingByFile.get(file) ?? []), name]);
    } else counts[to.kind] += 1;
  }
  const mentioned = [
    ...Object.keys(entry.symbols ?? {}),
    ...Object.keys(entry.replace ?? {}),
    ...(Array.isArray(entry.pending) ? entry.pending : []),
    ...(typeof entry.exclude === "object" ? Object.keys(entry.exclude) : []),
  ];
  for (const name of mentioned) {
    if (!names.includes(name)) problems.push(`${file}: the map names ${name}, upstream has none`);
  }
}

// 3. What is ported is what upstream has.
for (const [upstream, entry] of Object.entries(map.files)) {
  if (!entry.copy || !files.includes(upstream)) continue;
  const to = targetPath(map, entry.copy);
  const theirs = fs.readFileSync(path.join(upstreamDir(map), upstream), "utf8");
  const ours = fs.existsSync(to) ? fs.readFileSync(to, "utf8") : null;
  const same =
    ours !== null &&
    (upstream.endsWith(".json")
      ? JSON.stringify(JSON.parse(ours)) === JSON.stringify(JSON.parse(theirs))
      : normalize(ours) === normalize(theirs));
  if (!same) problems.push(`${path.relative(repo, to)}: differs from upstream ${upstream}`);
}
// A region is compared as the formatter leaves it: the expected file (the regions refilled from
// upstream) is written beside the real one, formatted, and must then be the same text.
const expected = new Map<string, { file: string; text: string }>();
for (const { upstream, target } of regions(map)) {
  if (!files.includes(upstream)) continue;
  const file = targetPath(map, target);
  const rel = path.relative(repo, file);
  if (!fs.existsSync(file)) {
    problems.push(`${rel}: missing`);
    continue;
  }
  const current = expected.get(file)?.text ?? fs.readFileSync(file, "utf8");
  if (readRegion(current, upstream) === null) {
    problems.push(`${rel}: no "// @port ${upstream}" region`);
    continue;
  }
  const text = writeRegion(current, upstream, renderRegion(map, upstream, target).body);
  expected.set(file, { file, text });
}
const scratch = [...expected.values()].map(({ file, text }) => {
  const temp = path.join(path.dirname(file), `.port-check.${path.basename(file)}`);
  fs.writeFileSync(temp, text);
  return { file, temp };
});
try {
  if (scratch.length > 0) {
    spawnSync("vp", ["fmt", ...scratch.map((s) => s.temp)], { cwd: repo, stdio: "ignore" });
  }
  for (const { file, temp } of scratch) {
    if (fs.readFileSync(temp, "utf8") !== fs.readFileSync(file, "utf8")) {
      problems.push(`${path.relative(repo, file)}: a ported region differs from upstream`);
    }
  }
} finally {
  for (const { temp } of scratch) fs.rmSync(temp, { force: true });
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

const total = counts.ported + counts.pending + counts.excluded;
console.log(
  `port: ${counts.ported} ported, ${counts.pending} pending, ${counts.excluded} excluded (${total} upstream items at ${map.upstream.commit.slice(0, 8)})`,
);
if (process.argv.includes("--status")) {
  for (const [file, entry] of Object.entries(map.files)) {
    if (entry.pending === true) console.log(`  pending  ${file}`);
  }
  for (const [file, names] of pendingByFile) {
    if (map.files[file].pending !== true) console.log(`  pending  ${file}: ${names.join(", ")}`);
  }
}
if (warnings.length > 0) {
  for (const warning of warnings) console.error(`port: warning — ${warning}`);
}
if (problems.length > 0) {
  for (const problem of problems) console.error(`port: ${problem}`);
  process.exit(1);
}
