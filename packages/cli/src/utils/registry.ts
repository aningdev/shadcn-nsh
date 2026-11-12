import fs from "node:fs/promises";
import path from "node:path";

import type { NshUiConfig, Registry, RegistryItem } from "../types";

export function itemUrl(config: NshUiConfig, name: string, registryOverride?: string) {
  const template = registryOverride ?? config.registry;
  if (!template.includes("{name}")) {
    throw new Error(`Registry URL must contain {name}: ${template}`);
  }
  return template.replaceAll("{name}", name);
}

export async function fetchItem(
  config: NshUiConfig,
  name: string,
  registryOverride?: string,
): Promise<RegistryItem> {
  const url = itemUrl(config, name, registryOverride);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as RegistryItem;
}

/** Fetch item and recursive registryDependencies (depth-first, deduped). */
export async function resolveTree(
  config: NshUiConfig,
  names: string[],
  registryOverride?: string,
): Promise<RegistryItem[]> {
  const seen = new Set<string>();
  const out: RegistryItem[] = [];

  async function walk(name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const item = await fetchItem(config, name, registryOverride);
    for (const dep of item.registryDependencies ?? []) {
      await walk(dep);
    }
    out.push(item);
  }

  for (const name of names) {
    await walk(name);
  }
  return out;
}

const IMPORT_RE = /(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;
const THEME_PACKAGE = "@shadcn-nsh/theme";
const RESOLVE_SUFFIXES = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];

/**
 * Compare each item's `registryDependencies` with what its files actually import.
 * Returns one message per mismatch (declared but unused, or imported but undeclared).
 */
export async function checkRegistryDependencies(
  registry: Registry,
  baseDir: string,
): Promise<string[]> {
  const owner = new Map<string, string>();
  for (const item of registry.items) {
    for (const file of item.files) owner.set(path.resolve(baseDir, file.path), item.name);
  }
  const hasTheme = registry.items.some((item) => item.name === "theme");

  const problems: string[] = [];
  for (const item of registry.items) {
    const used = new Set<string>();
    for (const file of item.files) {
      const abs = path.resolve(baseDir, file.path);
      if (!/\.(ts|tsx)$/.test(abs)) continue;
      const source = await fs.readFile(abs, "utf8");
      for (const match of source.matchAll(IMPORT_RE)) {
        const spec = match[1] ?? match[2];
        if (spec === THEME_PACKAGE && hasTheme) used.add("theme");
        else if (spec.startsWith(".")) {
          const target = RESOLVE_SUFFIXES.map(
            (x) => path.resolve(path.dirname(abs), spec) + x,
          ).find((candidate) => owner.has(candidate));
          if (target) used.add(owner.get(target)!);
          // A relative import no item ships would be missing in the app it is copied into.
          else problems.push(`${item.name}: imports "${spec}", which no registry item ships`);
        }
      }
    }
    used.delete(item.name);
    const declared = new Set(item.registryDependencies ?? []);
    for (const dep of used) {
      if (!declared.has(dep))
        problems.push(`${item.name}: imports "${dep}" but does not declare it`);
    }
    for (const dep of declared) {
      if (!used.has(dep)) problems.push(`${item.name}: declares "${dep}" but never imports it`);
    }
  }
  return problems;
}
