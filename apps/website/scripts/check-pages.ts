/// <reference types="bun" />

/**
 * The docs' page contract, checked:
 *
 * - a page has Installation, Usage, an optional Composition, Examples, an optional Differences
 *   from shadcn/ui, and API, in that order and nothing else; Composition is a one-line lead and
 *   one `text` fence whose tree names only parts the component exports; Examples' subsections run
 *   variant, size, state, the rest, controlled; API opens with the | Part | Props | Description |
 *   table (docs/port.md, 文档页);
 * - a `demo:` names the page's own demo;
 * - every name a fenced snippet imports from `@/components/ui/<id>` is
 *   exported by that component's file;
 * - a page's kind is derived from the official tables, so there is no
 *   hand-kept list of kinds to fall out of step;
 * - the official tables in `src/lib/official.ts` cover every file of
 *   `references/shadcn-ui`'s ui directory and every `references/nsh` element,
 *   name only pages that exist, and say why when they serve nothing;
 * - `components.generated.ts` is what `bun run docs:components` would write.
 *
 * The component set itself (page, demo and reference page exist, no orphans) is
 * `bun run catalog --check`.
 *
 *   bun run check:pages
 */
import fs from "node:fs";
import path from "node:path";

import { catalog } from "../../../scripts/catalog";
import { PALETTES } from "../demos/palettes";
import { components } from "../src/lib/components.generated";
import { NSH_ELEMENTS, SHADCN_UI, type OfficialEntry } from "../src/lib/official";
import { componentPlan, isCurrent, readPageMeta } from "./build-components";

const cat = catalog();
const repo = cat.root;

type Fence = { lang: string; body: string; line: number };

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

/** The fences of a Markdown page, with the line their content starts on. */
function fences(source: string): Fence[] {
  const out: Fence[] = [];
  const lines = source.split(/\r?\n/);
  let open: { marker: string; lang: string; body: string[]; line: number } | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const fence = /^(`{3,}|~{3,})(.*)$/.exec(line);
    if (open) {
      if (fence && fence[1]!.startsWith(open.marker) && fence[2]!.trim() === "") {
        out.push({ lang: open.lang, body: open.body.join("\n"), line: open.line });
        open = null;
      } else {
        open.body.push(line);
      }
      continue;
    }
    if (fence) {
      const info = fence[2]!.trim();
      open = {
        marker: fence[1]!,
        lang: info.split(/\s+/)[0] ?? "",
        body: [],
        line: i + 2,
      };
    }
  }
  return out;
}

/** A page's `##` sections in order, each with its body, its `###` titles and its first table's
 * header cells, fences skipped for the headings and tables only. */
type Section = {
  title: string;
  line: number;
  subsections: string[];
  firstTable: string[] | null;
  body: string[];
};

function outline(source: string): Section[] {
  const out: Section[] = [];
  let marker: string | null = null;
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const fence = /^(`{3,}|~{3,})/.exec(line);
    const current = out.at(-1);
    if (marker) {
      current!.body.push(line);
      if (fence && fence[1]!.startsWith(marker)) marker = null;
      continue;
    }
    if (fence) {
      current?.body.push(line);
      marker = fence[1]!;
      continue;
    }
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      out.push({ title: h2[1]!, line: index + 1, subsections: [], firstTable: null, body: [] });
      continue;
    }
    if (!current) continue;
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3) current.subsections.push(h3[1]!);
    else if (current.firstTable === null && /^\|.*\|\s*$/.test(line)) {
      current.firstTable = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
    }
    current.body.push(line);
  }
  return out;
}

/**
 * Where an Examples subsection sits (docs/port.md, 文档页): variants, then sizes, then states, then
 * everything else, then controlled. A title is placed by its first word.
 */
function exampleRank(title: string): number {
  const first = title.split(/\s+/)[0]!.replace(/`/g, "");
  if (["Variant", "Tone"].includes(first)) return 1;
  if (first === "Size") return 2;
  if (["Disabled", "Invalid", "Read-only", "Loading"].includes(first)) return 3;
  if (["Controlled", "Uncontrolled"].includes(first)) return 5;
  return 4;
}

/** The `##` headings outside fences, exactly as written. */
function headings(source: string): string[] {
  const out: string[] = [];
  const lines = source.split(/\r?\n/);
  let marker: string | null = null;
  for (const line of lines) {
    const fence = /^(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (fence && fence[1]!.startsWith(marker)) marker = null;
      continue;
    }
    if (fence) {
      marker = fence[1]!;
      continue;
    }
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) out.push(heading[1]!);
  }
  return out;
}

/** Every name `packages/ui` exports from a module: declarations and re-exports. */
function exportsOf(file: string): Set<string> {
  const source = fs.readFileSync(file, "utf8");
  const names = new Set<string>();
  const declaration =
    /^export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;
  for (const match of source.matchAll(declaration)) names.add(match[1]!);
  const named = /^export\s+(?:type\s+)?\{([\s\S]*?)\}\s*(?:from\s*["'][^"']*["'])?;?\s*$/gm;
  for (const match of source.matchAll(named)) {
    for (const raw of match[1]!.split(",")) {
      const part = raw.trim().replace(/^type\s+/, "");
      const alias = /\bas\s+([A-Za-z_$][\w$]*)$/.exec(part);
      if (alias) {
        names.add(alias[1]!);
      } else if (/^[A-Za-z_$][\w$]*$/.test(part)) {
        names.add(part);
      }
    }
  }
  if (/^export\s+default\b/m.test(source)) names.add("default");
  return names;
}

// Generated list. A page with no kind throws the plan away: `check:pages` reports that below.
try {
  if (!isCurrent(componentPlan(), components)) {
    fail("components.generated.ts is stale; run `bun run docs:components`");
  }
} catch (error) {
  fail((error as Error).message);
}

const byId = new Map(cat.components.map((component) => [component.id, component]));

// Kinds are derived from the official rows, so a page with no kind cannot happen: every page is
// either in a row's `ours` or it is ours. Nothing to keep in step here; the generated list above
// is checked instead.

// The official tables: every row names pages that exist, and says why when it serves none. A page
// may stand in for more than one shadcn/ui component — `input` is shadcn's `input` and its
// `textarea`, one field multiline — and its header links to the row whose id is the page
// (`shadcnOf`).
const tables: { label: string; entries: readonly OfficialEntry[] }[] = [
  { label: "src/lib/official.ts SHADCN_UI", entries: SHADCN_UI },
  { label: "src/lib/official.ts NSH_ELEMENTS", entries: NSH_ELEMENTS },
];

for (const { label, entries } of tables) {
  const ids = new Set<string>();
  const servedBy = new Map<string, string>();
  for (const entry of entries) {
    if (ids.has(entry.id)) fail(`${label}: "${entry.id}" is listed twice`);
    ids.add(entry.id);
    for (const slug of entry.ours) {
      const owner = servedBy.get(slug);
      // One page can answer for more than one shadcn/ui component (`toggle` for `toggle` and
      // `toggle-group`, `input` for `input` and `textarea`). An NSH element still names each page once.
      if (owner && !label.includes("SHADCN_UI")) {
        fail(`${label}: "${slug}" is served by "${owner}" and by "${entry.id}"`);
      }
      if (!owner) servedBy.set(slug, entry.id);
      if (!byId.has(slug) && entry.status !== "planned") {
        fail(`${label} "${entry.id}": no docs page "${slug}"`);
      }
    }
    if (entry.ours.some((slug) => byId.has(slug))) continue;
    if (!entry.status) {
      fail(`${label} "${entry.id}": nothing serves it; give it a status and a note`);
    } else if (!entry.note) {
      fail(`${label} "${entry.id}": say why in a note`);
    }
  }
}

// The official sets themselves: a component added upstream with no row here fails.
const references = path.join(repo, "references");
const names = (dir: string, extension: string): string[] | undefined => {
  if (!fs.existsSync(dir)) return undefined;
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(extension) && file !== "index.md")
    .map((file) => file.slice(0, -extension.length))
    .sort();
};

const shadcnDir = path.join(references, "shadcn-ui/apps/v4/registry/bases/base/ui");
const shadcnFiles = names(shadcnDir, ".tsx");
if (shadcnFiles) {
  const rows = new Set(SHADCN_UI.map((entry) => entry.id));
  for (const id of shadcnFiles) {
    if (!rows.has(id)) {
      fail(`references/shadcn-ui …/ui/${id}.tsx: no row in SHADCN_UI (src/lib/official.ts)`);
    }
  }
  for (const id of rows) {
    if (!shadcnFiles.includes(id))
      fail(`SHADCN_UI: "${id}" is no file in references/shadcn-ui …/ui`);
  }
}

const nshDir = path.join(references, "nsh/website/elements");
const nshFiles = names(nshDir, ".md");
if (nshFiles) {
  const rows = new Map(NSH_ELEMENTS.map((entry) => [entry.id, entry]));
  for (const id of nshFiles) {
    if (!rows.has(id)) {
      fail(
        `references/nsh/website/elements/${id}.md: no row in NSH_ELEMENTS (src/lib/official.ts)`,
      );
    }
  }
  for (const [id, entry] of rows) {
    if (!nshFiles.includes(id)) {
      fail(`NSH_ELEMENTS: "${id}" is no element in references/nsh/website/elements`);
      continue;
    }
    const source = fs.readFileSync(path.join(nshDir, `${id}.md`), "utf8");
    const group = /^group:\s*(\S+)\s*$/m.exec(source)?.[1];
    if (group && group !== entry.group) {
      fail(`NSH_ELEMENTS: "${id}" is "${group}" in references/nsh, not "${entry.group}"`);
    }
  }
}

let importCount = 0;
let treeCount = 0;
const required = ["Installation", "Usage", "Examples", "API"];
const old = new Set(["Install", "Differences", "Not forwarded", "Accessibility"]);
/** The optional part tree, between Usage and Examples. */
const COMPOSITION = "Composition";
/** The one-line lead that opens Composition. */
const COMPOSITION_LEAD = /^Use the following composition to build .+:$/;
/** The one optional section, between Examples and API. */
const DIFFERENCES = "Differences from shadcn/ui";
/** The header of the parts table that opens API. */
const API_HEADER = ["Part", "Props", "Description"];

for (const component of cat.components) {
  const file = component.page;
  const source = fs.readFileSync(file, "utf8");
  const where = path.relative(repo, file);
  const meta = readPageMeta(source);
  const found = headings(source);
  const modules = new Map<string, Set<string>>();

  // Astro parses the frontmatter as YAML, and a value it cannot read fails the site's build.
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1];
  try {
    if (frontmatter !== undefined) Bun.YAML.parse(frontmatter);
  } catch (error) {
    fail(
      `${where}: frontmatter is not YAML (${(error as Error).message}); quote a value with ": "`,
    );
  }

  for (const section of required) {
    if (!found.includes(section)) fail(`${where}: missing "## ${section}"`);
  }
  for (const section of found) {
    if (old.has(section)) fail(`${where}: old section "## ${section}"`);
  }

  // The sections, in their order, and nothing else at `##` (docs/port.md, 文档页).
  const sections = outline(source);
  const titles = sections.map((section) => section.title);
  const expected = ["Installation", "Usage"];
  if (titles.includes(COMPOSITION)) expected.push(COMPOSITION);
  expected.push("Examples");
  if (titles.includes(DIFFERENCES)) expected.push(DIFFERENCES);
  expected.push("API");
  if (titles.join("|") !== expected.join("|")) {
    fail(
      `${where}: sections are ${titles.map((t) => `"${t}"`).join(", ")}, not ${expected.map((t) => `"${t}"`).join(", ")}`,
    );
  }
  const composition = sections.find((section) => section.title === COMPOSITION);
  if (composition) {
    // One lead line, then one `text` fence: the shape of shadcn/ui's Composition.
    let fenced = false;
    const outside: string[] = [];
    for (const line of composition.body) {
      if (/^(`{3,}|~{3,})/.test(line)) {
        fenced = !fenced;
        continue;
      }
      if (!fenced && line.trim() !== "") outside.push(line.trim());
    }
    const firstLine = composition.body.find((line) => line.trim() !== "");
    if (outside.length !== 1 || !firstLine || !COMPOSITION_LEAD.test(firstLine.trim())) {
      fail(
        `${where}: "## ${COMPOSITION}" is one line "Use the following composition to build a \`X\`:" and its tree, nothing else`,
      );
    }
    const trees = fences(composition.body.join("\n"));
    if (trees.length !== 1) {
      fail(`${where}: "## ${COMPOSITION}" wants one fenced tree, not ${trees.length}`);
    }
    const tree = trees[0];
    if (tree && tree.lang !== "text") {
      fail(`${where}: "## ${COMPOSITION}" is fenced \`text\`, not \`${tree.lang}\``);
    }
    if (tree) {
      if (!modules.has(component.id)) modules.set(component.id, exportsOf(component.uiFile));
      const exported = modules.get(component.id)!;
      const parts = tree.body
        .split(/\r?\n/)
        .map((raw, index) => ({ raw, index }))
        .filter(({ raw }) => raw.trim() !== "");
      for (const { raw, index } of parts) {
        const name = raw.replace(/^[\s│├└─]+/, "").trim();
        treeCount += 1;
        if (!/^[A-Za-z_$][\w$]*$/.test(name)) {
          fail(
            `${where}:${composition.line + tree.line + index}: ${JSON.stringify(raw.trim())} is not a part name`,
          );
        } else if (!exported.has(name)) {
          fail(
            `${where}:${composition.line + tree.line + index}: ${component.id} does not export "${name}" (Composition)`,
          );
        }
      }
      if (parts.length < 2) {
        fail(`${where}: "## ${COMPOSITION}" names fewer than two parts`);
      }
    }
  }
  const examples = sections.find((section) => section.title === "Examples");
  if (examples) {
    let last = 0;
    for (const title of examples.subsections) {
      const rank = exampleRank(title);
      if (rank < last)
        fail(
          `${where}: "### ${title}" is out of order in Examples (variant, size, state, the rest, controlled)`,
        );
      last = Math.max(last, rank);
      if (/^(Variants|Sizes|Tones)\b/.test(title))
        fail(`${where}: "### ${title}" — write it singular`);
      if (/shadcn|does not have|has that/i.test(title)) {
        fail(`${where}: "### ${title}" compares with shadcn; that belongs in "## ${DIFFERENCES}"`);
      }
    }
  }
  const api = sections.find((section) => section.title === "API");
  if (api && api.firstTable?.join("|") !== API_HEADER.join("|")) {
    fail(
      `${where}: the first table in API has header ${api.firstTable ? `| ${api.firstTable.join(" | ")} |` : "none"}, not | ${API_HEADER.join(" | ")} |`,
    );
  }

  if (nshFiles) {
    for (const link of source.matchAll(/nsh\.dev\/elements\/([a-z-]+)/g)) {
      if (!nshFiles.includes(link[1]!))
        fail(`${where}: nsh.dev/elements/${link[1]} is no NSH element`);
    }
  }

  if (meta.demo && meta.demo !== component.id) {
    fail(`${where}: demo "${meta.demo}" is not "${component.id}"`);
  }

  for (const fence of fences(source)) {
    if (!["tsx", "ts", "jsx", "js"].includes(fence.lang)) continue;
    const importBlock = /import\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["']([^"']+)["']/g;
    for (const match of fence.body.matchAll(importBlock)) {
      const spec = match[2]!;
      if (!spec.startsWith("@/components/ui/")) continue;
      const id = spec.slice("@/components/ui/".length);
      const owner = byId.get(id);
      if (!owner) {
        fail(`${where}:${fence.line}: no component "${id}" to import from`);
        modules.set(id, new Set());
        continue;
      }
      if (!modules.has(id)) modules.set(id, exportsOf(owner.uiFile));
      const exported = modules.get(id)!;
      const names = match[1]!
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .split(",")
        .map((raw) => raw.trim().replace(/^type\s+/, ""))
        .filter(Boolean);
      for (const raw of names) {
        const name = /\bas\s+([A-Za-z_$][\w$]*)$/.exec(raw)
          ? raw.split(/\s+as\s+/)[0]!.trim()
          : raw;
        importCount += 1;
        if (!exported.has(name)) {
          fail(`${where}:${fence.line}: ${id} does not export "${name}"`);
        }
      }
    }
  }
}

// The themes pages and the registry: every palette the site switches to has its `theme-<id>` item
// and a page, and every `theme-*` item is one of those palettes. Each page's headings are the same
// list, in the same order, so the table of contents matches; the rows are `themePages()` over
// `demos/palettes.ts`. A palette without a page, or a page without a palette, fails.
const THEME_OUTLINE = [
  "## Installation",
  "## Tokens",
  "### The slots NSH resolves",
  "### The library's own tokens",
  "### The shared values",
  "## Finishes",
];

/** Headings in a markdown body, frontmatter stripped. The table of contents is this list. */
function themeOutline(source: string): string[] {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^#{1,6} /.test(line));
}

/** A frontmatter value, with one pair of double quotes removed. */
function frontValue(source: string, key: string): string {
  const raw = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(source)?.[1]?.trim() ?? "";
  if (raw.startsWith('"') && raw.endsWith('"')) return raw.slice(1, -1);
  return raw;
}

const themesDir = path.join(repo, "apps/website/content/docs/themes");
const themeFiles = fs.existsSync(themesDir)
  ? fs.readdirSync(themesDir).filter((name) => name.endsWith(".mdx"))
  : [];
const outlines: string[][] = [];
for (const palette of PALETTES) {
  const file = `${palette.id}.mdx`;
  const where = `apps/website/content/docs/themes/${file}`;
  if (!themeFiles.includes(file)) {
    fail(`${where}: no page for the "${palette.id}" palette`);
    continue;
  }
  const source = fs.readFileSync(path.join(themesDir, file), "utf8");
  const title = frontValue(source, "title");
  const description = frontValue(source, "description");
  if (title !== palette.label) {
    fail(
      `${where}: title is ${JSON.stringify(title)}, not the palette label ${JSON.stringify(palette.label)}`,
    );
  }
  if (description !== palette.description) {
    fail(`${where}: description does not match demos/palettes.ts`);
  }
  const outline = themeOutline(source);
  outlines.push(outline);
  if (outline.join("\n") !== THEME_OUTLINE.join("\n")) {
    fail(`${where}: headings are not the shared outline (${outline.join(" | ")})`);
  }
  for (const part of [
    `<ThemeIntro id="${palette.id}" />`,
    `<ThemeInstall id="${palette.id}" />`,
    `<ThemeTokenLead />`,
    `<ThemeTokens id="${palette.id}" group="slots" />`,
    `<ThemeTokens id="${palette.id}" group="extension" />`,
    `<ThemeTokens id="${palette.id}" group="shared" />`,
    `<ThemeFinishes id="${palette.id}" />`,
  ]) {
    if (!source.includes(part)) fail(`${where}: missing ${part}`);
  }
}
for (const file of themeFiles) {
  const id = file.replace(/\.mdx$/, "");
  if (!PALETTES.some((palette) => palette.id === id)) {
    fail(`apps/website/content/docs/themes/${file}: no palette with id "${id}"`);
  }
}
if (outlines.length > 1) {
  const first = outlines[0]!.join("\n");
  for (const outline of outlines.slice(1)) {
    if (outline.join("\n") !== first) fail("theme pages: heading lists differ");
  }
}

const themesSource = fs.readFileSync(
  path.join(repo, "apps/website/content/docs/themes.mdx"),
  "utf8",
);
if (!/<ThemeIndex \/>/.test(themesSource)) {
  fail("apps/website/content/docs/themes.mdx: does not list the theme pages");
}
if (/<ThemesPage/.test(themesSource)) {
  fail("apps/website/content/docs/themes.mdx: still draws every theme on one page");
}
const indexSource = fs.readFileSync(
  path.join(repo, "apps/website/src/components/fd/theme-index.tsx"),
  "utf8",
);
if (!/themePages\(\)/.test(indexSource)) {
  fail("apps/website/src/components/fd/theme-index.tsx: not drawn from the palette list");
}

const navSource = fs.readFileSync(path.join(repo, "apps/website/src/lib/nav.ts"), "utf8");
const navRoutes = [...navSource.matchAll(/route:\s*"([^"]+)"/g)].map((match) => match[1]!);
const themesAt = navRoutes.indexOf("/docs/themes");
const themeRoutes = PALETTES.map((palette) => `/docs/themes/${palette.id}`);
const following = navRoutes.slice(themesAt + 1, themesAt + 1 + themeRoutes.length);
if (themesAt < 0 || following.join("\n") !== themeRoutes.join("\n")) {
  fail(
    `apps/website/src/lib/nav.ts: theme pages must follow /docs/themes in palette order (${themeRoutes.join(", ")})`,
  );
}
if (!/parent:\s*"\/docs\/themes"/.test(navSource)) {
  fail("apps/website/src/lib/nav.ts: theme pages are not nested under /docs/themes");
}
const treeSource = fs.readFileSync(path.join(repo, "apps/website/src/lib/source.ts"), "utf8");
if (!/type:\s*"folder"/.test(treeSource) || !/\.parent/.test(treeSource)) {
  fail("apps/website/src/lib/source.ts: the sidebar does not nest a page under its parent");
}

const registryItems = (
  JSON.parse(fs.readFileSync(path.join(repo, "registry.json"), "utf8")) as {
    items: { name: string; type: string }[];
  }
).items;
const themeItems = new Map(registryItems.map((item) => [item.name, item]));
for (const palette of PALETTES) {
  const item = `theme-${palette.id}`;
  const entry = themeItems.get(item);
  if (!entry) {
    fail(`registry.json: no "${item}" for the "${palette.id}" palette`);
  } else if (entry.type !== "registry:theme") {
    fail(`registry.json: "${item}" is a ${entry.type}, not a registry:theme`);
  }
}
for (const item of themeItems.keys()) {
  if (!item.startsWith("theme-")) continue;
  // `theme-native` is no palette: it chooses between them at run time (`nativeTheme()`).
  if (item === "theme-native") continue;
  const id = item.slice("theme-".length);
  if (!PALETTES.some((palette) => palette.id === id)) {
    fail(`registry.json: "${item}" is no palette in apps/website/demos/palettes.ts`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  console.error(`\ncheck:pages: ${problems.length} problem(s)`);
  process.exit(1);
}

const official = [
  shadcnFiles ? `${SHADCN_UI.length} shadcn/ui` : "shadcn/ui (references/ empty)",
  nshFiles ? `${NSH_ELEMENTS.length} NSH` : "NSH (references/ empty)",
];
console.log(
  `check:pages ok — ${cat.components.length} components, ${importCount} imported names, ${treeCount} composition parts; ${official.join(", ")} answered for`,
);
