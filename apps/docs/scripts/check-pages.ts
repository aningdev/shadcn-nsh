/**
 * The docs' page contract, checked:
 *
 * - every `registry:ui` item has a page, and every page has an item;
 * - a page has Installation, Usage, Examples and API, and none of the old
 *   Install / Composition / Differences / Not forwarded sections;
 * - a `demo:` names an existing `apps/docs/demos/<slug>.tsx`;
 * - every name a fenced snippet imports from `@/components/ui/<id>` is
 *   exported by `packages/ui/<id>.tsx`;
 * - `components.generated.ts` is what `bun run docs:components` would write.
 *
 *   bun run check:pages
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { components } from "../src/lib/components.generated";
import { componentPlan, readPageMeta } from "./build-components";

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(docs, "../..");
const pagesDir = path.join(docs, "src/pages/docs/components");
const demosDir = path.join(docs, "demos");

type RegistryItem = { name: string; type: string };
type Fence = { lang: string; body: string; line: number };

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

function isFile(file: string): boolean {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

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

const registry = JSON.parse(fs.readFileSync(path.join(repo, "registry.json"), "utf8")) as {
  items: RegistryItem[];
};
const uiItems = registry.items.filter((item) => item.type === "registry:ui");
const pages = fs
  .readdirSync(pagesDir)
  .filter((file) => file.endsWith(".md"))
  .map((file) => file.slice(0, -3))
  .sort();

// Registry ↔ pages.
for (const item of uiItems) {
  if (!pages.includes(item.name))
    fail(`registry:ui "${item.name}" has no page in ${path.relative(repo, pagesDir)}`);
}
for (const page of pages) {
  if (!uiItems.some((item) => item.name === page)) {
    fail(`page ${path.relative(repo, path.join(pagesDir, `${page}.md`))} has no registry:ui item`);
  }
}

// Generated list.
const plan = componentPlan();
if (JSON.stringify(plan) !== JSON.stringify(components)) {
  fail("components.generated.ts is stale; run `bun run docs:components`");
}

let importCount = 0;
const required = ["Installation", "Usage", "Examples", "API"];
const old = new Set(["Install", "Composition", "Differences", "Not forwarded"]);

for (const page of pages) {
  const file = path.join(pagesDir, `${page}.md`);
  const source = fs.readFileSync(file, "utf8");
  const where = path.relative(repo, file);
  const meta = readPageMeta(source);
  const found = headings(source);

  for (const section of required) {
    if (!found.includes(section)) fail(`${where}: missing "## ${section}"`);
  }
  for (const section of found) {
    if (old.has(section)) fail(`${where}: old section "## ${section}"`);
  }

  if (meta.demo) {
    const demo = path.join(demosDir, `${meta.demo}.tsx`);
    if (!isFile(demo)) fail(`${where}: demo "${meta.demo}" has no ${path.relative(repo, demo)}`);
  }

  const modules = new Map<string, Set<string>>();
  for (const fence of fences(source)) {
    if (!["tsx", "ts", "jsx", "js"].includes(fence.lang)) continue;
    const importBlock = /import\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["']([^"']+)["']/g;
    for (const match of fence.body.matchAll(importBlock)) {
      const spec = match[2]!;
      if (!spec.startsWith("@/components/ui/")) continue;
      const id = spec.slice("@/components/ui/".length);
      const target = path.join(repo, "packages/ui", `${id}.tsx`);
      if (!modules.has(id)) {
        if (!isFile(target)) {
          fail(`${where}:${fence.line}: no ${path.relative(repo, target)} to import from`);
          modules.set(id, new Set());
          continue;
        }
        modules.set(id, exportsOf(target));
      }
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

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  console.error(`\ncheck:pages: ${problems.length} problem(s)`);
  process.exit(1);
}

console.log(
  `check:pages ok — ${uiItems.length} components, ${pages.length} pages, ${importCount} imported names`,
);
