/**
 * Shared by `vendor.ts` and `check.ts`: reads `port-map.json`, splits an upstream module into
 * its top-level declarations, and renders the region of a target file that holds them.
 */
import fs from "node:fs";
import path from "node:path";

import { parseSync } from "oxc-parser";

export const repo = path.resolve(import.meta.dir, "../..");

/** Where one upstream file goes. Exactly one of `copy`, `owned`, `exclude` (a string) or a routing. */
export type FileEntry = {
  /** Copied byte for byte to this path under `root` (JSON, modules taken whole). */
  copy?: string;
  /**
   * This library's own now, at this path under `root`: the file upstream started it from, kept for
   * the record. Not copied by `vendor.ts` and not compared by `check.ts`, so editing it is not a
   * deviation to register (the theme files: `docs/port.md`).
   */
  owned?: string;
  /** Every declaration goes to the region of this file under `root`, unless `symbols` says otherwise. */
  to?: string;
  /** Per-declaration targets: one file, or several (a private constant two components need). */
  symbols?: Record<string, string | string[]>;
  /** Declarations whose text differs from upstream on purpose: the replacement, and why. */
  replace?: Record<string, { with: string; why: string }>;
  /** Not ported yet: the whole file (`true`) or these declarations. */
  pending?: true | string[];
  /** Never ported: the whole file (a reason) or these declarations (name → reason). */
  exclude?: string | Record<string, string>;
};

export type PortMap = {
  upstream: {
    path: string;
    commit: string;
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

/** A top-level declaration of a module: its names and its text, leading comments included. */
export type Declaration = { names: string[]; text: string };

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
      out.push({ names, text: source.slice(lead ? lead.start : node.start, node.end) });
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

const begin = (upstream: string) => `// @port ${upstream}`;
const END = "// @port end";

/** The text between the markers of `upstream`'s region in `target`, or null when it has none. */
export function readRegion(target: string, upstream: string): string | null {
  const start = target.indexOf(`${begin(upstream)}\n`);
  if (start === -1) return null;
  const from = start + begin(upstream).length + 1;
  const end = target.indexOf(END, from);
  return end === -1 ? null : target.slice(from, end);
}

/** `target` with the region of `upstream` replaced by `body`. */
export function writeRegion(target: string, upstream: string, body: string): string {
  const start = target.indexOf(`${begin(upstream)}\n`);
  if (start === -1) throw new Error(`no "${begin(upstream)}" marker`);
  const from = start + begin(upstream).length + 1;
  const end = target.indexOf(END, from);
  if (end === -1) throw new Error(`no "${END}" after "${begin(upstream)}"`);
  return `${target.slice(0, from)}${body}\n${target.slice(end)}`;
}

/** What the region of `upstream` in `targetRel` must hold: its declarations routed there, in order. */
export function renderRegion(
  map: PortMap,
  upstream: string,
  targetRel: string,
): { body: string; names: string[] } {
  const entry = map.files[upstream];
  const source = fs.readFileSync(path.join(upstreamDir(map), upstream), "utf8");
  const parts: string[] = [];
  const names: string[] = [];
  for (const declaration of declarations(upstream, source)) {
    const name = declaration.names[0];
    const to = route(entry, name);
    if (to.kind !== "ported" || !to.targets.includes(targetRel)) continue;
    const replacement = entry.replace?.[name];
    parts.push(replacement ? replacement.with : declaration.text);
    names.push(name);
  }
  return { body: parts.join("\n\n"), names };
}

/** The (upstream, target) pairs that have a region, from the map alone. */
export function regions(map: PortMap): { upstream: string; target: string }[] {
  const out: { upstream: string; target: string }[] = [];
  for (const [upstream, entry] of Object.entries(map.files)) {
    if (entry.copy || entry.owned || typeof entry.exclude === "string") continue;
    const targets = new Set<string>();
    if (entry.to) targets.add(entry.to);
    for (const value of Object.values(entry.symbols ?? {})) {
      for (const target of Array.isArray(value) ? value : [value]) targets.add(target);
    }
    for (const target of targets) out.push({ upstream, target });
  }
  return out;
}

/**
 * Text as the formatter cannot change it: no whitespace, no trailing commas. Two regions that
 * differ only in line breaks, indentation or a trailing comma compare equal.
 */
export function normalize(text: string): string {
  return text.replace(/\s+/g, "").replace(/,(?=[)\]}>])/g, "");
}
