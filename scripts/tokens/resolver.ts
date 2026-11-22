/**
 * W3C DTCG 2025.10 Resolver implementation (§6 Resolution Logic: input validation,
 * ordering/merging of sets and modifier contexts, and curly-brace alias resolution).
 */
import fs from "node:fs";
import path from "node:path";

import { EXT_NS } from "./types";

export interface RefObject {
  $ref: string;
}

export type TokenSourceItem = RefObject | Record<string, unknown>;

export interface ResolverSet {
  description?: string;
  sources: TokenSourceItem[];
  $extensions?: Record<string, unknown>;
}

export interface ResolverModifier {
  description?: string;
  contexts: Record<string, TokenSourceItem[]>;
  default?: string;
  $extensions?: Record<string, unknown>;
}

export interface InlineSet extends ResolverSet {
  type: "set";
  name: string;
}

export interface InlineModifier extends ResolverModifier {
  type: "modifier";
  name: string;
}

export interface ResolverDoc {
  $schema?: string;
  name?: string;
  version: "2025.10";
  description?: string;
  sets?: Record<string, ResolverSet>;
  modifiers?: Record<string, ResolverModifier>;
  resolutionOrder: Array<RefObject | InlineSet | InlineModifier>;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isTokenNode = (v: unknown): boolean => isRecord(v) && Object.hasOwn(v, "$value");

function hasSpringExtension(node: Record<string, unknown>): boolean {
  const exts = node.$extensions;
  if (!isRecord(exts)) return false;
  const ns = exts[EXT_NS];
  return isRecord(ns) && "spring" in ns;
}

function stripSpringExtension(node: Record<string, unknown>): void {
  const exts = node.$extensions;
  if (!isRecord(exts)) return;
  const ns = exts[EXT_NS];
  if (!isRecord(ns) || !("spring" in ns)) return;
  delete ns.spring;
  if (Object.keys(ns).length === 0) delete exts[EXT_NS];
  if (Object.keys(exts).length === 0) delete node.$extensions;
}

/** Deep-merge DTCG token trees per Resolver §6.2 (latter token overrides earlier token). */
export function mergeTokenTrees(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const [key, val] of Object.entries(source)) {
    if (key === "$schema") continue;
    const prev = target[key];
    if (isRecord(val) && isRecord(prev) && !isTokenNode(val) && !isTokenNode(prev)) {
      const merged = mergeTokenTrees({ ...prev }, val);
      // Motion role groups are a mutually-exclusive union of `timing` token or `$extensions.spring`.
      if (isTokenNode(val.timing)) {
        stripSpringExtension(merged);
      } else if (hasSpringExtension(val)) {
        delete merged.timing;
      }
      target[key] = merged;
    } else {
      target[key] = structuredClone(val);
    }
  }
  return target;
}

/** Load a set/modifier source item (external JSON file via `$ref` or inline token tree). */
export function loadSourceItem(
  item: TokenSourceItem,
  resolverDir: string,
  resolverDoc: ResolverDoc,
): Record<string, unknown> {
  if (!isRecord(item) || !("$ref" in item) || typeof item.$ref !== "string") {
    return item as Record<string, unknown>;
  }
  const ref = item.$ref;
  if (ref.startsWith("#/sets/")) {
    const setName = ref.slice("#/sets/".length);
    const set = resolverDoc.sets?.[setName];
    if (!set) throw new Error(`Unknown set ref: ${ref}`);
    return set.sources.reduce<Record<string, unknown>>(
      (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, resolverDir, resolverDoc)),
      {},
    );
  }
  const filePath = path.resolve(resolverDir, ref);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

/**
 * Resolve a DTCG 2025.10 Resolver for one `(appearance, input)` permutation per §6.1–6.4.
 */
export function resolvePermutation(
  resolverPath: string,
  inputs: Record<string, string>,
): { merged: Record<string, unknown>; resolved: Record<string, unknown> } {
  const absPath = path.resolve(resolverPath);
  const resolverDir = path.dirname(absPath);
  const doc = JSON.parse(fs.readFileSync(absPath, "utf8")) as ResolverDoc;

  const modifiers = doc.modifiers ?? {};
  // §6.1 Input validation
  for (const [key, val] of Object.entries(inputs)) {
    const mod = modifiers[key];
    if (!mod) throw new Error(`Unknown input modifier: ${key}`);
    if (!Object.hasOwn(mod.contexts, val)) {
      throw new Error(`Invalid context "${val}" for modifier "${key}"`);
    }
  }
  const effectiveInputs: Record<string, string> = { ...inputs };
  for (const [name, mod] of Object.entries(modifiers)) {
    if (!(name in effectiveInputs)) {
      if (mod.default === undefined) {
        throw new Error(`Missing required input for modifier "${name}" (no default declared)`);
      }
      effectiveInputs[name] = mod.default;
    }
  }

  // §6.2 Ordering
  let merged: Record<string, unknown> = {};
  for (const item of doc.resolutionOrder) {
    let sources: TokenSourceItem[];
    if ("$ref" in item) {
      if (item.$ref.startsWith("#/sets/")) {
        const name = item.$ref.slice("#/sets/".length);
        const set = doc.sets?.[name];
        if (!set) throw new Error(`Unknown set in resolutionOrder: ${item.$ref}`);
        sources = set.sources;
      } else if (item.$ref.startsWith("#/modifiers/")) {
        const name = item.$ref.slice("#/modifiers/".length);
        const mod = doc.modifiers?.[name];
        if (!mod) throw new Error(`Unknown modifier in resolutionOrder: ${item.$ref}`);
        const ctx = effectiveInputs[name]!;
        sources = mod.contexts[ctx]!;
      } else {
        throw new Error(`Unsupported $ref in resolutionOrder: ${item.$ref}`);
      }
    } else if (item.type === "set") {
      sources = item.sources;
    } else {
      const ctx = effectiveInputs[item.name]!;
      sources = item.contexts[ctx]!;
    }
    for (const src of sources) {
      merged = mergeTokenTrees(merged, loadSourceItem(src, resolverDir, doc));
    }
  }

  // §6.3 Aliases
  const resolved = resolveAliases(merged);
  return { merged, resolved };
}

/** Lookup a dotted DTCG path (e.g., `color.card`) in a token tree. */
export function lookupToken(
  tree: Record<string, unknown>,
  dotted: string,
): Record<string, unknown> {
  const parts = dotted.split(".");
  let cur: unknown = tree;
  for (const p of parts) {
    if (!isRecord(cur) || !Object.hasOwn(cur, p)) {
      throw new Error(`Unresolved DTCG alias: {${dotted}}`);
    }
    cur = cur[p];
  }
  if (!isTokenNode(cur)) {
    throw new Error(`Alias target {${dotted}} is a group, not a token`);
  }
  return cur as Record<string, unknown>;
}

const CURLY_REF = /^\{([^${}.][^{}.]*(?:\.[^${}.][^{}.]*)*)\}$/;

/** Resolve all curly-brace `{group.token}` aliases (whole-value and nested composite fields). */
export function resolveAliases(tree: Record<string, unknown>): Record<string, unknown> {
  const root = structuredClone(tree);

  const resolveTokenValue = (pathKey: string, stack: Set<string>): unknown => {
    if (stack.has(pathKey)) {
      throw new Error(`Circular alias detected: ${[...stack, pathKey].join(" -> ")}`);
    }
    const token = lookupToken(root, pathKey);
    const nextStack = new Set(stack);
    nextStack.add(pathKey);

    const resolveField = (val: unknown): unknown => {
      if (typeof val === "string") {
        const m = CURLY_REF.exec(val);
        if (m) return resolveTokenValue(m[1]!, nextStack);
        return val;
      }
      if (Array.isArray(val)) return val.map(resolveField);
      if (isRecord(val)) {
        return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, resolveField(v)]));
      }
      return val;
    };

    return resolveField(token.$value);
  };

  const walk = (node: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (isTokenNode(v)) {
        (v as Record<string, unknown>).$value = resolveTokenValue(p, new Set());
      } else if (isRecord(v)) {
        walk(v, p);
      }
    }
  };
  walk(root, "");
  return root;
}
