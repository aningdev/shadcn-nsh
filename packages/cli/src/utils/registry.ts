import fs from "node:fs/promises";
import path from "node:path";

import type { NshUiConfig, Registry, RegistryIndex, RegistryItem } from "../types";
import { DEFAULT_THEME, NATIVE_THEME } from "../types";
import { fetchJson } from "./fetch-cached";

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
  return (await fetchJson(
    url,
    (res) => new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`),
  )) as RegistryItem;
}

/** Fetch the catalog (`index.json`). */
export async function fetchIndex(
  config: NshUiConfig,
  registryOverride?: string,
): Promise<RegistryIndex> {
  const url = indexUrl(config, registryOverride);
  return (await fetchJson(
    url,
    (res) =>
      new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}. ` +
          "A registry needs an index.json (bun run registry:build writes one).",
      ),
  )) as RegistryIndex;
}

/**
 * Fetch the catalog only to have it cached: `diff` with no item reads it to find what is
 * installed, and offline it has only the copy an earlier command left. A command that installs
 * fetches it for that alone, so a registry without one, or a network gone by now, is no failure.
 */
export async function cacheIndex(config: NshUiConfig, registryOverride?: string): Promise<void> {
  try {
    await fetchIndex(config, registryOverride);
  } catch {
    // Nothing to keep: `diff` will say it could not check, if it ever has to.
  }
}

/** `theme.json`, `semantics.json`, standalone `.tokens.json`, and `DESIGN.md`: the data files a theme carries. */
const THEME_DATA = new Set([
  "theme.json",
  "semantics.json",
  "light.tokens.json",
  "dark.tokens.json",
  "DESIGN.md",
]);

/** A theme item's look without its data: the roles module (`lib/ui/theme.ts`), which every app has once. */
function rolesOnly(item: RegistryItem): RegistryItem {
  return {
    ...item,
    files: item.files.filter((file) => !THEME_DATA.has(path.posix.basename(file.path))),
  };
}

/** A theme item's data at the app's build-time paths: `theme.json`, `.tokens.json`, and `DESIGN.md` at root, and `semantics.json` in the lib alias. */
function atBuildTime(item: RegistryItem, config: NshUiConfig): RegistryItem {
  const lib = config.aliases.lib.replace(/^\.\//, "");
  return {
    ...item,
    files: item.files.flatMap((file) => {
      const name = path.posix.basename(file.path);
      if (
        name === "theme.json" ||
        name === "light.tokens.json" ||
        name === "dark.tokens.json" ||
        name === "DESIGN.md"
      ) {
        return [{ ...file, target: name }];
      }
      if (name === "semantics.json") return [{ ...file, target: path.posix.join(lib, name) }];
      return [];
    }),
  };
}

/**
 * Fetch items and their `registryDependencies`, recursively (depth-first, deduped).
 *
 * `theme` — named, or the dependency every component has — is the app's build-time theme,
 * `nsh-ui.json`'s `theme`. For the library's own that is the `theme` item as it is. For another
 * (`theme-shadcn`) it is the roles module (`lib/ui/theme.ts`) from `theme`, that theme in
 * `themes/<name>/` for `selectTheme`, and its data at the build-time paths `nsh.json` points at:
 * what `init --theme <name>` wrote, so `add` and `add --overwrite` never write the default colors
 * over it. Naming the other theme's item (`add theme-shadcn`) installs `themes/<name>/` alone.
 */
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
    if (name === DEFAULT_THEME && config.theme === NATIVE_THEME) {
      // Built on the default theme (the build-time one is one theme), with the others beside it.
      for (const dep of item.registryDependencies ?? []) await walk(dep);
      out.push(item);
      await walk(config.theme);
      return;
    }
    if (name === DEFAULT_THEME && config.theme !== DEFAULT_THEME) {
      out.push(rolesOnly(item));
      await walk(config.theme);
      const chosen = out.find((found) => found.name === config.theme);
      if (chosen == null) throw new Error(`The registry has no item ${config.theme}.`);
      out.push(atBuildTime(chosen, config));
      return;
    }
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
          // `add` picks from `nsh-ui.json` (`resolveTree`).
          used.add(themeItems.has(item.name) ? item.name : DEFAULT_THEME);
        } else if (spec.startsWith(".")) {
          // Settled at the target first: a theme item ships `lib/ui/theme.ts` beside its own
          // `lib/ui/semantics.json`, two themes sharing those paths.
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
