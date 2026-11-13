/**
 * The docs' page contract, checked:
 *
 * - a page has Installation, Usage, Examples and API, and none of the old
 *   Install / Composition / Differences / Not forwarded sections;
 * - a `demo:` names the page's own demo;
 * - every name a fenced snippet imports from `@/components/ui/<id>` is
 *   exported by that component's file;
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
import { components } from "../src/lib/components.generated";
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

// Generated list.
const plan = componentPlan();
if (!isCurrent(plan, components)) {
  fail("components.generated.ts is stale; run `bun run docs:components`");
}

const byId = new Map(cat.components.map((component) => [component.id, component]));
let importCount = 0;
const required = ["Installation", "Usage", "Examples", "API"];
const old = new Set(["Install", "Composition", "Differences", "Not forwarded"]);

for (const component of cat.components) {
  const file = component.page;
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

  if (meta.demo && meta.demo !== component.id) {
    fail(`${where}: demo "${meta.demo}" is not "${component.id}"`);
  }

  const modules = new Map<string, Set<string>>();
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

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  console.error(`\ncheck:pages: ${problems.length} problem(s)`);
  process.exit(1);
}

console.log(`check:pages ok — ${cat.components.length} components, ${importCount} imported names`);
