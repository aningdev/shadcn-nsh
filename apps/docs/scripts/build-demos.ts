/**
 * Package each catalog demo (`apps/docs/demos/<id>.tsx`, from `scripts/catalog.ts`) with
 * `nsh package --target web` into apps/docs/public/demos/<name>/ (flattened index.html).
 *
 * The catalog's `--check` already guarantees every component has its demo and that no demo is
 * orphaned; this script only packages the set, sorted by file name so the log is stable.
 *
 * Each packaged page then gets the panel's `?idiom=` and `?theme=` (`player-options.ts`).
 *
 *   bun apps/docs/scripts/build-demos.ts [--only <id>,<id>]   # one or a few, while iterating
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { catalog } from "../../../scripts/catalog";
import { addPlayerOptions } from "./player-options";

/** Keep low: concurrent `nsh package --target web` races on the shared web runtime wasm. */
const CONCURRENCY = 1;

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cat = catalog();
const demosDir = cat.paths.demos;
const outRoot = path.join(docsRoot, "public", "demos");
const args = process.argv.slice(2);
const onlyAt = args.indexOf("--only");
/** `--only <id>,<id>`: just those demos (the whole set otherwise). */
const onlyArg = onlyAt >= 0 ? args[onlyAt + 1] : undefined;
const only = onlyArg
  ? new Set(
      onlyArg
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
  : undefined;
const entries = cat.components
  .map((component) => component.demo)
  .filter((entry) => !only || only.has(path.basename(entry, ".tsx")))
  .sort((a, b) => a.localeCompare(b));

if (entries.length === 0) {
  console.error("The catalog has no component demos");
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

function packageOne(entry: string): Promise<void> {
  const name = path.basename(entry, ".tsx");
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
        addPlayerOptions(outDir, name);
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
      const entry = files[next++]!;
      try {
        await packageOne(entry);
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
