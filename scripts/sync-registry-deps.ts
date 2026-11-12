/** One-off: set each item's registryDependencies from its file imports. */
import fs from "node:fs";
import path from "node:path";

import { checkRegistryDependencies } from "../packages/cli/src/utils/registry";

const base = path.resolve(import.meta.dir, "..");
const registryPath = path.join(base, "registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
  items: { name: string; files: { path: string }[]; registryDependencies?: string[] }[];
};

const owner = new Map<string, string>();
for (const item of registry.items) {
  for (const file of item.files) owner.set(path.resolve(base, file.path), item.name);
}

const IMPORT_RE = /(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;
const THEME = "@shadcn-nsh/theme";
const SUFFIXES = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];
const hasTheme = registry.items.some((item) => item.name === "theme");

for (const item of registry.items) {
  const used = new Set<string>();
  for (const file of item.files) {
    const abs = path.resolve(base, file.path);
    if (!/\.(ts|tsx)$/.test(abs)) continue;
    const source = fs.readFileSync(abs, "utf8");
    for (const match of source.matchAll(IMPORT_RE)) {
      const spec = match[1] ?? match[2];
      if (spec === THEME && hasTheme) used.add("theme");
      else if (spec?.startsWith(".")) {
        const target = SUFFIXES.map((x) => path.resolve(path.dirname(abs), spec) + x).find((c) =>
          owner.has(c),
        );
        if (target) used.add(owner.get(target)!);
      }
    }
  }
  used.delete(item.name);
  item.registryDependencies = [...used].sort();
}

fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
const problems = await checkRegistryDependencies(registry, base);
console.log(`synced deps; ${problems.length} mismatches left`);
for (const problem of problems) console.error(problem);
process.exit(problems.length > 0 ? 1 : 0);
