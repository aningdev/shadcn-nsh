import path from "node:path";
import { Command } from "commander";
import { readConfig, writeConfig } from "../utils/config";
import { installItems } from "../utils/install";
import { resolveTree } from "../utils/registry";
import { runInit } from "./init";

export const add = new Command()
  .name("add")
  .description("Add a registry component into the current NSH app")
  .argument("<components...>", "component names (e.g. button)")
  .option("-c, --cwd <cwd>", "app directory", process.cwd())
  .option("--overwrite", "overwrite existing files", false)
  .option("--registry <url>", "registry URL template containing {name}")
  .action(async (
    components: string[],
    opts: { cwd: string; overwrite: boolean; registry?: string },
  ) => {
    const cwd = path.resolve(opts.cwd);
    let config = await readConfig(cwd);

    if (!config) {
      console.log("No nsh-ui.json — running init first…");
      config = await runInit({
        cwd,
        overwrite: opts.overwrite,
        registry: opts.registry,
      });
    }

    if (opts.registry) {
      config.registry = opts.registry;
      await writeConfig(cwd, config);
    }

    const items = await resolveTree(config, components, opts.registry);
    // theme may already exist from init; skip without overwrite
    await installItems(cwd, config, items, { overwrite: opts.overwrite });
    console.log(`\nAdded: ${components.join(", ")}`);
  });
