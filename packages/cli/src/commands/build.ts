import fs from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import type { RegistryIndexItem, RegistryItem } from "../types";
import { checkRegistryDependencies } from "../utils/registry";
import { parseRegistry, parseRegistryItem, RegistryShapeError } from "../utils/registry-schema";

export type BuildOptions = {
  /** Directory the items are written to (created if missing). */
  output: string;
  /** Working directory `registryFile` and `output` are resolved against. */
  cwd: string;
  /**
   * Rewrites a file's content as it is published: the registry owner's own annotations (this
   * repository's `// @port` marks) are kept in the sources and dropped from what an app copies.
   */
  publish?: (content: string, path: string) => string;
};

/** Whether the JSON in `file` is a registry item named after the file (`button.json`). */
async function holdsItem(file: string, name: string): Promise<boolean> {
  let value: unknown;
  try {
    value = JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) return false; // Not JSON: not recognisably ours.
    throw error;
  }
  try {
    return parseRegistryItem(value, file).name === name;
  } catch (error) {
    if (error instanceof RegistryShapeError) return false;
    throw error;
  }
}

/**
 * Write one `<item>.json` per item of `registryFile` into `output`, plus `index.json` (the
 * catalog `list` and `add --all` read), and remove the items an earlier build wrote that
 * `registry.json` no longer lists: an orphan would still answer `add`, installing a component
 * nothing in the registry keeps up to date any more.
 *
 * A file's content is the source's, after `publish` when the registry passes one: an owner can
 * keep annotations in the sources that an app copying the file has no use for.
 *
 * Only this tool's own items are removed: a `.json` whose content is a registry item named after
 * its file. `-o` may point at a directory holding other JSON (`public`, or `.` with
 * `package.json`), and no file without that shape is deleted; `index.json` never is.
 *
 * Returns 1 when an item's `registryDependencies` disagree with what its files import (P6); the
 * output is left alone then.
 */
export async function runBuild(registryFile: string, opts: BuildOptions): Promise<number> {
  const cwd = path.resolve(opts.cwd);
  const registryPath = path.resolve(cwd, registryFile);
  const outputDir = path.resolve(cwd, opts.output);

  const registry = parseRegistry(JSON.parse(await fs.readFile(registryPath, "utf8")), registryPath);
  const problems = await checkRegistryDependencies(registry, path.dirname(registryPath));
  if (problems.length > 0) {
    for (const problem of problems) console.error(`registry: ${problem}`);
    return 1;
  }
  await fs.mkdir(outputDir, { recursive: true });

  const catalog: RegistryIndexItem[] = [];

  for (const item of registry.items) {
    const built: RegistryItem = {
      ...item,
      files: await Promise.all(
        item.files.map(async (file) => {
          const abs = path.resolve(path.dirname(registryPath), file.path);
          const source = await fs.readFile(abs, "utf8");
          return {
            ...file,
            content: opts.publish ? opts.publish(source, file.path) : source,
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
    if (!(await holdsItem(stale, name))) continue;
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
