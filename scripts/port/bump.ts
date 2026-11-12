/**
 * Moves the baseline — the upgrade steps of `docs/toolchain.md`, in order:
 *
 *   bun run port:bump [<commit>]      # default: the commit `nsh --version` prints
 *
 * 1. fetch and check `references/nsh` out at the commit;
 * 2. set `port-map.json` `upstream.commit` to it;
 * 3. say what changed since the baseline in the map's terms, by target file:
 *    upstream declarations added, removed or whose text changed, and copies;
 * 4. `bun run port:check`; when the map accounts for everything upstream has,
 *    `bun run port:vendor`, `bun run port:check` again and `nsh check apps/docs/demos`.
 *
 * It never commits: the submodule pointer, `port-map.json` and the refilled regions
 * are one commit, made by hand.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  type FileEntry,
  type PortMap,
  declarations,
  normalize,
  readMap,
  repo,
  route,
  targetPath,
  upstreamDir,
  upstreamFiles,
} from "./lib";

const nshDir = path.join(repo, "references/nsh");
const map = readMap();
const baseline = map.upstream.commit;

const die = (message: string): never => {
  console.error(`port:bump: ${message}`);
  process.exit(1);
};

const git = (args: string[]) => {
  const result = spawnSync("git", ["-C", nshDir, ...args], { encoding: "utf8" });
  return { status: result.status ?? 1, out: (result.stdout ?? "").trim() };
};

const step = (command: string, args: string[]) => {
  console.log(`$ ${command} ${args.join(" ")}`);
  return spawnSync(command, args, { cwd: repo, stdio: "inherit" }).status ?? 1;
};

function cliCommit(): string | null {
  const version = spawnSync("nsh", ["--version"], { encoding: "utf8" }).stdout ?? "";
  return /\(([0-9a-f]{7,})/.exec(version)?.[1] ?? null;
}

function resolve(ref: string): string | null {
  const { status, out } = git(["rev-parse", "--verify", `${ref}^{commit}`]);
  return status === 0 && /^[0-9a-f]{40}$/.test(out) ? out : null;
}

function findCommit(ref: string): string {
  let found = resolve(ref);
  if (!found) {
    console.log(`port:bump: ${ref} is not in references/nsh yet; fetching…`);
    git(["fetch", "--quiet", "origin"]);
    found = resolve(ref);
  }
  if (!found) {
    // A commit that is not on a branch tip: ask for it by name.
    git(["fetch", "--quiet", "origin", ref]);
    found = resolve(ref);
  }
  return (
    found ??
    die(`references/nsh has no ${ref}: fetch it first (git -C references/nsh fetch origin)`)
  );
}

// 1. The commit: the argument, else what built the CLI (the baseline follows the CLI).
const wanted = process.argv[2] ?? cliCommit();
if (!wanted) {
  die(
    "no commit: pass one, or install a CLI that prints the commit it was built from (`nsh --version`)",
  );
}
if (git(["status", "--porcelain"]).out !== "") {
  die("references/nsh has local changes: commit or discard them first");
}
const commit = findCommit(wanted);
if (git(["rev-parse", "HEAD"]).out !== commit) {
  console.log(`port:bump: checking references/nsh out at ${commit}…`);
  if (git(["checkout", "--detach", commit]).status !== 0) {
    die(`could not check references/nsh out at ${commit}`);
  }
}
if (git(["rev-parse", "HEAD"]).out !== commit) {
  die(`references/nsh is not at ${commit} after the checkout`);
}

// 2. The pin. The hash is replaced in place, not the JSON rewritten, so the file
//    keeps its formatting and the commit shows the one line that moved.
const updated: PortMap = { ...map, upstream: { ...map.upstream, commit } };
const mapFile = path.join(repo, "port-map.json");
const mapText = fs.readFileSync(mapFile, "utf8");
const pinned = `"commit": "${baseline}"`;
if (mapText.split(pinned).length !== 2) die(`port-map.json does not have exactly one ${pinned}`);
fs.writeFileSync(mapFile, mapText.replace(pinned, `"commit": "${commit}"`));

// 3. What changed since the baseline, in the map's terms.
const dir = upstreamDir(updated);
const upstreamRoot = path.relative(nshDir, dir).replaceAll(path.sep, "/");
const files = upstreamFiles(updated);
const read = (file: string) => fs.readFileSync(path.join(dir, file), "utf8");
const show = (file: string) => {
  const result = spawnSync("git", ["-C", nshDir, "show", `${baseline}:${upstreamRoot}/${file}`], {
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout : null;
};

const atBaseline = new Set(
  git(["ls-tree", "-r", "--name-only", baseline, "--", upstreamRoot])
    .out.split("\n")
    .filter((line) => line !== "" && !line.endsWith("/"))
    .map((line) => line.slice(upstreamRoot.length + 1)),
);

type Change = { kind: "added" | "removed" | "changed"; file: string; name: string; where: string };
const changes: Change[] = [];
const addedFiles: string[] = [];
const removedFiles: string[] = [];
const copies: string[] = [];
const replacedUnder: string[] = [];
const incomplete: string[] = [];

/** The map's answer for one declaration, as the report prints it. */
function where(
  entry: FileEntry | undefined,
  name: string,
): { label: string; routed: boolean; unmapped: boolean } {
  if (!entry) return { label: "(no route in port-map.json)", routed: false, unmapped: true };
  const to = route(entry, name);
  switch (to.kind) {
    case "ported":
      return { label: to.targets.join(", "), routed: true, unmapped: false };
    case "pending":
      return { label: "(pending)", routed: false, unmapped: false };
    case "excluded":
      return { label: "(excluded)", routed: false, unmapped: false };
    case "unmapped":
      return { label: "(no route in port-map.json)", routed: false, unmapped: true };
  }
}

// The baseline's declarations per file, by name and as the formatter cannot change them.
const baselineNames = new Map<string, Map<string, string>>();
function atBaselineTexts(file: string): Map<string, string> {
  const cached = baselineNames.get(file);
  if (cached) return cached;
  const text = show(file);
  const byName = new Map<string, string>();
  if (text !== null) {
    for (const declaration of declarations(file, text)) {
      byName.set(declaration.names[0], normalize(declaration.text));
    }
  }
  baselineNames.set(file, byName);
  return byName;
}

for (const file of new Set([...files, ...atBaseline])) {
  const entry = updated.files[file];
  const isNew = !atBaseline.has(file);
  const isGone = !files.includes(file);
  if (isNew) addedFiles.push(file);
  if (isGone) removedFiles.push(file);

  // Excluded: nothing to compare, but the map must still name existing files.
  if (typeof entry?.exclude === "string") {
    if (isGone) incomplete.push(`${file}: gone from upstream, still in port-map.json`);
    continue;
  }

  // Taken whole: compare the text, not declarations.
  if (entry?.copy) {
    if (isGone) incomplete.push(`${file}: gone from upstream, still in port-map.json`);
    else if (isNew) copies.push(`${entry.copy} ← ${file} (new upstream file)`);
    else {
      const text = show(file);
      if (text !== null && normalize(text) !== normalize(read(file))) {
        copies.push(`${entry.copy} ← ${file}`);
      }
    }
    continue;
  }

  if (isGone) {
    incomplete.push(`${file}: gone from upstream, still in port-map.json`);
    continue;
  }
  if (isNew && !entry) {
    incomplete.push(`${file}: new upstream file, not in port-map.json`);
    continue;
  }
  // A non-module with no `copy`: nothing to split into declarations.
  if (!/\.tsx?$/.test(file)) continue;

  const beforeTexts = isNew ? new Map<string, string>() : atBaselineTexts(file);
  const after = new Map(
    declarations(file, read(file)).map((declaration) => [
      declaration.names[0],
      normalize(declaration.text),
    ]),
  );

  for (const [name, text] of after) {
    const at = where(entry, name);
    if (at.routed) {
      const to = route(entry as FileEntry, name);
      for (const target of to.kind === "ported" ? to.targets : []) {
        if (!fs.existsSync(targetPath(updated, target))) {
          incomplete.push(`${target}: missing (needs a "// @port ${file}" region)`);
        }
      }
    }
    const was = beforeTexts.get(name);
    if (was === undefined) {
      changes.push({ kind: "added", file, name, where: at.label });
      if (at.unmapped) incomplete.push(`${file}: ${name} is not routed`);
    } else if (was !== text) {
      changes.push({ kind: "changed", file, name, where: at.label });
      if (at.unmapped) incomplete.push(`${file}: ${name} is not routed`);
      const replacement = entry?.replace?.[name];
      if (replacement) replacedUnder.push(`${file}: ${name} — ${replacement.why}`);
    }
  }
  for (const name of beforeTexts.keys()) {
    if (after.has(name)) continue;
    const at = where(entry, name);
    changes.push({ kind: "removed", file, name, where: at.label });
    if (at.routed) incomplete.push(`${file}: the map routes ${name}, upstream has none`);
  }
  // Names the map keeps from an even older upstream: port:check fails on these too.
  const mentioned = [
    ...Object.keys(entry?.symbols ?? {}),
    ...Object.keys(entry?.replace ?? {}),
    ...(Array.isArray(entry?.pending) ? entry.pending : []),
    ...(typeof entry?.exclude === "object" ? Object.keys(entry.exclude) : []),
  ];
  for (const name of mentioned) {
    if (!after.has(name) && !beforeTexts.has(name)) {
      incomplete.push(`${file}: the map names ${name}, upstream has none`);
    }
  }
}
for (const file of Object.keys(updated.files)) {
  if (!files.includes(file) && !atBaseline.has(file)) {
    removedFiles.push(file);
    incomplete.push(`${file}: in port-map.json, not upstream`);
  }
}

const list = (kind: Change["kind"]) =>
  changes
    .filter((change) => change.kind === kind)
    .map((change) => `${change.file}: ${change.name} → ${change.where}`);
const section = (title: string, lines: string[]) => {
  if (lines.length === 0) return;
  console.log(`\n${title}`);
  for (const line of lines) console.log(`  ${line}`);
};

const shortstat = git(["diff", "--shortstat", baseline, commit, "--", upstreamRoot]).out;
console.log(
  `\nport:bump: ${baseline.slice(0, 8)} → ${commit.slice(0, 8)} (${upstreamRoot})` +
    (shortstat ? `\n  ${shortstat}` : ""),
);
const quiet =
  changes.length === 0 &&
  addedFiles.length === 0 &&
  removedFiles.length === 0 &&
  copies.length === 0;
if (baseline !== commit && quiet) {
  console.log("\nno change in the map's terms: upstream's files and declarations are as they were");
}
section("declarations added upstream (route them in port-map.json):", list("added"));
section("declarations removed upstream (port-map.json must stop naming them):", list("removed"));
section("declarations whose text changed (port:vendor refills their regions):", list("changed"));
section("upstream files added (add them to port-map.json):", addedFiles);
section("upstream files removed (remove them from port-map.json):", removedFiles);
section("copies changed upstream (port:vendor rewrites them):", copies);
section(
  "upstream text changed under a registered replace (review the replacement):",
  replacedUnder,
);

// 4. The gate, the refill, then the demos' types.
console.log("");
const checked = step("bun", ["run", "port:check"]);
if (incomplete.length > 0) {
  console.error(
    `\nport:bump: port-map.json does not account for upstream ${commit.slice(0, 8)} yet (${incomplete.length}):` +
      `\n  ${[...new Set(incomplete)].join("\n  ")}` +
      `\nreferences/nsh and port-map.json are at ${commit.slice(0, 8)}: fix the map, then run` +
      `\n  bun run port:vendor && bun run port:check && nsh check apps/docs/demos` +
      `\nNothing was vendored and nothing was committed.`,
  );
  process.exit(1);
}
if (checked !== 0) {
  // Expected while declarations changed: the regions still hold the old text, which
  // is what `port:vendor` below refills. It runs again after the refill as the gate.
  console.log("\nport:bump: port:check failed above (the refill below is what fixes regions)");
}

for (const [command, args] of [
  ["bun", ["run", "port:vendor"]],
  ["bun", ["run", "port:check"]],
  ["nsh", ["check", "apps/docs/demos"]],
] as const) {
  const status = step(command, [...args]);
  if (status !== 0) process.exit(status);
}

console.log(
  `\nport:bump: the baseline is ${commit.slice(0, 8)}. Nothing committed: commit references/nsh, port-map.json and the regions together (docs/toolchain.md).`,
);
