/**
 * Which render ids and themes a diff can move: what `--changed [<ref>]` runs instead of the whole
 * table.
 *
 * A changed `apps/website/demos/<id>.tsx` or `<id>.ref.tsx` is that id; a changed file under
 * `packages/ui` is every id whose demo or reference page imports it, directly or through other
 * files; a changed shared thing (the render table, the demo adapter, the render check itself) is
 * every id. The graph is read from the working tree with `Bun.Transpiler.scanImports`, resolving
 * the same relative paths and `nsh.json` aliases the demos import by.
 *
 * A changed theme is classified first (`scripts/theme/diff.ts`): a colour moves no page on its
 * own, a dimension or another value moves every page in the themes that carry it, and a key added
 * or removed, or a changed source outside the values, moves every page in every theme. A theme
 * change and a component change add up: the pages keep the whole theme pool when the change moves
 * them, because a page's colours come from whichever theme it is drawn in.
 *
 * The diff is the merge base of `<ref>` and `HEAD` against the working tree, so a branch behind
 * `main` does not report `main`'s newer files as its own, and uncommitted work counts.
 */
import fs from "node:fs";
import path from "node:path";

import { cases } from "../../apps/website/demos/render-cases";
import { catalog } from "../catalog";
import { classifyDiff, type ChangeKind, type ThemeDiff } from "../theme/diff";
import { repo } from "./lib";

/** The ids the render checks draw: a page of each, in `render-cases.ts`'s order. */
export const pageIds = cases.map(({ id }) => id);

/**
 * A changed file that moves every page, with the reason printed: the table of pages, the adapter
 * the demos are drawn in, and the check itself.
 */
const everywhere: { file: string; why: string }[] = [
  { file: "apps/website/demos/nsh.json", why: "the demos' app configuration" },
  { file: "apps/website/demos/catalog.generated.ts", why: "the list of pages" },
  { file: "apps/website/demos/render-cases.ts", why: "the render table" },
  { file: "apps/website/demos/stage.tsx", why: "the demo adapter every page draws with" },
  { file: "apps/website/demos/render.test.tsx", why: "the pointer render test" },
  { file: "apps/website/demos/render-theme.test.tsx", why: "the theme render test" },
  { file: "apps/website/demos/render-theme-components.test.tsx", why: "the theme render test" },
  { file: "apps/website/demos/render-theme-pages.tsx", why: "the theme render test" },
  { file: "scripts/port/render.ts", why: "the render check" },
  { file: "scripts/port/render-theme.ts", why: "the theme render check" },
  { file: "scripts/port/render-shared.ts", why: "the render checks' shared half" },
  { file: "scripts/port/affected.ts", why: "the render checks' changed-only half" },
  { file: "scripts/port/pixels.ts", why: "the render checks' comparison" },
  { file: "scripts/port/baseline.ts", why: "the baseline comparison" },
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

/** Why a changed file moves every page; nothing when it moves none or one. */
function shared(file: string): string | undefined {
  return everywhere.find((entry) => entry.file === file)?.why;
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

/** Which ids and themes a theme change moves, and why. */
export type ThemeScope = { ids: "all" | "none"; themes: string[]; why: string[] };

/**
 * Narrow a changed theme: `kinds` maps every theme to the kinds `theme:diff` found in it; `contract`
 * names the changed sources outside the values; `pool` is the themes the pass draws. A changed key
 * is `colour` (no page draws it on its own), `value` (every page in that theme) or `contract`
 * (every page in every theme, the theme's reader and the build included).
 */
export function themeScope(
  kinds: Record<string, readonly ChangeKind[]>,
  contract: string[],
  pool: string[],
): ThemeScope {
  const contracted = Object.entries(kinds)
    .filter(([, found]) => found.includes("contract"))
    .map(([id]) => id);
  if (contract.length > 0 || contracted.length > 0) {
    const why = contract.map((source) => `the theme's contract changed: ${source}`);
    if (contract.length === 0 && contracted.length > 0) {
      why.push(`keys added or removed in ${contracted.join(", ")}`);
    }
    return { ids: "all", themes: [...pool], why };
  }
  const valued = Object.entries(kinds)
    .filter(([, found]) => found.includes("value"))
    .map(([id]) => id);
  if (valued.length > 0) {
    const themes = pool.filter((id) => valued.includes(id));
    if (themes.length === 0) {
      return {
        ids: "none",
        themes: [],
        why: [`values changed in ${valued.join(", ")} only; this pass draws ${pool.join(", ")}`],
      };
    }
    return {
      ids: "all",
      themes,
      why: [
        `${themes.join(", ")}: a dimension, type, shadow, material, state, motion or opacity changed`,
      ],
    };
  }
  const coloured = Object.entries(kinds)
    .filter(([, found]) => found.includes("colour"))
    .map(([id]) => id);
  if (coloured.length > 0) {
    return {
      ids: "none",
      themes: [],
      why: [
        `only colours changed in ${coloured.join(", ")}: no page draws one on its own; \`theme:diff\` checks the values and \`theme:contrast\` the role pairs`,
      ],
    };
  }
  return { ids: "none", themes: [], why: [] };
}

/** What `--changed` narrows a pass to; both `undefined` when the flag is absent. */
export type Scope = { ids: string[] | undefined; themes: string[] | undefined; why: string[] };

/**
 * The ids and themes `--changed` names, printed with why, or `undefined` for both when the flag is
 * absent. An empty list is a diff that moves no page: the render checks then run nothing. `pool` is
 * every theme the pass draws, named in the reason a theme change outside it prints.
 */
export function changedScope(pass: string, pool: string[]): Scope {
  const ref = changedRef();
  if (ref === undefined) return { ids: undefined, themes: undefined, why: [] };
  let diff: ThemeDiff;
  try {
    diff = classifyDiff(ref);
  } catch (error) {
    console.error(`${pass}: --changed: ${(error as Error).message}`);
    process.exit(1);
  }
  // Theme files are the classifier's half; only a component file reaches the page graph.
  const reach = reachesFrom(diff.files.filter((file) => !file.startsWith("packages/theme/")));
  const all = reach.some((entry) => entry.ids === "all");
  const componentIds = all
    ? [...pageIds]
    : [...new Set(reach.flatMap((entry) => (entry.ids === "all" ? [] : entry.ids)))];
  const theme = themeScope(
    Object.fromEntries(Object.entries(diff.themes).map(([id, change]) => [id, change.kinds])),
    diff.contract.map(({ file, why }) => `${file} (${why})`),
    pool,
  );
  const ids = [...new Set([...componentIds, ...(theme.ids === "all" ? pageIds : [])])];
  const themes = componentIds.length > 0 ? [...pool] : theme.themes;
  const why = [
    ...(componentIds.length > 0
      ? [`${componentIds.length} of ${pageIds.length} pages import the changed code`]
      : []),
    ...theme.why,
  ];
  if (ids.length === 0) {
    console.log(
      `${pass}: --changed ${ref}: ${diff.files.length} changed files reach no page or theme`,
    );
    for (const line of why) console.log(`${pass}:   ${line}`);
    return { ids, themes: [], why };
  }
  console.log(
    `${pass}: --changed ${ref}: ${diff.files.length} changed files reach ${ids.length} of ${pageIds.length} ids, ${themes.length} of ${pool.length} themes`,
  );
  for (const entry of reach) {
    const what =
      entry.ids === "all" ? `all ${pageIds.length} ids (${entry.why})` : entry.ids.join(", ");
    console.log(`${pass}:   ${entry.file} → ${what}`);
  }
  for (const line of theme.why) console.log(`${pass}:   ${line}`);
  return { ids, themes, why };
}

/** `--only` and `--changed` both narrow: the pages both name, in the table's order. */
export function narrowed(only: string[] | undefined, changed: string[] | undefined) {
  if (!only) return changed;
  if (!changed) return only;
  return only.filter((id) => changed.includes(id));
}
