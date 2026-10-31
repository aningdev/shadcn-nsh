import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import type { Registry, RegistryItem } from "../types";

export const build = new Command()
  .name("build")
  .description("Build registry items into public/r/*.json")
  .argument("[registry]", "path to registry.json", "./registry.json")
  .option("-o, --output <path>", "output directory", "./public/r")
  .option("-c, --cwd <cwd>", "working directory", process.cwd())
  .action(async (registryFile: string, opts: { output: string; cwd: string }) => {
    const cwd = path.resolve(opts.cwd);
    const registryPath = path.resolve(cwd, registryFile);
    const outputDir = path.resolve(cwd, opts.output);

    const registry = JSON.parse(await fs.readFile(registryPath, "utf8")) as Registry;
    await fs.mkdir(outputDir, { recursive: true });

    const catalog: { name: string; type: string; title?: string; description?: string }[] = [];

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
  });
