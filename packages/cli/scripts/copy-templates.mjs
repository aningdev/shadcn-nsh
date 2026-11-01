import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, "..");
const repoRoot = path.resolve(pkgRoot, "../..");
const src = path.join(repoRoot, "templates", "nsh-monorepo");
const dest = path.join(pkgRoot, "dist", "templates", "nsh-monorepo");

async function copyDir(from, to) {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".nsh") continue;
    const nextFrom = path.join(from, entry.name);
    const nextTo = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyDir(nextFrom, nextTo);
    } else {
      await fs.copyFile(nextFrom, nextTo);
    }
  }
}

await fs.access(src);
await fs.rm(dest, { recursive: true, force: true });
await copyDir(src, dest);
console.log(`copied templates → ${path.relative(pkgRoot, dest)}`);
