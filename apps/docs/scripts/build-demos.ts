/**
 * Package each apps/docs/demos/*.tsx with `nsh package --target web`
 * into apps/docs/public/demos/<name>/ (flattened index.html).
 *
 * Also validates every `demo:` frontmatter on component md pages has a
 * matching demos/<slug>.tsx, and every demo source is referenced by a page.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Keep low: concurrent `nsh package --target web` races on the shared web runtime wasm. */
const CONCURRENCY = 1;

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demosDir = path.join(docsRoot, "demos");
const outRoot = path.join(docsRoot, "public", "demos");
const componentsDir = path.join(docsRoot, "src", "pages", "docs", "components");

const entries = fs
  .readdirSync(demosDir)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
  .sort();

if (entries.length === 0) {
  console.error("No demos/*.tsx found");
  process.exit(1);
}

const demoSlugs = new Set(entries.map((f) => path.basename(f, ".tsx")));

function frontmatterBlock(src: string): string | null {
  if (!src.startsWith("---\n") && !src.startsWith("---\r\n")) return null;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return null;
  return src.slice(3, end);
}

function demoFromFrontmatter(block: string): string | null {
  const match = block.match(/^[ \t]*demo:[ \t]*([^\s#]+)/m);
  return match?.[1] ?? null;
}

const frontmatterDemos = new Map<string, string>();
for (const file of fs.readdirSync(componentsDir).filter((f) => f.endsWith(".md"))) {
  const src = fs.readFileSync(path.join(componentsDir, file), "utf8");
  const block = frontmatterBlock(src);
  if (!block) continue;
  const demo = demoFromFrontmatter(block);
  if (!demo) continue;
  frontmatterDemos.set(file, demo);
}

let validationFailed = false;
for (const [file, demo] of frontmatterDemos) {
  if (!demoSlugs.has(demo)) {
    console.error(`Missing demos/${demo}.tsx for frontmatter demo: in ${file}`);
    validationFailed = true;
  }
}
for (const slug of demoSlugs) {
  const referenced = [...frontmatterDemos.values()].includes(slug);
  if (!referenced) {
    console.error(`Orphan demos/${slug}.tsx — no component page sets demo: ${slug}`);
    validationFailed = true;
  }
}
if (validationFailed) {
  process.exit(1);
}

fs.mkdirSync(outRoot, { recursive: true });

function flattenPackageDir(outDir: string) {
  const kids = fs.readdirSync(outDir, { withFileTypes: true });
  if (fs.existsSync(path.join(outDir, "index.html"))) return;
  const nested = kids.find((k) => k.isDirectory());
  if (!nested) {
    throw new Error(`No index.html under ${outDir}`);
  }
  const nestedDir = path.join(outDir, nested.name);
  for (const file of fs.readdirSync(nestedDir)) {
    fs.renameSync(path.join(nestedDir, file), path.join(outDir, file));
  }
  fs.rmSync(nestedDir, { recursive: true, force: true });
}

function packageOne(file: string): Promise<void> {
  const name = path.basename(file, ".tsx");
  const entry = path.join(demosDir, file);
  const outDir = path.join(outRoot, name);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`nsh package ${name} → public/demos/${name}`);
  return new Promise((resolve, reject) => {
    const child = spawn(
      "nsh",
      ["package", entry, "--target", "web", "--out", outDir, "--name", name],
      { stdio: "inherit", cwd: demosDir },
    );
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`nsh package failed: ${name} (exit ${code})`));
        return;
      }
      try {
        flattenPackageDir(outDir);
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  });
}

async function runPool(files: string[], limit: number) {
  let next = 0;
  let failed = 0;
  const workers = Array.from({ length: Math.min(limit, files.length) }, async () => {
    while (next < files.length) {
      const i = next++;
      const file = files[i]!;
      try {
        await packageOne(file);
      } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        failed += 1;
      }
    }
  });
  await Promise.all(workers);
  return failed;
}

const started = Date.now();
const failed = await runPool(entries, CONCURRENCY);
const elapsedSec = ((Date.now() - started) / 1000).toFixed(1);

if (failed) {
  console.error(
    `\n${failed} demo(s) failed in ${elapsedSec}s. Is \`nsh\` installed and web target available?`,
  );
  process.exit(1);
}

console.log(`\n${entries.length} demos packaged under apps/docs/public/demos/ in ${elapsedSec}s`);
