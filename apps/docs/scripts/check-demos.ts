/**
 * Typecheck the demos app. `nsh check <dir>` expects App.tsx; demos are
 * one entry per file, so we check the first entry (tsconfig includes all
 * demos/*.tsx under the shared types host).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const demosDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../demos");
const entries = fs
  .readdirSync(demosDir)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
  .sort();

if (entries.length === 0) {
  console.error("No demos/*.tsx found");
  process.exit(1);
}

// Prefer button as the canonical entry when present (stable prepare:types host).
const entry = entries.includes("button.tsx") ? "button.tsx" : entries[0]!;
const target = path.join(demosDir, entry);
console.log(
  `nsh check ${path.relative(process.cwd(), target)} (demos app; ${entries.length} sources in tsconfig)`,
);
const result = spawnSync("nsh", ["check", target], { stdio: "inherit" });
process.exit(result.status === 0 ? 0 : (result.status ?? 1));
