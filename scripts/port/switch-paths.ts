/**
 * One-off helpers for WP-切换: rewrite port-map targets and registry file paths after `root` becomes `.`.
 */
import fs from "node:fs";
import path from "node:path";

import { repo } from "./lib";

const PREFIX = { ui: "packages/ui/", theme: "packages/theme/" } as const;

function rewriteTarget(rel: string): string {
  if (rel.startsWith("packages/")) return rel;
  if (rel.startsWith("ui/")) return PREFIX.ui + rel.slice(3);
  if (rel.startsWith("theme/")) return PREFIX.theme + rel.slice(6);
  return rel;
}

function rewriteEntryValue(value: unknown): unknown {
  if (typeof value === "string") return rewriteTarget(value);
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? rewriteTarget(v) : v));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteEntryValue(v);
    return out;
  }
  return value;
}

export function rewritePortMap(): void {
  const file = path.join(repo, "port-map.json");
  const map = JSON.parse(fs.readFileSync(file, "utf8")) as {
    root: string;
    files: Record<string, unknown>;
  };
  map.root = ".";
  for (const [upstream, entry] of Object.entries(map.files)) {
    map.files[upstream] = rewriteEntryValue(entry) as unknown;
  }
  fs.writeFileSync(file, `${JSON.stringify(map, null, 2)}\n`);
}

export function rewriteRegistryPaths(registryPath: string): void {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
    items: { files?: { path: string }[] }[];
  };
  for (const item of registry.items) {
    for (const file of item.files ?? []) {
      file.path = rewriteTarget(file.path);
    }
  }
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

if (import.meta.main) {
  rewritePortMap();
  rewriteRegistryPaths(path.join(repo, "registry.json"));
  console.log("rewrote port-map.json and registry.json paths");
}
