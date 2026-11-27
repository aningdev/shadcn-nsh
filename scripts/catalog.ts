/**
 * The component set: `registry.json`'s `registry:ui` items, and where each one's file, demo
 * and docs page live. This is the only module under `scripts/` that reads or writes the
 * registry, and the only one that knows the demos / docs layout; scripts ask it instead of
 * filtering the registry or walking the directories themselves.
 *
 * The NSH runtime cannot import this module (`node:fs`), so the runtime's list is generated:
 * `apps/website/demos/catalog.generated.ts`, read by `App.tsx`.
 *
 *   bun run catalog           # write catalog.generated.ts and the root nsh.json
 *   bun run catalog --check   # fail when the set is inconsistent or either file is stale
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Registry, RegistryItem } from "../packages/cli/src/types";
import {
  parseRegistry,
  parseRegistryItem,
  RegistryShapeError,
} from "../packages/cli/src/utils/registry-schema";

export type { Registry, RegistryItem };

/** `addComponent` refused the item: a bad shape, not a component, or an id the registry has. */
export class CatalogError extends Error {
  override name = "CatalogError";
}

/** One component: a `registry:ui` item and the files the set requires for it. */
export type Component = {
  /** The item's name; also the file, demo and docs page name. */
  id: string;
  item: RegistryItem;
  /** `packages/ui/<id>.tsx`. */
  uiFile: string;
  /** `apps/website/demos/<id>.tsx`. */
  demo: string;
  /** `apps/website/content/docs/components/<id>.md`. */
  page: string;
};

/** The directories the scripts share, resolved under a repo root. */
export type CatalogPaths = {
  registry: string;
  ui: string;
  theme: string;
  demos: string;
  pages: string;
  index: string;
  generated: string;
};

export type Catalog = {
  root: string;
  paths: CatalogPaths;
  /** The `registry:ui` items, in registry order. */
  components: Component[];
};

/** The repo this file is checked into, unless a caller reads a fixture. */
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The registry as written, every item checked. */
function readRegistry(file: string): Registry {
  let value: unknown;
  try {
    value = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${file}: not JSON`, { cause: error });
  }
  return parseRegistry(value, file);
}

/** The component set and its paths. Reads only `registry.json`; checks live in `checkCatalog`. */
export function catalog(root = DEFAULT_ROOT): Catalog {
  const shared = {
    registry: path.join(root, "registry.json"),
    ui: path.join(root, "packages/ui"),
    theme: path.join(root, "packages/theme"),
    demos: path.join(root, "apps/website/demos"),
    pages: path.join(root, "apps/website/content/docs/components"),
    index: path.join(root, "packages/ui/index.ts"),
    generated: path.join(root, "apps/website/demos/catalog.generated.ts"),
  };
  const paths: CatalogPaths = shared;
  const registry = readRegistry(paths.registry);
  const components: Component[] = [];
  for (const item of registry.items) {
    if (item.type !== "registry:ui") continue;
    const declared = item.files.find((file) => file.type === "registry:ui");
    components.push({
      id: item.name,
      item,
      uiFile: path.join(root, declared?.path ?? `packages/ui/${item.name}.tsx`),
      demo: path.join(paths.demos, `${item.name}.tsx`),
      page: path.join(paths.pages, `${item.name}.md`),
    });
  }
  return { root, paths, components };
}

/** The set alone, for callers that need no directory. */
export function components(root = DEFAULT_ROOT): Component[] {
  return catalog(root).components;
}

/**
 * `.tsx` files in the demos directory that are not a component's demo. The app entry, the kit
 * and the demo adapter (`stage.tsx`: `Split`, `Stage`, `Panel`, `Log`, `Segmented`, `Chips`)
 * stay here and never become registry items. Other files in the directory are data or checks
 * (`photos.ts`, `palettes.ts`, `apply-palette.ts`, `avatar-data.ts`, `editor-sample.ts`,
 * `editor-server.ts`, `props.test-d.ts`, `narrow.test.tsx`, `catalog.generated.ts`) and are
 * not demos, so this set does not name them.
 */
const NON_COMPONENT_DEMOS = new Set(["App.tsx", "kit.tsx", "stage.tsx"]);

/**
 * Demos that belong to a page of the site rather than to a component: the themes page's showcase.
 * They are packaged like the component demos (`build-demos.ts`), and the registry does not list
 * them, because they are not a control an app installs.
 */
export const PAGE_DEMOS = ["themes"] as const;

function isFile(file: string): boolean {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

/** The file names in a directory, sorted; empty when it does not exist. */
function filesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

/** True when `packages/ui/index.ts` re-exports `./<id>`, as `export *`, `export * as ns` or with names. */
function exportsModule(index: string, id: string): boolean {
  const module = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const star = new RegExp(`^export\\s*\\*\\s*from\\s*["']\\./${module}["']`, "m");
  const namespace = new RegExp(
    `^export\\s*\\*\\s*as\\s+[A-Za-z_$][\\w$]*\\s*from\\s*["']\\./${module}["']`,
    "m",
  );
  const named = new RegExp(
    `^export\\s+(?:type\\s+)?\\{[^}]*\\}\\s*from\\s*["']\\./${module}["']`,
    "m",
  );
  return star.test(index) || namespace.test(index) || named.test(index);
}

/**
 * Everything the set must satisfy: every component has its file, demo, docs page and export,
 * and no demo or page exists for an id the registry does not list.
 */
export function checkCatalog(cat: Catalog): string[] {
  const { root, paths, components: set } = cat;
  const problems: string[] = [];
  const rel = (file: string) => path.relative(root, file);
  const ids = new Set(set.map((component) => component.id));
  const index = isFile(paths.index) ? fs.readFileSync(paths.index, "utf8") : "";
  if (!index) problems.push(`${rel(paths.index)}: missing`);

  for (const component of set) {
    const { id } = component;
    const uiRel = path.relative(root, component.uiFile).split(path.sep).join("/");
    const expected = `packages/ui/${id}.tsx`;
    if (uiRel !== expected) {
      problems.push(`registry:ui "${id}" points at ${uiRel}, not ${expected}`);
    }
    if (!isFile(component.uiFile)) problems.push(`${id}: no ${uiRel}`);
    if (!isFile(component.demo)) problems.push(`${id}: no demo ${rel(component.demo)}`);
    if (!isFile(component.page)) problems.push(`${id}: no docs page ${rel(component.page)}`);
    if (index && !exportsModule(index, id)) {
      problems.push(`${id}: ${rel(paths.index)} does not export "./${id}"`);
    }
  }

  for (const file of filesIn(paths.demos)) {
    const where = rel(path.join(paths.demos, file));
    if (file.endsWith(".tsx") && !file.endsWith(".test.tsx")) {
      if (NON_COMPONENT_DEMOS.has(file)) continue;
      const id = file.slice(0, -".tsx".length);
      if (!ids.has(id) && !(PAGE_DEMOS as readonly string[]).includes(id)) {
        problems.push(`${where}: demo for no component`);
      }
    }
  }

  for (const file of filesIn(paths.pages)) {
    if (!file.endsWith(".md")) continue;
    const id = file.slice(0, -".md".length);
    if (!ids.has(id)) {
      problems.push(`${rel(path.join(paths.pages, file))}: docs page for no component`);
    }
  }

  return problems;
}

/**
 * Add a component to the registry and keep the generated module current: the catalog is the only
 * writer of `registry.json` under `scripts/`, so a caller (`new:component`) cannot add an item
 * another way. Refuses an id the registry has and an item that does not have the item shape. The
 * file is written as JSON (the caller formats it like the files it writes, `vp fmt`).
 */
export function addComponent(cat: Catalog, item: RegistryItem): void {
  let checked: RegistryItem;
  try {
    checked = parseRegistryItem(item, `registry item "${item.name}"`);
  } catch (error) {
    if (error instanceof RegistryShapeError)
      throw new CatalogError(error.message, { cause: error });
    throw error;
  }
  if (checked.type !== "registry:ui") {
    throw new CatalogError(
      `${cat.paths.registry}: a component is a registry:ui item, not "${checked.type}"`,
    );
  }
  if (!/^[a-z][a-z0-9-]*$/.test(checked.name)) {
    throw new CatalogError(`${cat.paths.registry}: "${checked.name}" is not a kebab-case id`);
  }
  const registry = readRegistry(cat.paths.registry);
  if (registry.items.some((existing) => existing.name === checked.name)) {
    throw new CatalogError(`${cat.paths.registry} already lists "${checked.name}"`);
  }
  registry.items.push(checked);
  fs.writeFileSync(cat.paths.registry, `${JSON.stringify(registry, null, 2)}\n`);
  writeGenerated(catalog(cat.root));
}

/** `vp fmt`'s print width: a list that fits on one line stays there. */
const PRINT_WIDTH = 100;

/** The generated module, formatted the way `vp fmt` leaves it. */
export function renderGenerated(cat: Catalog): string {
  const values = cat.components.map((component) => JSON.stringify(component.id));
  const inline = `export const componentIds = [${values.join(", ")}] as const;`;
  const list =
    inline.length <= PRINT_WIDTH
      ? inline
      : `export const componentIds = [\n${values.map((value) => `  ${value},`).join("\n")}\n] as const;`;
  return `// Generated by \`bun run catalog\` from registry.json's registry:ui items, in registry order.
// Do not edit: change the registry and run the script. Checked by \`bun run catalog --check\`.

/** Every component's id; \`App.tsx\` reads its list from here. */
${list}
`;
}

/** True when the checked-in module is exactly what `bun run catalog` would write. */
export function isGeneratedCurrent(cat: Catalog): boolean {
  return (
    isFile(cat.paths.generated) &&
    fs.readFileSync(cat.paths.generated, "utf8") === renderGenerated(cat)
  );
}

/** Write `apps/website/demos/catalog.generated.ts`. */
export function writeGenerated(cat: Catalog): void {
  fs.writeFileSync(cat.paths.generated, renderGenerated(cat));
}

const NSH_NAME = "shadcn-nsh";
const NSH_RANGE = ">=0.7";

/** Theme exports, in the order the manifest publishes them. Components follow, sorted. */
const THEME_EXPORTS: readonly (readonly [string, string])[] = [
  [`${NSH_NAME}/theme`, "packages/theme/index.ts"],
  [`${NSH_NAME}/themes`, "packages/theme/themes/index.ts"],
  [`${NSH_NAME}/themes/nsh-gallery`, "packages/theme/themes/nsh-gallery/index.ts"],
  [`${NSH_NAME}/themes/shadcn`, "packages/theme/themes/shadcn/index.ts"],
  [`${NSH_NAME}/themes/solid-glass`, "packages/theme/themes/solid-glass/index.ts"],
  [`${NSH_NAME}/themes/apple`, "packages/theme/themes/apple/index.ts"],
  [`${NSH_NAME}/themes/material`, "packages/theme/themes/material/index.ts"],
  [`${NSH_NAME}/themes/winui`, "packages/theme/themes/winui/index.ts"],
  [`${NSH_NAME}/themes/native`, "packages/theme/themes/native/index.ts"],
];

/** `packages/cli/package.json`'s version, or `null` when this root has no CLI package (a fixture). */
export function cliVersion(root: string): string | null {
  const file = path.join(root, "packages/cli/package.json");
  if (!isFile(file)) return null;
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { version?: unknown };
  return typeof parsed.version === "string" ? parsed.version : null;
}

/** The root `nsh.json`: the TSX `nshm` manifest. `version` matches the CLI package. */
export function renderNshManifest(cat: Catalog, version: string): string {
  const exports: Record<string, string> = {
    [NSH_NAME]: "packages/ui/index.ts",
  };
  for (const [key, target] of THEME_EXPORTS) exports[key] = target;
  for (const id of cat.components.map((component) => component.id).sort()) {
    exports[`${NSH_NAME}/${id}`] = `packages/ui/${id}.tsx`;
  }
  return `${JSON.stringify({ name: NSH_NAME, version, nsh: NSH_RANGE, exports }, null, 2)}\n`;
}

/** Component ids named by `shadcn-nsh/<id>` exports. `theme` and `themes/…` are not components. */
function componentExportIds(exports: Record<string, unknown>): string[] {
  const ids: string[] = [];
  for (const key of Object.keys(exports)) {
    const match = /^shadcn-nsh\/([^/]+)$/.exec(key);
    // `shadcn-nsh/theme` and `shadcn-nsh/themes` are the theme entry, not components.
    if (!match || match[1] === "theme" || match[1] === "themes") continue;
    ids.push(match[1]!);
  }
  return ids;
}

/**
 * The root `nsh.json` against the CLI version and the `registry:ui` set. A fixture with no CLI
 * package is not a manifest root, so it has nothing to check. A byte-level difference that still
 * names the right components is `isNshManifestCurrent`'s to report.
 */
export function checkNshManifest(cat: Catalog): string[] {
  const version = cliVersion(cat.root);
  if (version == null) return [];
  const file = path.join(cat.root, "nsh.json");
  if (!isFile(file)) return ["nsh.json: missing (run bun run catalog)"];
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return ["nsh.json: not JSON"];
  }
  if (parsed == null || typeof parsed !== "object") return ["nsh.json: not an object"];
  const manifest = parsed as { version?: unknown; exports?: unknown };
  const problems: string[] = [];
  if (manifest.version !== version) {
    problems.push(
      `nsh.json: version ${JSON.stringify(manifest.version)} does not match packages/cli/package.json ${JSON.stringify(version)}`,
    );
  }
  const exports =
    manifest.exports != null && typeof manifest.exports === "object"
      ? (manifest.exports as Record<string, unknown>)
      : {};
  const expected = new Set(cat.components.map((component) => component.id));
  const found = new Set(componentExportIds(exports));
  for (const id of [...expected].filter((name) => !found.has(name)).sort()) {
    problems.push(`nsh.json: exports missing "${id}"`);
  }
  for (const id of [...found].filter((name) => !expected.has(name)).sort()) {
    problems.push(`nsh.json: exports include "${id}", which is not a registry:ui item`);
  }
  return problems;
}

/** True when the checked-in `nsh.json` is exactly what `bun run catalog` would write. */
export function isNshManifestCurrent(cat: Catalog): boolean {
  const version = cliVersion(cat.root);
  if (version == null) return true;
  const file = path.join(cat.root, "nsh.json");
  return isFile(file) && fs.readFileSync(file, "utf8") === renderNshManifest(cat, version);
}

/** Write the root `nsh.json`. */
export function writeNshManifest(cat: Catalog): void {
  const version = cliVersion(cat.root);
  if (version == null) {
    throw new Error(
      `${cat.root}: packages/cli/package.json has no version, so nsh.json cannot be written`,
    );
  }
  fs.writeFileSync(path.join(cat.root, "nsh.json"), renderNshManifest(cat, version));
}

if (import.meta.main) {
  const cat = catalog();
  const problems = checkCatalog(cat);
  // The site's own page demos are not components, so the catalog does not require them: this does.
  for (const id of PAGE_DEMOS) {
    const file = path.join(cat.paths.demos, `${id}.tsx`);
    if (!isFile(file))
      problems.push(`${path.relative(cat.root, file)}: listed in PAGE_DEMOS, but there is no file`);
  }
  if (problems.length > 0) {
    for (const problem of problems) console.error(`catalog: ${problem}`);
    console.error(`catalog: ${problems.length} problem(s)`);
    process.exit(1);
  }
  if (process.argv.includes("--check")) {
    problems.push(...checkNshManifest(cat));
    if (problems.length > 0) {
      for (const problem of problems) console.error(`catalog: ${problem}`);
      console.error(`catalog: ${problems.length} problem(s)`);
      process.exit(1);
    }
    let stale = false;
    if (!isGeneratedCurrent(cat)) {
      console.error("catalog.generated.ts is out of date; run `bun run catalog`.");
      stale = true;
    }
    if (!isNshManifestCurrent(cat)) {
      console.error("nsh.json is out of date; run `bun run catalog`.");
      stale = true;
    }
    if (stale) process.exit(1);
    console.log(
      `catalog ok — ${cat.components.length} components; catalog.generated.ts and nsh.json are current.`,
    );
  } else {
    writeGenerated(cat);
    writeNshManifest(cat);
    console.log(
      `catalog: wrote ${path.relative(cat.root, cat.paths.generated)} and nsh.json (${cat.components.length} components).`,
    );
  }
}
