/**
 * The published site's size, and the ceiling on it.
 *
 * `docs` publishes `apps/website/.output/public` twice — the release build at the site root and
 * `main`'s under `dev/` — into one GitHub Pages artifact that GitHub refuses above 1 GB (it warns
 * at every deploy and fails the upload past it). Half a gigabyte a channel leaves the artifact
 * room for two, so `BUDGET` is what one channel may take.
 *
 * The bytes that mattered were the runtime copied into each of the 84 demos
 * (`share-packaged.ts`); this check is what keeps a new per-app copy from creeping back.
 *
 *   bun apps/website/scripts/check-site-size.ts   # after `bun run build:docs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** What one channel of the site may take: two fit in GitHub Pages' 1 GB artifact. */
export const BUDGET = 450 * 1024 * 1024;

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.output/public");

if (!fs.existsSync(siteRoot)) {
  console.error(`${siteRoot} is not there. Run \`bun run build:docs\` first.`);
  process.exit(1);
}

/** Every top-level entry's bytes, largest first. */
const sizes = new Map<string, number>();
for (const entry of fs.readdirSync(siteRoot, { withFileTypes: true })) {
  sizes.set(
    entry.name,
    entry.isDirectory()
      ? bytesUnder(path.join(siteRoot, entry.name))
      : size(path.join(siteRoot, entry.name)),
  );
}

const rows = [...sizes].sort((a, b) => b[1] - a[1]);
const total = rows.reduce((sum, [, bytes]) => sum + bytes, 0);
const widest = Math.max(...rows.map(([name]) => name.length));

for (const [name, bytes] of rows) {
  console.log(`${name.padEnd(widest)}  ${mb(bytes).padStart(9)} MB`);
}
console.log(`${"total".padEnd(widest)}  ${mb(total).padStart(9)} MB  (budget ${mb(BUDGET)} MB)`);

if (total > BUDGET) {
  console.error(
    `\n${mb(total - BUDGET)} MB over. One copy of the runtime per app instead of one under ` +
      `public/_nsh/? See share-packaged.ts.`,
  );
  process.exit(1);
}

function bytesUnder(dir: string): number {
  let bytes = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    bytes += entry.isDirectory() ? bytesUnder(child) : size(child);
  }
  return bytes;
}

function size(file: string): number {
  return fs.statSync(file).size;
}

function mb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}
