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
  return itemUrl(config, "index", registryOverride);
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

/** `theme.json` and `DESIGN.md`: the build-time data files a theme carries. */
const THEME_DATA = new Set(["theme.json", "DESIGN.md"]);

const isCodeThemeItem = (name: string) => name.startsWith("theme-") && name !== NATIVE_THEME;

/** A theme item's core lib files without its build-time data (`theme.json`, `DESIGN.md`) or `preset.ts`. */
function rolesOnly(item: RegistryItem): RegistryItem {
  return {
    ...item,
    files: item.files.filter((file) => {
      const base = path.posix.basename(file.path);
      return !THEME_DATA.has(base) && base !== "preset.ts";
    }),
  };
}

/** A `theme-<id>` item's TS module alone (`themes/<id>.ts`), stripping `theme.json` & `DESIGN.md`. */
function codeOnly(item: RegistryItem): RegistryItem {
  return {
    ...item,
    files: item.files.filter((file) => !THEME_DATA.has(path.posix.basename(file.path))),
  };
}

/** A theme item's build-time files at app root (`theme.json`, `DESIGN.md`) plus `lib/ui/preset.ts` pointing at `themes/<id>`. */
function atBuildTime(item: RegistryItem, config: NshUiConfig): RegistryItem {
  const lib = config.aliases.lib.replace(/^\.\//, "");
  const themeTs = item.files.find((file) => file.type === "registry:lib");
  const files = item.files.flatMap((file) => {
    const name = path.posix.basename(file.path);
    if (name === "theme.json" || name === "DESIGN.md") {
      return [{ ...file, target: name }];
    }
    return [];
  });
  if (themeTs) {
    const presetTarget = path.posix.join(lib, "preset.ts");
    const themeTarget = themeTs.target ?? themeTs.path;
    let rel = path.posix
      .relative(path.posix.dirname(`/${presetTarget}`), `/${themeTarget}`)
      .replace(/\.(tsx?|jsx?)$/, "");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    files.push({
      path: "packages/theme/preset.ts",
      type: "registry:lib",
      target: presetTarget,
      content: `/**\n * Build-time theme preset (\`init --theme\`).\n */\nexport { default as presetTheme } from "${rel}";\n`,
    });
  }
  return { ...item, files };
}

/**
 * Fetch items and their `registryDependencies`, recursively (depth-first, deduped).
 */
export async function resolveTree(
  config: NshUiConfig,
  names: string[],
  registryOverride?: string,
): Promise<RegistryItem[]> {
  const seen = new Set<string>();
  const out: RegistryItem[] = [];
  const rawCache = new Map<string, RegistryItem>();
  const inFlight = new Map<string, Promise<RegistryItem>>();

  function load(name: string): Promise<RegistryItem> {
    const cached = rawCache.get(name);
    if (cached) return Promise.resolve(cached);
    const pending = inFlight.get(name);
    if (pending) return pending;
    const req = fetchItem(config, name, registryOverride)
      .then((fetched) => {
        rawCache.set(name, fetched);
        inFlight.delete(name);
        return fetched;
      })
      .catch((error) => {
        inFlight.delete(name);
        throw error;
      });
    inFlight.set(name, req);
    return req;
  }

  async function walk(name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const item = await load(name);
    const deps = item.registryDependencies ?? [];
    if (name === DEFAULT_THEME && config.theme === NATIVE_THEME) {
      await Promise.all(deps.map(load));
      for (const dep of deps) await walk(dep);
      out.push(item);
      await walk(config.theme);
      return;
    }
    if (name === DEFAULT_THEME && config.theme !== DEFAULT_THEME) {
      out.push(rolesOnly(item));
      await walk(config.theme);
      const chosen = rawCache.get(config.theme);
      if (chosen == null) throw new Error(`The registry has no item ${config.theme}.`);
      out.push(atBuildTime(chosen, config));
      return;
    }
    await Promise.all(deps.map(load));
    for (const dep of deps) {
      await walk(dep);
    }
    out.push(isCodeThemeItem(name) ? codeOnly(item) : item);
  }

  await Promise.all(names.map(load));
  for (const name of names) {
    await walk(name);
  }
  return out;
}

const IMPORT_RE = /(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;
/** The theme entry, by package name or by the relative path `packages/ui` uses. */
const THEME_SPECS = new Set(["@shadcn-nsh/theme", "../theme", "../../theme"]);
const RESOLVE_SUFFIXES = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];

/**
 * What the baseline's runtime supplies (`nsh`, `nsh/base`, …): an app is not to install it, so an
 * import of it needs no `dependencies` entry. Every other bare import is a package the app must
 * have, and the item installs it.
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
  const owners = new Map<string, Set<string>>();
  /** The targets each item ships: two theme items may share a target as alternatives. */
  const targets = new Map<string, Set<string>>();
  for (const item of registry.items) {
    const own = new Set<string>();
    for (const file of item.files) {
      const abs = path.resolve(baseDir, file.path);
      const set = owners.get(abs) ?? new Set<string>();
      set.add(item.name);
      owners.set(abs, set);
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
    const usedSets: Set<string>[] = [];
    const own = targets.get(item.name) ?? new Set<string>();
    /** The packages its files import that the runtime does not supply. */
    const packages = new Set<string>();
    for (const file of item.files) {
      const abs = path.resolve(baseDir, file.path);
      if (!/\.(ts|tsx)$/.test(abs)) continue;
      const source = await fs.readFile(abs, "utf8");
      for (const match of source.matchAll(IMPORT_RE)) {
        const spec = match[1] ?? match[2];
        if (spec == null) continue;
        // Exact theme entry only. `../theme/theme.json` stays a relative file import.
        // With no theme item, a relative theme import is ignored, same as the package name.
        if (THEME_SPECS.has(spec)) {
          if (hasTheme || themeItems.has(item.name)) {
            usedSets.push(new Set([themeItems.has(item.name) ? item.name : DEFAULT_THEME]));
          }
        } else if (spec.startsWith(".")) {
          const beside = file.target
            ? RESOLVE_SUFFIXES.map(
                (suffix) =>
                  `${path.posix.normalize(path.posix.join(path.posix.dirname(file.target!), spec))}${suffix}`,
              )
            : [];
          if (beside.some((candidate) => own.has(candidate))) continue;

          const target = RESOLVE_SUFFIXES.map(
            (x) => path.resolve(path.dirname(abs), spec) + x,
          ).find((candidate) => owners.has(candidate));
          if (target) usedSets.push(owners.get(target)!);
          else problems.push(`${item.name}: imports "${spec}", which no registry item ships`);
        }
        // A package the app installs: the item says which, and `add` runs the install.
        else if (!fromRuntime(spec)) packages.add(packageOf(spec));
      }
    }
    const declared = new Set(item.registryDependencies ?? []);
    const satisfiedDeps = new Set<string>();
    for (const candidateSet of usedSets) {
      if (candidateSet.has(item.name)) continue;
      const hit = [...candidateSet].filter((c) => declared.has(c));
      if (hit.length > 0) {
        for (const h of hit) satisfiedDeps.add(h);
      } else {
        const preferred = [...candidateSet][0]!;
        problems.push(`${item.name}: imports "${preferred}" but does not declare it`);
      }
    }
    for (const dep of declared) {
      if (!satisfiedDeps.has(dep))
        problems.push(`${item.name}: declares "${dep}" but never imports it`);
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
