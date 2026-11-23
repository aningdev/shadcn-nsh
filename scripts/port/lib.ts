/**
 * Shared by `vendor.ts`, `check.ts`, `changes.ts` and `coverage.ts`: reads `port-map.json` and
 * splits a module into its top-level declarations, so the ones an upstream file routes to a target
 * can be drafted into it.
 */
import fs from "node:fs";
import path from "node:path";

import { parseSync } from "oxc-parser";

export const repo = path.resolve(import.meta.dir, "../..");

/** Where one upstream file goes. Exactly one of `owned`, `exclude` (a string) or a routing. */
export type FileEntry = {
  /**
   * This library's own now, at this path under `root`: the file upstream started it from, kept for
   * the record. Not written by `vendor.ts` and not compared by `check.ts`, so editing it is not a
   * change to register (the theme files: `docs/port.md`).
   */
  owned?: string;
  /** Every declaration goes to this file under `root`, unless `symbols` says otherwise. */
  to?: string;
  /** Per-declaration targets: one file, or several (a private constant two components need). */
  symbols?: Record<string, string | string[]>;
  /** Not ported yet: the whole file (`true`) or these declarations. */
  pending?: true | string[];
  /** Never ported: the whole file (a reason) or these declarations (name → reason). */
  exclude?: string | Record<string, string>;
};

export type PortMap = {
  upstream: {
    path: string;
    /** The baseline: what `references/nsh` is checked out at, and what the installed CLI prints. */
    commit: string;
    /** The baseline as last reviewed: upstream's changes since here are `port:check`'s to-review list. */
    reviewed: string;
    /** What to install: a release tag (`v0.5.0`) whose build is `commit`, or `nightly`. */
    cli?: string;
  };
  /** The directory the targets are relative to. */
  root: string;
  files: Record<string, FileEntry>;
};

export function readMap(): PortMap {
  return JSON.parse(fs.readFileSync(path.join(repo, "port-map.json"), "utf8")) as PortMap;
}

export const upstreamDir = (map: PortMap) => path.join(repo, map.upstream.path);
export const targetPath = (map: PortMap, rel: string) => path.join(repo, map.root, rel);
/** The upstream directory as `references/nsh` names it (`git show <commit>:<path>`). */
export const upstreamRel = (map: PortMap) =>
  path.relative(path.join(repo, "references/nsh"), upstreamDir(map)).replaceAll(path.sep, "/");

/** Default path for a new component file in the registry / port map. */
export const defaultUiRel = (map: PortMap, id: string) =>
  path.posix.join(map.root, "packages/ui", `${id}.tsx`);

/** Every file under the upstream directory, relative, sorted. */
export function upstreamFiles(map: PortMap): string[] {
  const root = upstreamDir(map);
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else out.push(path.relative(root, abs).replaceAll(path.sep, "/"));
    }
  };
  walk(root);
  return out.sort();
}

/** A top-level declaration of a module: its names, its text (leading comments included), and its kind. */
export type Declaration = { names: string[]; text: string; typeOnly: boolean };

type Node = { type: string; start: number; end: number; [key: string]: unknown };

function declaredNames(node: Node): string[] {
  switch (node.type) {
    case "ExportNamedDeclaration": {
      const inner = node.declaration as Node | null;
      return inner && !node.source ? declaredNames(inner) : [];
    }
    case "ExportDefaultDeclaration":
      return ["default"];
    case "VariableDeclaration":
      return (node.declarations as { id: { type: string; name?: string } }[])
        .map((d) => d.id.name)
        .filter((name): name is string => typeof name === "string");
    case "FunctionDeclaration":
    case "ClassDeclaration":
    case "TSTypeAliasDeclaration":
    case "TSInterfaceDeclaration":
    case "TSEnumDeclaration":
      return [(node.id as { name: string }).name];
    default:
      return [];
  }
}

/** Statements that carry no declaration of the module's own and are never ported. */
const SKIPPED = new Set(["ImportDeclaration", "ExportAllDeclaration"]);

/**
 * The module's own top-level declarations, in order. Imports and re-exports are left out: a
 * target file writes its own imports. A comment between two statements belongs to the next one.
 */
export function declarations(file: string, source: string): Declaration[] {
  const result = parseSync(file, source);
  if (result.errors.length > 0) {
    throw new Error(`${file}: ${result.errors[0].message}`);
  }
  const body = result.program.body as unknown as Node[];
  const comments = [...result.comments].sort((a, b) => a.start - b.start);
  const out: Declaration[] = [];
  let previousEnd = 0;
  let unnamed = 0;
  for (const node of body) {
    const names = declaredNames(node);
    const skipped =
      SKIPPED.has(node.type) || (node.type === "ExportNamedDeclaration" && names.length === 0);
    if (!skipped) {
      // A statement that declares nothing (`mount(App)`) is routed by its place among them.
      if (names.length === 0) names.push(`<statement ${(unnamed += 1)}>`);
      const lead = comments.find((c) => c.start >= previousEnd && c.end <= node.start);
      out.push({
        names,
        text: source.slice(lead ? lead.start : node.start, node.end),
        typeOnly: typeOnly(node),
      });
    }
    previousEnd = node.end;
  }
  return out;
}

/** Where a declaration goes, or why it goes nowhere. */
export type Route =
  | { kind: "ported"; targets: string[] }
  | { kind: "pending" }
  | { kind: "excluded"; why: string }
  | { kind: "unmapped" };

export function route(entry: FileEntry, name: string): Route {
  if (typeof entry.exclude === "string") return { kind: "excluded", why: entry.exclude };
  if (entry.exclude?.[name]) return { kind: "excluded", why: entry.exclude[name] };
  const target = entry.symbols?.[name] ?? entry.to;
  if (target) return { kind: "ported", targets: Array.isArray(target) ? target : [target] };
  if (entry.pending === true || (Array.isArray(entry.pending) && entry.pending.includes(name))) {
    return { kind: "pending" };
  }
  return { kind: "unmapped" };
}

/** Types are not code: a declaration that only names a shape is never what a shell is made of. */
function typeOnly(node: Node): boolean {
  const inner = node.type === "ExportNamedDeclaration" ? (node.declaration as Node | null) : node;
  if (inner?.type === "TSTypeAliasDeclaration" || inner?.type === "TSInterfaceDeclaration") {
    return true;
  }
  return node.type === "ExportNamedDeclaration" && node.exportKind === "type";
}

/** Whether a target is a module whose declarations can be drafted: not a README, not a JSON. */
export const isSource = (rel: string) => /\.(?:ts|tsx|js|jsx)$/.test(rel);

/** The credit line every derived file carries under its description, on line 2 (`NOTICE`). */
export const CREDIT =
  "// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.";

/** The (upstream, target) pairs the map routes declarations to: every file of ours that is derived. */
export function targets(map: PortMap): { upstream: string; target: string }[] {
  const out: { upstream: string; target: string }[] = [];
  for (const [upstream, entry] of Object.entries(map.files)) {
    if (entry.owned || typeof entry.exclude === "string") continue;
    const to = new Set<string>();
    if (entry.to) to.add(entry.to);
    for (const value of Object.values(entry.symbols ?? {})) {
      for (const target of Array.isArray(value) ? value : [value]) to.add(target);
    }
    for (const target of to) out.push({ upstream, target });
  }
  return out;
}

/** The declarations of `upstream` that the map routes to `targetRel`, in upstream's order. */
export function routed(
  map: PortMap,
  upstream: string,
  targetRel: string,
): { name: string; text: string }[] {
  if (!isSource(targetRel)) return [];
  const entry = map.files[upstream];
  const source = fs.readFileSync(path.join(upstreamDir(map), upstream), "utf8");
  const out: { name: string; text: string }[] = [];
  for (const declaration of declarations(upstream, source)) {
    const name = declaration.names[0];
    const to = route(entry, name);
    if (to.kind !== "ported" || !to.targets.includes(targetRel)) continue;
    out.push({ name, text: declaration.text });
  }
  return out;
}

/** Every name the map routes to each target: what a derived file got from upstream. */
export function portedNames(map: PortMap): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const [upstream, entry] of Object.entries(map.files)) {
    const file = path.join(upstreamDir(map), upstream);
    if (!isSource(upstream) || !fs.existsSync(file)) continue;
    for (const declaration of declarations(upstream, fs.readFileSync(file, "utf8"))) {
      const to = route(entry, declaration.names[0]);
      if (to.kind !== "ported") continue;
      for (const target of to.targets) {
        const names = out.get(target) ?? new Set<string>();
        for (const name of declaration.names) names.add(name);
        out.set(target, names);
      }
    }
  }
  return out;
}

/** `source` with `body` written in under its imports: where the look a file drafts belongs. */
export function insertDraft(source: string, body: string): string {
  if (body.trim() === "") return source;
  const lines = source.split("\n");
  let at = 0;
  for (const [index, line] of lines.entries()) {
    if (line.startsWith("import ") || line.startsWith("} from ")) at = index + 1;
  }
  const rest = lines.slice(at);
  while (rest.length > 0 && rest[0].trim() === "") rest.shift();
  return [...lines.slice(0, at), "", body, "", ...rest].join("\n");
}

/**
 * Text as the formatter cannot change it: no whitespace, no trailing commas. Two drafts that
 * differ only in line breaks, indentation or a trailing comma compare equal.
 */
export function normalize(text: string): string {
  return text.replace(/\s+/g, "").replace(/,(?=[)\]}>])/g, "");
}
