/**
 * Package each apps/docs/demos/*.tsx with `nsh package --target web`
 * into apps/docs/public/demos/<name>/ (flattened index.html).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demosDir = path.join(docsRoot, "demos");
const outRoot = path.join(docsRoot, "public", "demos");

const entries = fs
  .readdirSync(demosDir)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"));

if (entries.length === 0) {
  console.error("No demos/*.tsx found");
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

let failed = 0;
for (const file of entries) {
  const name = path.basename(file, ".tsx");
  const entry = path.join(demosDir, file);
  const outDir = path.join(outRoot, name);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`nsh package ${name} → public/demos/${name}`);
  const result = spawnSync(
    "nsh",
    ["package", entry, "--target", "web", "--out", outDir, "--name", name],
    { stdio: "inherit", cwd: demosDir },
  );
  if (result.status !== 0) {
    console.error(`Failed: ${name}`);
    failed += 1;
    continue;
  }
  try {
    flattenPackageDir(outDir);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    failed += 1;
  }
}

if (failed) {
  console.error(`\n${failed} demo(s) failed. Is \`nsh\` installed and web target available?`);
  process.exit(1);
}

console.log("\nDemos packaged under apps/docs/public/demos/");
