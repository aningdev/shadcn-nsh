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
 * catalog `list` and `add --all` read), and remove any other `.json` there: the directory is the
 * registry, so an item `registry.json` dropped must stop being served — an orphan would still
 * answer `add`, installing a component nothing in the registry keeps up to date any more.
 *
 * Returns 1 when an item's `registryDependencies` disagree with what its files import (P6); the
 * output is left alone then.
 */
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
