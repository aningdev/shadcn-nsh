/**
 * Scaffolds a ported component: routes it in `port-map.json`, writes the shell / demos / docs
 * skeletons, fills the region with `port:vendor`, and registers it.
 *
 *   bun run port:new <id> --from <upstream> [--symbols a,b,c] [--base <nsh/base>] [--family]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  declarations,
  defaultUiRel,
  portPaths,
  readMap,
  repo,
  route,
  targetPath,
  type PortMap,
  upstreamDir,
} from "./lib";

const templatesDir = path.join(import.meta.dir, "templates");

type Args = {
  id: string;
  from: string;
  symbols?: string[];
  base: string;
  family: boolean;
};

function usage(message?: string): never {
  if (message) console.error(`port:new: ${message}`);
  console.error(
    "usage: bun run port:new <id> --from <upstream> [--symbols a,b,c] [--base <Name>] [--family]",
  );
  process.exit(1);
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let from: string | undefined;
  let symbols: string[] | undefined;
  let base: string | undefined;
  let family = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--from") from = argv[++i];
    else if (arg === "--symbols") symbols = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (arg === "--base") base = argv[++i];
    else if (arg === "--family") family = true;
    else if (arg.startsWith("-")) usage(`unknown flag ${arg}`);
    else positional.push(arg);
  }
  const id = positional[0];
  if (!id) usage("missing <id>");
  if (!/^[a-z][a-z0-9-]*$/.test(id)) usage(`id must be kebab-case, got ${id}`);
  if (!from) usage("missing --from");
  if (positional.length > 1) usage(`unexpected args: ${positional.slice(1).join(" ")}`);
  const Id = toPascal(id);
  return { id, from, symbols, base: base ?? Id, family };
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
    console.error(`port:new: ${path.relative(repo, file)} already exists (refusing to overwrite)`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`write  ${path.relative(repo, file)}`);
}

/** Route `symbols` (or the whole file) to `ui/<id>.tsx`. Errors if anything is already routed. */
function updateMap(map: PortMap, args: Args, target: string): string[] {
  const upstreamPath = path.join(upstreamDir(map), args.from);
  if (!fs.existsSync(upstreamPath)) {
    usage(`upstream file not found: ${args.from}`);
  }
  const entry = map.files[args.from] ?? { pending: true as const };
  map.files[args.from] = entry;

  const source = fs.readFileSync(upstreamPath, "utf8");
  const allDecls = declarations(args.from, source);
  const allNames = allDecls.map((d) => d.names[0]);
  // With --symbols, also take the file's private declarations that sit with the selected
  // ones (helpers between the first and last chosen name), so the region type-checks.
  let names = args.symbols ?? allNames;
  if (args.symbols) {
    const chosen = new Set(args.symbols);
    const indexes = allDecls.map((d, i) => (chosen.has(d.names[0]) ? i : -1)).filter((i) => i >= 0);
    if (indexes.length === 0) usage(`${args.from}: none of --symbols are in the file`);
    const from = Math.min(...indexes);
    const to = Math.max(...indexes);
    const extras = allDecls
      .slice(from, to + 1)
      .map((d) => d.names[0])
      .filter(
        (name) =>
          !chosen.has(name) && !/\bexport\b/.test(allDecls.find((d) => d.names[0] === name)!.text),
      );
    names = [...new Set([...args.symbols, ...extras])];
    if (extras.length > 0) console.log(`map    + private helpers: ${extras.join(", ")}`);
  }
  if (names.length === 0) usage(`${args.from} has no declarations to route`);
  for (const name of names) {
    if (!allNames.includes(name)) usage(`${args.from} has no declaration ${name}`);
    const existing = route(entry, name);
    if (existing.kind === "ported") {
      usage(`${args.from}: ${name} is already routed to ${existing.targets.join(", ")}`);
    }
  }

  if (!args.symbols && !entry.symbols && !entry.to) {
    entry.to = target;
    delete entry.pending;
  } else {
    entry.symbols ??= {};
    for (const name of names) entry.symbols[name] = target;
    if (entry.to === target) delete entry.to;
    // Keep `pending: true` so unrouted declarations stay pending; drop it when none remain.
    if (entry.pending === true) {
      const leftover = allNames.filter((name) => route(entry, name).kind === "pending");
      if (leftover.length === 0) delete entry.pending;
    } else if (Array.isArray(entry.pending)) {
      entry.pending = entry.pending.filter((name) => !names.includes(name));
      if (entry.pending.length === 0) delete entry.pending;
    }
  }

  fs.writeFileSync(path.join(repo, "port-map.json"), `${JSON.stringify(map, null, 2)}\n`);
  console.log(`map    ${args.from} → ${target} (${names.join(", ")})`);
  return names;
}

/** Suggest imports the filled region needs, remapped from the upstream module's own imports. */
function suggestImports(map: PortMap, upstream: string, targetFile: string) {
  const upstreamSource = fs.readFileSync(path.join(upstreamDir(map), upstream), "utf8");
  const targetSource = fs.readFileSync(targetFile, "utf8");
  const importRe = /^import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from\s+"([^"]+)";/gm;
  const present = new Set<string>();
  for (const match of targetSource.matchAll(/^import\s[\s\S]*?from\s+"[^"]+";/gm)) {
    const brace = /\{([^}]+)\}/.exec(match[0]);
    if (brace) {
      for (const part of brace[1].split(",")) {
        const name = part
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim();
        if (name) present.add(name);
      }
    }
    const def = /^import\s+(?:type\s+)?(\w+)\s+from/.exec(match[0]);
    if (def) present.add(def[1]);
  }

  const suggestions: string[] = [];
  for (const match of upstreamSource.matchAll(importRe)) {
    const names = (match[1] ?? match[2] ?? "")
      .split(",")
      .map((part) =>
        part
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim(),
      )
      .filter((name): name is string => !!name);
    const from = match[3];
    let remapped = from;
    if (from === "../theme" || from.endsWith("/theme")) remapped = "@shadcn-nsh/theme";
    else if (from.startsWith("./") || from.startsWith("../")) {
      const base = path.basename(from).replace(/\.(tsx?|jsx?)$/, "");
      remapped = `./lib/${base}`;
    }
    const missing = names.filter((name) => !present.has(name));
    if (missing.length > 0) {
      suggestions.push(`import { ${missing.join(", ")} } from "${remapped}";`);
    }
  }
  if (suggestions.length > 0) {
    console.log("hint   add imports the region needs:");
    for (const line of suggestions) console.log(`       ${line}`);
  }
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

function updateRegistry(map: PortMap, args: Args, Id: string, uiRel: string) {
  const registryPath = portPaths(map).registry;
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
    items: {
      name: string;
      type: string;
      title: string;
      description: string;
      registryDependencies?: string[];
      files: { path: string; type: string; target: string }[];
    }[];
  };
  if (registry.items.some((item) => item.name === args.id)) {
    usage(`registry already has ${args.id}`);
  }
  const source = fs.readFileSync(targetPath(map, uiRel), "utf8");
  registry.items.push({
    name: args.id,
    type: "registry:ui",
    title: Id,
    description: `TODO(port): one sentence.`,
    registryDependencies: registryDeps(source, args.id),
    files: [
      {
        path: uiRel,
        type: "registry:ui",
        target: `components/ui/${args.id}.tsx`,
      },
    ],
  });
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`reg    ${args.id}`);
}

function patchList(file: string, marker: RegExp, entry: string, how: "array" | "cases") {
  const text = fs.readFileSync(file, "utf8");
  if (text.includes(entry)) {
    console.log(`skip   ${path.relative(repo, file)} (already lists ${entry})`);
    return;
  }
  let next: string;
  if (how === "array") {
    // const demos = ["button", "switch"];
    next = text.replace(marker, (match) => {
      const trimmed = match.replace(/\s*\]\s*$/, "");
      const needsComma = /"[^"]*"\s*$/.test(trimmed);
      return `${trimmed}${needsComma ? "," : ""} "${entry}"]`;
    });
  } else {
    // const cases: Case[] = [ { id: "button" }, ];
    next = text.replace(marker, (match) => {
      const insert = `  { id: "${entry}" },\n`;
      return match.replace(/\n\];\s*$/, `\n${insert}];`);
    });
  }
  if (next === text) {
    console.error(`port:new: could not patch ${path.relative(repo, file)}`);
    process.exit(1);
  }
  fs.writeFileSync(file, next);
  console.log(`patch  ${path.relative(repo, file)}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const map = readMap();
  const Id = toPascal(args.id);
  const camel = toCamel(args.id);
  const uiRel = defaultUiRel(map, args.id);
  const paths = portPaths(map);
  const vars = {
    id: args.id,
    Id,
    Base: args.base,
    basePath: args.base.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
    upstream: args.from,
    lookFn: `${camel}Look`,
    labelFn: `${camel}Label`,
  };

  updateMap(map, args, uiRel);

  const uiTemplate = args.family ? "family.tsx.tmpl" : "leaf.tsx.tmpl";
  writeNew(targetPath(map, uiRel), render(readTemplate(uiTemplate), vars));

  const vendor = spawnSync("bun", ["scripts/port/vendor.ts"], {
    cwd: repo,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (vendor.stdout) process.stdout.write(vendor.stdout);
  if (vendor.stderr) process.stderr.write(vendor.stderr);
  if (vendor.status !== 0) {
    console.error("port:new: port:vendor failed");
    process.exit(vendor.status ?? 1);
  }
  suggestImports(map, args.from, targetPath(map, uiRel));

  const demoTemplate = args.family ? "demo.family.tsx.tmpl" : "demo.tsx.tmpl";
  const refTemplate = args.family ? "demo.family.ref.tsx.tmpl" : "demo.ref.tsx.tmpl";
  writeNew(path.join(paths.demos, `${args.id}.tsx`), render(readTemplate(demoTemplate), vars));
  writeNew(path.join(paths.demos, `${args.id}.ref.tsx`), render(readTemplate(refTemplate), vars));
  writeNew(path.join(paths.docs, `${args.id}.md`), render(readTemplate("docs.md.tmpl"), vars));

  patchList(path.join(paths.demos, "App.tsx"), /const demos = \[[^\]]*\]/, args.id, "array");
  patchList(
    path.join(paths.demos, "render.test.tsx"),
    /const cases: Case\[] = \[[\s\S]*?\];/,
    args.id,
    "cases",
  );

  updateRegistry(map, args, Id, uiRel);

  const fmt = [
    targetPath(map, uiRel),
    path.join(paths.demos, `${args.id}.tsx`),
    path.join(paths.demos, `${args.id}.ref.tsx`),
    path.join(paths.demos, "App.tsx"),
    path.join(paths.demos, "render.test.tsx"),
    path.join(paths.docs, `${args.id}.md`),
    paths.registry,
    path.join(repo, "port-map.json"),
  ];
  spawnSync("vp", ["fmt", ...fmt], { cwd: repo, stdio: "inherit" });

  console.log(
    `port:new: ${args.id} scaffolded. Fill every TODO(port), then port:check / nsh check / port:render.`,
  );
}

main();
