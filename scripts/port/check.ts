/**
 * The port's gate. Fails when:
 *   1. the upstream checkout is not at the commit `port-map.json` pins;
 *   2. an upstream file or declaration is neither ported, pending nor excluded (with a reason);
 *   3. a ported region or copy differs from upstream (run `bun run port:vendor`);
 *   4. the map names a file or declaration upstream does not have.
 *
 *   bun scripts/port/check.ts            # the gate
 *   bun scripts/port/check.ts --status   # also list what is pending, by file
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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

// The CLI must be built from the pinned commit or a later one: upstream's looks use what the
// runtime of their own commit has. A warning until the two are brought together.
const cli = /\(([0-9a-f]{7,})/.exec(spawnSync("nsh", ["--version"], { encoding: "utf8" }).stdout);
if (cli) {
  const behind = spawnSync(
    "git",
    ["-C", path.join(repo, "references/nsh"), "rev-list", "--count", `${cli[1]}..${head}`],
    { encoding: "utf8" },
  ).stdout.trim();
  if (behind !== "" && behind !== "0") {
    console.warn(
      `port: warning: the nsh CLI (${cli[1]}) is ${behind} commits behind the pinned upstream`,
    );
  }
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
if (problems.length > 0) {
  for (const problem of problems) console.error(`port: ${problem}`);
  process.exit(1);
}
