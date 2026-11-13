import fs from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import type { Registry, RegistryIndexItem, RegistryItem } from "../types";
import { checkRegistryDependencies } from "../utils/registry";

export type BuildOptions = {
  /** Directory the items are written to (created if missing). */
  output: string;
  /** Working directory `registryFile` and `output` are resolved against. */
  cwd: string;
};

/**
 * Write one `<item>.json` per item of `registryFile` into `output`, plus `index.json` (the
 * catalog `list` and `add --all` read), and remove the items an earlier build wrote that
 * `registry.json` no longer lists: an orphan would still answer `add`, installing a component
 * nothing in the registry keeps up to date any more.
 *
 * Only this tool's own items are removed: a `.json` named in the `index.json` already in the
 * directory (what the last build left), or one whose content is a registry item named after its
 * file. `-o` may point at a directory holding other JSON (`public`, or `.` with `package.json`),
 * and no file this tool did not write is deleted; `index.json` never is.
 *
 * Returns 1 when an item's `registryDependencies` disagree with what its files import (P6); the
 * output is left alone then.
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Whether `value` is a registry item, as `build` writes it: a name, a `registry:` type and files
 * with a `path` and a `type`. A `package.json` or `tsconfig.json` is not one.
 */
function isRegistryItem(value: unknown, name: string): boolean {
  return (
    isRecord(value) &&
    value.name === name &&
    typeof value.type === "string" &&
    value.type.startsWith("registry:") &&
    Array.isArray(value.files) &&
    value.files.every(
      (file) => isRecord(file) && typeof file.path === "string" && typeof file.type === "string",
    )
  );
}

/** The item names the `index.json` already in `dir` lists; empty when there is none (or it is unreadable). */
async function previousItems(dir: string): Promise<Set<string>> {
  let source: string;
  try {
    source = await fs.readFile(path.join(dir, "index.json"), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Set();
    throw error;
  }
  let index: unknown;
  try {
    index = JSON.parse(source);
  } catch {
    // A corrupt index says nothing about what the last build wrote; the item shape still does.
    return new Set();
  }
  if (!isRecord(index) || !Array.isArray(index.items)) return new Set();
  return new Set(
    index.items
      .filter((item): item is { name: string } => isRecord(item) && typeof item.name === "string")
      .map((item) => item.name),
  );
}

/** Whether the JSON in `file` is an item this tool wrote, under the file's own name (`button.json`). */
async function holdsItem(file: string, name: string): Promise<boolean> {
  let value: unknown;
  try {
    value = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return false; // Not JSON, or not readable: not recognisably ours, so left alone.
  }
  return isRegistryItem(value, name);
}

export async function runBuild(registryFile: string, opts: BuildOptions): Promise<number> {
  const cwd = path.resolve(opts.cwd);
  const registryPath = path.resolve(cwd, registryFile);
  const outputDir = path.resolve(cwd, opts.output);

  const registry = JSON.parse(await fs.readFile(registryPath, "utf8")) as Registry;
  const problems = await checkRegistryDependencies(registry, path.dirname(registryPath));
  if (problems.length > 0) {
    for (const problem of problems) console.error(`registry: ${problem}`);
    return 1;
  }
  await fs.mkdir(outputDir, { recursive: true });
  // Before `index.json` is replaced: what the last build wrote there.
  const earlier = await previousItems(outputDir);

  const catalog: RegistryIndexItem[] = [];

  for (const item of registry.items) {
    const built: RegistryItem = {
      ...item,
      files: await Promise.all(
        item.files.map(async (file) => {
          const abs = path.resolve(path.dirname(registryPath), file.path);
          const content = await fs.readFile(abs, "utf8");
          return {
            ...file,
            content,
          };
        }),
      ),
    };

    const outFile = path.join(outputDir, `${item.name}.json`);
    await fs.writeFile(outFile, `${JSON.stringify(built, null, 2)}\n`, "utf8");
    catalog.push({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      // The targets `list` checks and `add` writes, without the contents.
      files: item.files.map((file) => ({
        path: file.path,
        type: file.type,
        target: file.target,
      })),
    });
    console.log(`built ${path.relative(cwd, outFile)}`);
  }

  const indexPath = path.join(outputDir, "index.json");
  await fs.writeFile(
    indexPath,
    `${JSON.stringify({ name: registry.name, homepage: registry.homepage, items: catalog }, null, 2)}\n`,
    "utf8",
  );
  console.log(`built ${path.relative(cwd, indexPath)}`);

  const written = new Set([...registry.items.map((item) => `${item.name}.json`), "index.json"]);
  for (const entry of await fs.readdir(outputDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json") || written.has(entry.name)) continue;
    const stale = path.join(outputDir, entry.name);
    const name = entry.name.slice(0, -".json".length);
    if (!earlier.has(name) && !(await holdsItem(stale, name))) continue;
    await fs.rm(stale);
    console.log(`removed ${path.relative(cwd, stale)} (not in ${path.basename(registryPath)})`);
  }

  return 0;
}

export const build = new Command()
  .name("build")
  .description("Build registry items into public/r/*.json")
  .argument("[registry]", "path to registry.json", "./registry.json")
  .option("-o, --output <path>", "output directory", "./public/r")
  .option("-c, --cwd <cwd>", "working directory", process.cwd())
  .action(async (registryFile: string, opts: { output: string; cwd: string }) => {
    process.exitCode = await runBuild(registryFile, opts);
  });
