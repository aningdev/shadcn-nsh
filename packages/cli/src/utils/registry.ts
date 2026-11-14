import fs from "node:fs/promises";
import path from "node:path";

import type { NshUiConfig, Registry, RegistryIndex, RegistryItem } from "../types";
import { DEFAULT_THEME } from "../types";

export function itemUrl(config: NshUiConfig, name: string, registryOverride?: string) {
  const template = registryOverride ?? config.registry;
  if (!template.includes("{name}")) {
    throw new Error(`Registry URL must contain {name}: ${template}`);
  }
  return template.replaceAll("{name}", name);
}

/**
 * The catalog beside the items: the item URL with `index` in place of the item's name
 * (`…/r/{name}.json` → `…/r/index.json`).
 */
export function indexUrl(config: NshUiConfig, registryOverride?: string) {
  const template = registryOverride ?? config.registry;
  if (!template.includes("{name}")) {
    throw new Error(`Registry URL must contain {name}: ${template}`);
  }
  return template.replaceAll("{name}", "index");
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

/** Fetch the catalog (`index.json`). */
export async function fetchIndex(
  config: NshUiConfig,
  registryOverride?: string,
): Promise<RegistryIndex> {
  const url = indexUrl(config, registryOverride);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${res.status} ${res.statusText}. ` +
        "A registry needs an index.json (bun run registry:build writes one).",
    );
  }
  return (await res.json()) as RegistryIndex;
}

/**
 * The item a dependency names, once the app's own theme is taken into account: every component
 * depends on `theme`, and an app that installed another theme (`nsh-ui.json`'s `theme`) gets that
 * one instead, so `add` / `add --overwrite` never write the default theme back.
 */
export function resolveDependency(config: NshUiConfig, name: string): string {
  return name === DEFAULT_THEME && config.theme !== DEFAULT_THEME ? config.theme : name;
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
      await walk(resolveDependency(config, dep));
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
 * What the baseline's runtime supplies (`nsh`, `nsh/base`, …): an app is not to install it, so an
 * import of it needs no `dependencies` entry. Every other bare import is a package the app must
 * have, and the item installs it (`lucide` today).
 */
const fromRuntime = (spec: string) => spec === "nsh" || spec.startsWith("nsh/");

/** The package an import names: `@scope/name/sub` → `@scope/name`, `name/sub` → `name`. */
export function packageOf(spec: string): string {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? spec);
}

/** The package a `dependencies` entry names: `@scope/name@^1` → `@scope/name`, `name@^1` → `name`. */
export function declaredPackage(entry: string): string {
  const at = entry.indexOf("@", 1);
  return at === -1 ? entry : entry.slice(0, at);
}

/**
 * Compare each item's `registryDependencies` and `dependencies` with what its files actually
 * import. Returns one message per mismatch (declared but unused, or imported but undeclared).
 */
export async function checkRegistryDependencies(
  registry: Registry,
  baseDir: string,
): Promise<string[]> {
  const owner = new Map<string, string>();
  /** The targets each item ships: two theme items land at the same paths, as alternatives. */
  const targets = new Map<string, Set<string>>();
  for (const item of registry.items) {
    const own = new Set<string>();
    for (const file of item.files) {
      owner.set(path.resolve(baseDir, file.path), item.name);
      if (file.target) own.add(file.target);
    }
    targets.set(item.name, own);
  }
  /** Every item that ships `theme.ts`: a component depends on `theme`, an app installs one of them. */
  const themeItems = new Set(
    registry.items.filter((item) => item.type === "registry:theme").map((item) => item.name),
  );
  const hasTheme = themeItems.has(DEFAULT_THEME);

  const problems: string[] = [];
  for (const item of registry.items) {
    const used = new Set<string>();
    const own = targets.get(item.name) ?? new Set<string>();
    /** The packages its files import that the runtime does not supply. */
    const packages = new Set<string>();
    for (const file of item.files) {
      const abs = path.resolve(baseDir, file.path);
      if (!/\.(ts|tsx)$/.test(abs)) continue;
      const source = await fs.readFile(abs, "utf8");
      for (const match of source.matchAll(IMPORT_RE)) {
        const spec = match[1] ?? match[2];
        if (spec === THEME_PACKAGE && (hasTheme || themeItems.has(item.name))) {
          // A theme item ships the theme it is; a component wants the app's theme item, which
          // `add` picks from `nsh-ui.json` (`resolveDependency`).
          used.add(themeItems.has(item.name) ? item.name : DEFAULT_THEME);
        } else if (spec.startsWith(".")) {
          // Settled at the target first: a theme item ships `lib/theme.ts` beside its own
          // `lib/finishes.json`, two themes sharing those paths.
          const beside = file.target
            ? RESOLVE_SUFFIXES.map(
                (suffix) =>
                  `${path.posix.normalize(path.posix.join(path.posix.dirname(file.target!), spec))}${suffix}`,
              )
            : [];
          if (beside.some((candidate) => own.has(candidate))) continue;

          const target = RESOLVE_SUFFIXES.map(
            (x) => path.resolve(path.dirname(abs), spec) + x,
          ).find((candidate) => owner.has(candidate));
          if (target) used.add(owner.get(target)!);
          // A relative import no item ships would be missing in the app it is copied into.
          else problems.push(`${item.name}: imports "${spec}", which no registry item ships`);
        }
        // A package the app installs: the item says which, and `add` runs the install.
        else if (spec !== THEME_PACKAGE && !fromRuntime(spec)) packages.add(packageOf(spec));
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

    const installed = new Map(
      (item.dependencies ?? []).map((entry) => [declaredPackage(entry), entry]),
    );
    for (const name of packages) {
      if (!installed.has(name))
        problems.push(`${item.name}: imports "${name}" but does not declare it in dependencies`);
    }
    for (const [name, entry] of installed) {
      if (!packages.has(name))
        problems.push(`${item.name}: declares "${entry}" but never imports it`);
    }
  }
  return problems;
}
