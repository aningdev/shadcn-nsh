/**
 * Which render ids a diff can move: what `--changed [<ref>]` runs instead of the whole table.
 *
 * A changed `apps/website/demos/<id>.tsx` or `<id>.ref.tsx` is that id; a changed file under
 * `packages/ui` is every id whose demo or reference page imports it, directly or through other
 * files; a changed shared thing (the theme, the render table, the demo adapter, the render check
 * itself) is every id. The graph is read from the working tree with `Bun.Transpiler.scanImports`,
 * resolving the same relative paths and `nsh.json` aliases the demos import by.
 *
 * The diff is the merge base of `<ref>` and `HEAD` against the working tree, so a branch behind
 * `main` does not report `main`'s newer files as its own, and uncommitted work counts.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { cases } from "../../apps/website/demos/render-cases";
import { catalog } from "../catalog";
import { repo } from "./lib";

/** The ids the render checks draw: a page of each, in `render-cases.ts`'s order. */
export const pageIds = cases.map(({ id }) => id);

/**
 * A changed file that moves every page, with the reason printed: the theme every page reads, the
 * table of pages, the adapter the demos are drawn in, and the check itself.
 */
const everywhere: { file: string; why: string }[] = [
  { file: "apps/website/demos/nsh.json", why: "the demos' app configuration" },
  { file: "apps/website/demos/catalog.generated.ts", why: "the list of pages" },
  { file: "apps/website/demos/render-cases.ts", why: "the render table" },
  { file: "apps/website/demos/stage.tsx", why: "the demo adapter every page draws with" },
  { file: "apps/website/demos/render.test.tsx", why: "the pointer render test" },
  { file: "apps/website/demos/render-theme.test.tsx", why: "the theme render test" },
  { file: "scripts/port/render.ts", why: "the render check" },
  { file: "scripts/port/render-theme.ts", why: "the theme render check" },
  { file: "scripts/port/render-shared.ts", why: "the render checks' shared half" },
  { file: "scripts/port/affected.ts", why: "the render checks' changed-only half" },
  { file: "scripts/port/pixels.ts", why: "the render checks' comparison" },
  { file: "scripts/port/baseline.ts", why: "the baseline comparison" },
];

/** A changed directory that moves every page: the theme's tokens and finishes. */
const everywhereIn: { dir: string; why: string }[] = [
  { dir: "packages/theme/", why: "the theme every page draws with" },
];

const isFile = (file: string) => fs.existsSync(file) && fs.statSync(file).isFile();

/** A module's import paths, as written: `./x`, `@/…`, `@shadcn-nsh/…`, `nsh`. */
const transpilers = new Map<string, Bun.Transpiler>();

function transpilerFor(file: string): Bun.Transpiler {
  // A `.ts` file may write `<T>(…) =>` (a generic arrow); read with the TSX loader, `<T>` opens a
  // JSX element. `Bun.Transpiler`'s scanner is the only import reader here, so the loader follows
  // the extension, as the runtime's does.
  const loader = file.endsWith(".tsx") ? "tsx" : file.endsWith(".jsx") ? "jsx" : "ts";
  let transpiler = transpilers.get(loader);
  if (!transpiler) transpilers.set(loader, (transpiler = new Bun.Transpiler({ loader })));
  return transpiler;
}

/** The `resolve.alias` table `nsh.json` gives the demos, longest prefix first. */
function aliases(demos: string): [prefix: string, target: string][] {
  const config = JSON.parse(fs.readFileSync(path.join(demos, "nsh.json"), "utf8")) as {
    resolve?: { alias?: Record<string, string> };
  };
  return Object.entries(config.resolve?.alias ?? {})
    .map(([prefix, target]): [string, string] => [prefix, path.resolve(demos, target)])
    .sort(([a], [b]) => b.length - a.length);
}

/** The file a module path names, with the extensions TypeScript and the runtime try. */
function resolveToFile(base: string): string | undefined {
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.json`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  return candidates.find(isFile);
}

/** The file an import path names, or nothing for a package outside this repo (`nsh`, `lucide`). */
function resolveImport(from: string, spec: string, alias: [string, string][]): string | undefined {
  if (spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("/")) {
    return resolveToFile(path.resolve(path.dirname(from), spec));
  }
  for (const [prefix, target] of alias) {
    if (spec === prefix) return resolveToFile(target);
    const boundary = prefix.endsWith("/") ? prefix.length - 1 : prefix.length;
    if (spec.length > boundary && spec.startsWith(prefix) && spec[boundary] === "/") {
      return resolveToFile(path.join(target, spec.slice(boundary + 1)));
    }
  }
  return undefined;
}

/** Every file a module imports from this repo, read with Bun's scanner (TypeScript, JSX and all). */
function importsOf(file: string, alias: [string, string][]): string[] {
  if (!/\.(ts|tsx|js|jsx)$/.test(file)) return [];
  let source: string;
  try {
    source = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const found: string[] = [];
  try {
    for (const { path: spec } of transpilerFor(file).scanImports(source)) {
      const resolved = resolveImport(file, spec, alias);
      if (resolved) found.push(resolved);
    }
  } catch (error) {
    // A file that does not parse cannot list its imports; the page it belongs to fails its own
    // test, so say which file and carry on with the rest of the graph.
    console.error(
      `render: --changed: cannot read the imports of ${file}: ${(error as Error).message}`,
    );
  }
  return found;
}

/** Which pages reach each file of the repo: the graph `--changed` reads backwards. */
let graph: Map<string, Set<string>> | undefined;

function reaches(): Map<string, Set<string>> {
  if (graph) return graph;
  const demos = catalog().paths.demos;
  const alias = aliases(demos);
  const out = new Map<string, Set<string>>();
  const queue: { file: string; id: string }[] = [];
  for (const { id } of cases) {
    for (const name of [`${id}.tsx`, `${id}.ref.tsx`]) {
      queue.push({ file: path.join(demos, name), id });
    }
  }
  while (queue.length > 0) {
    const { file, id } = queue.pop()!;
    let ids = out.get(file);
    if (ids?.has(id)) continue;
    if (!ids) out.set(file, (ids = new Set()));
    ids.add(id);
    for (const dependency of importsOf(file, alias)) queue.push({ file: dependency, id });
  }
  graph = out;
  return out;
}

/** One changed file, and the pages it reaches (`all` for a shared thing). */
export type Reach = { file: string; ids: string[] | "all"; why?: string };

/** The ref `--changed` was given, or `origin/main`; `undefined` when the flag is absent. */
export function changedRef(argv = process.argv.slice(2)): string | undefined {
  const at = argv.indexOf("--changed");
  if (at < 0) return undefined;
  const next = argv[at + 1];
  return next && !next.startsWith("-") ? next : "origin/main";
}

/** `git`, run at the repo root; its output, or nothing when it fails. */
function git(args: string[]): string {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  return result.status === 0 ? result.stdout : "";
}

/** The files changed since `<ref>`, repo-relative: committed on the branch, uncommitted, new. */
function diff(ref: string): string[] {
  if (!git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]).trim()) {
    console.error(`render: --changed: no such ref: ${ref}`);
    process.exit(1);
  }
  // The merge base, not the ref's tip: a branch behind `main` must not report `main`'s own files.
  const base = git(["merge-base", ref, "HEAD"]).trim() || ref;
  const files = [
    ...git(["diff", "--name-only", base]).split("\n"),
    ...git(["ls-files", "--others", "--exclude-standard"]).split("\n"),
  ]
    .map((file) => file.trim())
    .filter(Boolean);
  return [...new Set(files)].sort();
}

/** Why a changed file moves every page, from the lists above; nothing when it moves none/one. */
function shared(file: string): string | undefined {
  return (
    everywhere.find((entry) => entry.file === file)?.why ??
    everywhereIn.find((entry) => file.startsWith(entry.dir))?.why
  );
}

/** Which pages `files` reach, each with its reason. */
export function reachesFrom(files: string[]): Reach[] {
  const pages = reaches();
  const out: Reach[] = [];
  for (const file of files) {
    const why = shared(file);
    if (why) {
      out.push({ file, ids: "all", why });
      continue;
    }
    // A demo or reference page is its own id, whether or not the graph reached it.
    const demo = /^apps\/website\/demos\/(.+)\.tsx$/.exec(file);
    const demoId = demo?.[1]?.replace(/\.ref$/, "");
    if (demoId && pageIds.includes(demoId)) {
      out.push({ file, ids: [demoId], why: `${demoId}'s page` });
      continue;
    }
    const ids = pages.get(path.join(repo, file));
    if (ids && ids.size > 0) {
      out.push({ file, ids: pageIds.filter((id) => ids.has(id)), why: "imported by these pages" });
    }
  }
  return out;
}

/**
 * The ids `--changed` names, printed with why, or `undefined` when the flag is absent. An empty
 * list is a diff that moves no page: the render checks then run nothing.
 */
export function changedIds(pass: string): string[] | undefined {
  const ref = changedRef();
  if (ref === undefined) return undefined;
  const files = diff(ref);
  const reach = reachesFrom(files);
  const all = reach.some((entry) => entry.ids === "all");
  const ids = all
    ? [...pageIds]
    : [...new Set(reach.flatMap((entry) => (entry.ids === "all" ? [] : entry.ids)))];
  if (reach.length === 0) {
    console.log(`${pass}: --changed ${ref}: ${files.length} changed files, none of them a page's`);
    return [];
  }
  console.log(
    `${pass}: --changed ${ref}: ${files.length} changed files reach ${all ? "all" : `${ids.length} of ${pageIds.length}`} ids`,
  );
  for (const entry of reach) {
    const what =
      entry.ids === "all" ? `all ${pageIds.length} ids (${entry.why})` : entry.ids.join(", ");
    console.log(`${pass}:   ${entry.file} → ${what}`);
  }
  return ids;
}

/** `--only` and `--changed` both narrow: the pages both name, in the table's order. */
export function narrowed(only: string[] | undefined, changed: string[] | undefined) {
  if (!only) return changed;
  if (!changed) return only;
  return only.filter((id) => changed.includes(id));
}

/** The string the checks print for a list of ids (`--changed`'s own lines name the files). */
export const shortList = (ids: string[]) =>
  ids.length > 6 ? `${ids.slice(0, 6).join(", ")}, … (${ids.length})` : ids.join(", ");
