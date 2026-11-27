/**
 * Scaffolds a component this library owns: the shell, the demo, the docs page, the registry
 * item and the index export.
 *
 *   bun run new:component <id> --base <Symbol> [--family]
 *   bun run new:component <id> --view [--family]
 *
 * `--base` draws on a `nsh/base` control. `--view` draws on `nsh`'s own elements (`View` /
 * `Text`): a separator, a skeleton, a label — a component that only lays out and styles.
 * `--family` scaffolds Root, Trigger, Content and Close (or Title and Description for a view).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { addComponent, catalog, CatalogError, type Catalog } from "./catalog";

const repo = path.resolve(import.meta.dir, "..");
const templatesDir = path.join(import.meta.dir, "templates");

type Args = {
  id: string;
  base: string;
  family: boolean;
  /** Drawn on `nsh`'s own elements (`View` / `Text`), not on a `nsh/base` control. */
  view: boolean;
};

function usage(message?: string): never {
  if (message) console.error(`new:component: ${message}`);
  console.error("usage: bun run new:component <id> (--base <Symbol> | --view) [--family]");
  process.exit(message ? 1 : 0);
}

function parseArgs(argv: string[]): Args {
  if (argv.includes("--help") || argv.includes("-h")) usage();
  if (argv.length === 0) usage("missing <id>");
  const positional: string[] = [];
  let base: string | undefined;
  let family = false;
  let view = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--base") base = argv[++i];
    else if (arg === "--view") view = true;
    else if (arg === "--family") family = true;
    else if (arg === "--help" || arg === "-h") usage();
    else if (arg.startsWith("-")) usage(`unknown flag ${arg}`);
    else positional.push(arg);
  }
  const id = positional[0];
  if (!id) usage("missing <id>");
  if (!/^[a-z][a-z0-9-]*$/.test(id)) usage(`id must be kebab-case, got ${id}`);
  if (view && base) usage("--view draws on `nsh`'s own elements: leave --base out");
  if (!view && !base) usage("name the control with --base <Symbol>, or pass --view");
  if (positional.length > 1) usage(`unexpected args: ${positional.slice(1).join(" ")}`);
  const Id = toPascal(id);
  return { id, base: base ?? Id, family, view };
}

function toPascal(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toCamel(id: string): string {
  const pascal = toPascal(id);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in vars)) throw new Error(`template missing {{${key}}}`);
    return vars[key];
  });
}

function readTemplate(name: string): string {
  return fs.readFileSync(path.join(templatesDir, name), "utf8");
}

function writeNew(file: string, text: string) {
  if (fs.existsSync(file)) {
    console.error(
      `new:component: ${path.relative(repo, file)} already exists (refusing to overwrite)`,
    );
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`write  ${path.relative(repo, file)}`);
}

/** Registry deps implied by relative / theme imports in the component file. */
function registryDeps(source: string, id: string): string[] {
  const deps = new Set<string>();
  for (const match of source.matchAll(/from\s+"([^"]+)"/g)) {
    const from = match[1];
    if (from === "@shadcn-nsh/theme") deps.add("theme");
    else if (from.startsWith("./lib/"))
      deps.add(from.slice("./lib/".length).replace(/\.tsx?$/, ""));
    else if (from.startsWith("./")) {
      const name = from.slice(2).replace(/\.tsx?$/, "");
      if (name !== id) deps.add(name);
    }
  }
  return [...deps];
}

/** Register the component: the catalog checks and writes `registry.json`, then its generated list. */
function register(args: Args, Id: string, uiRel: string, cat: Catalog) {
  const source = fs.readFileSync(path.join(repo, uiRel), "utf8");
  try {
    addComponent(cat, {
      name: args.id,
      type: "registry:ui",
      title: Id,
      description: `A ${args.id}.`,
      registryDependencies: registryDeps(source, args.id),
      files: [
        {
          path: uiRel,
          type: "registry:ui",
          target: `components/ui/${args.id}.tsx`,
        },
      ],
    });
  } catch (error) {
    if (error instanceof CatalogError) usage(error.message);
    throw error;
  }
  console.log(`reg    ${args.id}`);
}

/** Add `export * from "./<id>"` beside the other component exports in `packages/ui/index.ts`. */
function addIndexExport(indexFile: string, id: string) {
  const line = `export * from "./${id}";`;
  const text = fs.readFileSync(indexFile, "utf8");
  if (text.split(/\r?\n/).includes(line)) {
    console.log(`skip   ${path.relative(repo, indexFile)} (already exports ./${id})`);
    return;
  }
  const lines = text.split("\n");
  const libAt = lines.findIndex((entry) => /^export\b.*from "\.\/lib\//.test(entry));
  const at = libAt >= 0 ? libAt : lines.length - (lines.at(-1) === "" ? 1 : 0);
  lines.splice(at, 0, line);
  fs.writeFileSync(indexFile, lines.join("\n"));
  console.log(`index  ./${id}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const Id = toPascal(args.id);
  const camel = toCamel(args.id);
  const uiRel = `packages/ui/${args.id}.tsx`;
  const cat = catalog();
  const paths = cat.paths;
  const element = args.base.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const vars = {
    id: args.id,
    Id,
    Base: args.base,
    lookFn: `${camel}Look`,
    textFn: `${camel}Text`,
    passThrough: args.view
      ? "Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through. Style props go over the look's."
      : `Every prop of [\`nsh/base\` ${args.base}](https://nsh.dev/elements/${element}) passes through. Style props go over the look's.`,
  };

  const uiTemplate = args.view
    ? args.family
      ? "view.family.tsx.tmpl"
      : "view.tsx.tmpl"
    : args.family
      ? "base.family.tsx.tmpl"
      : "own.tsx.tmpl";
  const demoTemplate = args.view
    ? "demo.view.tsx.tmpl"
    : args.family
      ? "demo.family.tsx.tmpl"
      : "demo.tsx.tmpl";

  writeNew(path.join(repo, uiRel), render(readTemplate(uiTemplate), vars));
  writeNew(path.join(paths.demos, `${args.id}.tsx`), render(readTemplate(demoTemplate), vars));
  writeNew(path.join(paths.pages, `${args.id}.md`), render(readTemplate("docs.md.tmpl"), vars));

  register(args, Id, uiRel, cat);
  addIndexExport(paths.index, args.id);
  console.log(`catalog ./${args.id}`);

  const fmt = [
    path.join(repo, uiRel),
    path.join(paths.demos, `${args.id}.tsx`),
    path.join(paths.pages, `${args.id}.md`),
    paths.index,
    paths.registry,
    paths.generated,
  ];
  spawnSync("vp", ["fmt", ...fmt], { cwd: repo, stdio: "inherit" });

  console.log(
    `new:component: ${args.id} scaffolded. Fill the look, then bun run catalog --check, nsh check apps/website/demos, bun run check:demos and bun run registry:build.`,
  );
}

main();
