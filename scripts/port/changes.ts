/**
 * What the Port Map says about upstream, read two ways (`docs/ARCHITECTURE.md`, P1 and P2):
 *
 * - `auditMap`: every upstream file and declaration has a destination, or a reason not to have
 *   one, and the map names nothing upstream lacks.
 * - `upstreamChanges`: what upstream changed between the commit the map was last **reviewed** at
 *   and the baseline, among the declarations we have a destination for. That list is what
 *   `port:check` insists is reviewed, `port:review` marks reviewed, and `port:bump` prints after
 *   it moves the baseline.
 *
 * Neither compares our code with upstream: a region may differ on purpose (`docs/port.md`).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  type FileEntry,
  type PortMap,
  declarations,
  normalize,
  repo,
  route,
  targetPath,
  upstreamDir,
  upstreamFiles,
  upstreamRel,
} from "./lib";

const nshDir = path.join(repo, "references/nsh");

/** `git` in the upstream checkout: its exit status and trimmed stdout. */
function git(args: string[]): { status: number; out: string } {
  const result = spawnSync("git", ["-C", nshDir, ...args], { encoding: "utf8" });
  return { status: result.status ?? 1, out: (result.stdout ?? "").trim() };
}

/** The commit `references/nsh` is checked out at. */
export function upstreamHead(): string {
  return git(["rev-parse", "HEAD"]).out;
}

/** Upstream's declarations per file at `commit`, the text as the formatter cannot change it. */
function declarationsAt(map: PortMap, commit: string, file: string) {
  const shown = git(["show", `${commit}:${upstreamRel(map)}/${file}`]);
  if (shown.status !== 0) {
    throw new Error(
      `upstream ${commit.slice(0, 8)} is not in references/nsh: \`git -C references/nsh fetch origin\``,
    );
  }
  return new Map(
    declarations(file, shown.out).map((declaration) => [
      declaration.names[0],
      normalize(declaration.text),
    ]),
  );
}

/** Upstream's files at `commit`, relative to the upstream directory. */
function filesAt(map: PortMap, commit: string): string[] {
  const root = upstreamRel(map);
  const listed = git(["ls-tree", "-r", "--name-only", commit, "--", root]);
  if (listed.status !== 0) {
    throw new Error(
      `upstream ${commit.slice(0, 8)} is not in references/nsh: \`git -C references/nsh fetch origin\``,
    );
  }
  return listed.out
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => line.slice(root.length + 1));
}

/** What P1 demands of the map, and the numbers `port:check` prints. */
export type MapAudit = {
  gaps: string[];
  counts: { ported: number; owned: number; pending: number; excluded: number };
  /** Declarations routed nowhere yet, by file (`port:check --status`). */
  pendingByFile: Map<string, string[]>;
};

/** Every upstream file and declaration accounted for, and nothing named that upstream lacks. */
export function auditMap(map: PortMap): MapAudit {
  const gaps: string[] = [];
  const counts = { ported: 0, owned: 0, pending: 0, excluded: 0 };
  const pendingByFile = new Map<string, string[]>();
  const files = upstreamFiles(map);

  for (const file of Object.keys(map.files)) {
    if (!files.includes(file)) gaps.push(`${file}: in the map, not upstream`);
  }
  for (const file of files) {
    const entry = map.files[file];
    if (!entry) {
      gaps.push(`${file}: not in the map`);
      continue;
    }
    if (typeof entry.exclude === "string") {
      counts.excluded += 1;
      continue;
    }
    if (entry.owned) {
      counts.owned += 1;
      continue;
    }
    if (!/\.tsx?$/.test(file)) {
      if (entry.pending === true) counts.pending += 1;
      else gaps.push(`${file}: not a module, so it needs "exclude" or "pending": true`);
      continue;
    }
    const source = fs.readFileSync(path.join(upstreamDir(map), file), "utf8");
    const names = declarations(file, source).map((declaration) => declaration.names[0]);
    for (const name of names) {
      const to = route(entry, name);
      switch (to.kind) {
        case "unmapped":
          gaps.push(`${file}: ${name} is not routed`);
          break;
        case "pending":
          counts.pending += 1;
          pendingByFile.set(file, [...(pendingByFile.get(file) ?? []), name]);
          break;
        case "excluded":
          counts.excluded += 1;
          break;
        case "ported":
          counts.ported += 1;
          for (const target of to.targets) {
            if (!fs.existsSync(targetPath(map, target))) {
              gaps.push(`${target}: missing (the map routes ${file}: ${name} there)`);
            }
          }
          break;
      }
    }
    const mentioned = [
      ...Object.keys(entry.symbols ?? {}),
      ...(Array.isArray(entry.pending) ? entry.pending : []),
      ...(typeof entry.exclude === "object" ? Object.keys(entry.exclude) : []),
    ];
    for (const name of mentioned) {
      if (!names.includes(name)) gaps.push(`${file}: the map names ${name}, upstream has none`);
    }
  }
  return { gaps, counts, pendingByFile };
}

/** One upstream change worth a look, and the file of ours the change lands in. */
export type ReviewItem = {
  kind: "added" | "changed" | "removed";
  file: string;
  name: string;
  /** The files the declaration is routed to, as `port-map.json` names them. */
  target: string;
};

/** What changed upstream since the map was reviewed, in the map's terms. */
export type UpstreamChanges = {
  reviewed: string;
  commit: string;
  items: ReviewItem[];
  /** Files upstream gained (they need a route) and dropped (the map must stop naming them). */
  addedFiles: string[];
  removedFiles: string[];
};

/**
 * Upstream's changes between `upstream.reviewed` and `upstream.commit` that reach our code: a
 * declaration we have a destination for was added, changed or removed. Excluded and pending
 * declarations reach nothing, and the `owned` files are ours. Files upstream added or dropped are
 * listed whole. The comparison is formatted text, so a reformat is not a change.
 */
export function upstreamChanges(map: PortMap): UpstreamChanges {
  const { reviewed, commit } = map.upstream;
  const changes: UpstreamChanges = {
    reviewed,
    commit,
    items: [],
    addedFiles: [],
    removedFiles: [],
  };
  if (reviewed === commit) return changes;

  const before = new Set(filesAt(map, reviewed));
  const now = new Set(upstreamFiles(map));

  for (const file of [...now].sort()) {
    if (!before.has(file) && !map.files[file]) changes.addedFiles.push(file);
  }
  for (const file of [...before].sort()) {
    if (!now.has(file) && map.files[file]) changes.removedFiles.push(file);
  }

  const label = (entry: FileEntry, name: string): string => {
    const to = route(entry, name);
    return to.kind === "ported" ? to.targets.join(", ") : "";
  };

  for (const file of [...new Set([...before, ...now])].sort()) {
    const entry = map.files[file];
    if (!entry || typeof entry.exclude === "string" || entry.owned) continue;
    if (!/\.tsx?$/.test(file)) continue;

    const oldTexts = before.has(file) ? declarationsAt(map, reviewed, file) : new Map();
    const newTexts = now.has(file)
      ? new Map(
          declarations(file, fs.readFileSync(path.join(upstreamDir(map), file), "utf8")).map(
            (declaration) => [declaration.names[0], normalize(declaration.text)],
          ),
        )
      : new Map<string, string>();

    for (const [name, text] of newTexts) {
      const target = label(entry, name);
      if (target === "") continue;
      const was = oldTexts.get(name);
      if (was === undefined) changes.items.push({ kind: "added", file, name, target });
      else if (was !== text) changes.items.push({ kind: "changed", file, name, target });
    }
    for (const name of oldTexts.keys()) {
      if (newTexts.has(name)) continue;
      const target = label(entry, name);
      if (target !== "") changes.items.push({ kind: "removed", file, name, target });
    }
  }
  return changes;
}
