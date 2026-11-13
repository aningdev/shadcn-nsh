/**
 * The component set: `registry.json`'s `registry:ui` items, and where each one's file, demo,
 * reference page and docs page live. This is the only module under `scripts/` that reads or
 * writes the registry, and the only one that knows the demos / docs layout; scripts ask it
 * instead of filtering the registry or walking the directories themselves.
 *
 * The NSH runtime cannot import this module (`node:fs`), so the runtime's list is generated:
 * `apps/docs/demos/catalog.generated.ts`, read by `App.tsx` and `render-cases.ts`.
 *
 *   bun run catalog           # write catalog.generated.ts
 *   bun run catalog --check   # fail when the set is inconsistent or the file is stale
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
  /** The item's name; also the file, demo, reference page and docs page name. */
  id: string;
  item: RegistryItem;
  /** `packages/ui/<id>.tsx`. */
  uiFile: string;
  /** `apps/docs/demos/<id>.tsx`. */
  demo: string;
  /** `apps/docs/demos/<id>.ref.tsx`. */
  reference: string;
  /** `apps/docs/src/pages/docs/components/<id>.md`. */
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
  /** Where a `TODO(port)` may hide: the component, theme, demo and docs directories. */
  todoRoots: string[];
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
    demos: path.join(root, "apps/docs/demos"),
    pages: path.join(root, "apps/docs/src/pages/docs/components"),
    index: path.join(root, "packages/ui/index.ts"),
    generated: path.join(root, "apps/docs/demos/catalog.generated.ts"),
  };
  const paths: CatalogPaths = {
    ...shared,
    todoRoots: [shared.ui, shared.theme, shared.demos, shared.pages],
  };
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
      reference: path.join(paths.demos, `${item.name}.ref.tsx`),
      page: path.join(paths.pages, `${item.name}.md`),
    });
  }
  return { root, paths, components };
}

/** The set alone, for callers that need no directory. */
export function components(root = DEFAULT_ROOT): Component[] {
  return catalog(root).components;
}

/** Demo files that are not a component's demo: the app entry `nsh check` / `nsh test` need and the kit. */
const NON_COMPONENT_DEMOS = new Set(["App.tsx", "kit.tsx"]);

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
 * Everything the set must satisfy: every component has its file, demo, reference page, docs page
 * and export, and no demo or page exists for an id the registry does not list.
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
    if (!isFile(component.reference))
      problems.push(`${id}: no reference page ${rel(component.reference)}`);
    if (!isFile(component.page)) problems.push(`${id}: no docs page ${rel(component.page)}`);
    if (index && !exportsModule(index, id)) {
      problems.push(`${id}: ${rel(paths.index)} does not export "./${id}"`);
    }
  }

  for (const file of filesIn(paths.demos)) {
    const where = rel(path.join(paths.demos, file));
    if (file.endsWith(".ref.tsx")) {
      const id = file.slice(0, -".ref.tsx".length);
      if (!ids.has(id)) problems.push(`${where}: reference page for no component`);
    } else if (file.endsWith(".tsx") && !file.endsWith(".test.tsx")) {
      if (NON_COMPONENT_DEMOS.has(file)) continue;
      const id = file.slice(0, -".tsx".length);
      if (!ids.has(id)) problems.push(`${where}: demo for no component`);
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
 * Render-case overrides that name no component: `render-cases.ts` would ignore them without a
 * word, so the catalog check reports them (`bun run catalog --check`).
 */
export function checkOverrides(cat: Catalog, ids: readonly string[]): string[] {
  const known = new Set(cat.components.map((component) => component.id));
  const where = path.relative(cat.root, path.join(cat.paths.demos, "render-cases.ts"));
  return ids
    .filter((id) => !known.has(id))
    .map((id) => `${where}: override for no component "${id}"`);
}

/**
 * Add a component to the registry and keep the generated module current: the catalog is the only
 * writer of `registry.json` under `scripts/`, so a caller (`port:new`) cannot add an item another
 * way. Refuses an id the registry has and an item that does not have the item shape. The file is
 * written as JSON (the caller formats it like the files it writes, `vp fmt`).
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

/** Every component's id; \`App.tsx\` and \`render-cases.ts\` read their list from here. */
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

/** Write `apps/docs/demos/catalog.generated.ts`. */
export function writeGenerated(cat: Catalog): void {
  fs.writeFileSync(cat.paths.generated, renderGenerated(cat));
}

if (import.meta.main) {
  const cat = catalog();
  const problems = checkCatalog(cat);
  // The runtime's table is plain TypeScript (no `node:fs`), so the check can import its keys.
  const { overrideIds } = await import("../apps/docs/demos/render-cases");
  problems.push(...checkOverrides(cat, overrideIds));
  if (problems.length > 0) {
    for (const problem of problems) console.error(`catalog: ${problem}`);
    console.error(`catalog: ${problems.length} problem(s)`);
    process.exit(1);
  }
  if (process.argv.includes("--check")) {
    if (!isGeneratedCurrent(cat)) {
      console.error("catalog.generated.ts is out of date; run `bun run catalog`.");
      process.exit(1);
    }
    console.log(
      `catalog ok — ${cat.components.length} components; catalog.generated.ts is current.`,
    );
  } else {
    writeGenerated(cat);
    console.log(
      `catalog: wrote ${path.relative(cat.root, cat.paths.generated)} (${cat.components.length} components).`,
    );
  }
}
