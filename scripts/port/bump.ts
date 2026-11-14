/**
 * Moves the baseline — the upgrade steps of `docs/toolchain.md`, in order:
 *
 *   bun run port:bump [<commit>]      # default: the commit `nsh --version` prints
 *
 * 1. fetch and check `references/nsh` out at the commit;
 * 2. set `port-map.json` `upstream.commit` to it (and `upstream.cli` to the release tag installed);
 * 3. print what upstream changed since the map was **reviewed**, in the map's terms, by target
 *    file: declarations we have a destination for that were added, changed or removed, and files
 *    added or removed;
 * 4. stop when the map does not account for upstream yet; otherwise say what to do next —
 *    `port:review` after reviewing, then `port:check` and `port:render`.
 *
 * It does not refill a region: the components are ours, so adopting a change upstream made is an
 * edit of ours (`docs/port.md`). It never commits either: the submodule pointer, `port-map.json`
 * and the code that follows are one commit, made by hand.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { auditMap, upstreamChanges } from "./changes";
import { type PortMap, readMap, repo, upstreamRel } from "./lib";

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
//    keeps its formatting and the commit shows the one line that moved. `upstream.reviewed`
//    stays where it was: that gap is the review list below.
const updated: PortMap = { ...map, upstream: { ...map.upstream, commit } };
const mapFile = path.join(repo, "port-map.json");
const mapText = fs.readFileSync(mapFile, "utf8");
const pinned = `"commit": "${baseline}"`;
if (mapText.split(pinned).length !== 2) die(`port-map.json does not have exactly one ${pinned}`);
let nextText = mapText.replace(pinned, `"commit": "${commit}"`);
// What CI installs follows the installed CLI: its release tag, or the nightly.
const installed = spawnSync("nsh", ["--version"], { encoding: "utf8" }).stdout ?? "";
const release = /^nsh (\d+\.\d+\.\d+)/.exec(installed.trim())?.[1];
const tag = /nightly/.test(installed) ? "nightly" : release ? `v${release}` : null;
if (tag && map.upstream.cli && tag !== map.upstream.cli && wanted === cliCommit()) {
  nextText = nextText.replace(`"cli": "${map.upstream.cli}"`, `"cli": "${tag}"`);
}
fs.writeFileSync(mapFile, nextText);

// 3. What changed since the reviewed commit, in the map's terms.
const review = upstreamChanges(updated);
const { gaps } = auditMap(updated);

const list = (kind: "added" | "changed" | "removed") =>
  review.items
    .filter((item) => item.kind === kind)
    .map((item) => `${item.file}: ${item.name} → ${item.target}`);
const section = (title: string, lines: string[]) => {
  if (lines.length === 0) return;
  console.log(`\n${title}`);
  for (const line of lines) console.log(`  ${line}`);
};

const upstreamRoot = upstreamRel(updated);
const shortstat = git(["diff", "--shortstat", review.reviewed, commit, "--", upstreamRoot]).out;
console.log(
  `\nport:bump: ${baseline.slice(0, 8)} → ${commit.slice(0, 8)} (${updated.upstream.path})` +
    (shortstat ? `\n  ${shortstat}` : ""),
);
const quiet =
  review.items.length === 0 &&
  review.addedFiles.length === 0 &&
  review.removedFiles.length === 0 &&
  gaps.length === 0;
if (baseline !== commit && quiet) {
  console.log("\nno change in the map's terms: upstream's files and declarations are as they were");
}
section(
  "upstream declarations added, routed to our code (port them, or leave them out on purpose):",
  list("added"),
);
section("upstream declarations changed (the look upstream differs from ours):", list("changed"));
section("upstream declarations removed (our code still has them):", list("removed"));
section("upstream files added (route them in port-map.json):", review.addedFiles);
section("upstream files removed (stop routing them in port-map.json):", review.removedFiles);

// 4. The map against the new baseline, then the review it leaves outstanding.
if (gaps.length > 0) {
  console.error(
    `\nport:bump: port-map.json does not account for upstream ${commit.slice(0, 8)} yet (${gaps.length}):` +
      `\n  ${[...new Set(gaps)].join("\n  ")}` +
      `\nreferences/nsh and port-map.json are at ${commit.slice(0, 8)}: fix the map, ` +
      `then run \`bun run port:review\` (nothing was vendored and nothing was committed).`,
  );
  process.exit(1);
}
const next = [
  review.reviewed === commit
    ? `  1. nothing upstream changed since the last review (${commit.slice(0, 8)}).`
    : `  1. review the changes above — \`git -C references/nsh diff ${review.reviewed.slice(0, 8)}..${commit.slice(0, 8)} -- ${upstreamRoot}\` — and adopt the ones we want by editing the code (the look is ours);`,
  `  2. bun run port:review    # marks upstream.reviewed as ${commit.slice(0, 8)}`,
  `  3. bun run port:check && bun run port:render`,
  `  4. commit references/nsh, port-map.json and the code together (docs/toolchain.md).`,
];
console.log(
  `\nport:bump: the baseline is ${commit.slice(0, 8)}; the map was last reviewed at ${review.reviewed.slice(0, 8)}.` +
    `\nNothing was refilled and nothing was committed:\n${next.join("\n")}`,
);
