import path from "node:path";

import { Command } from "commander";

import { readConfig, writeConfig } from "../utils/config";
import { installItems } from "../utils/install";
import { resolveTree } from "../utils/registry";
import { resolveWorkspace } from "../utils/workspace";
import { runInit } from "./init";

export const add = new Command()
  .name("add")
  .description("Add a registry component (monorepo: installs into packages/ui)")
  .argument("<components...>", "component names (e.g. button)")
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("--overwrite", "overwrite existing files", false)
  .option("--registry <url>", "registry URL template containing {name}")
  .action(
    async (components: string[], opts: { cwd: string; overwrite: boolean; registry?: string }) => {
      const cwd = path.resolve(opts.cwd);
      const ws = await resolveWorkspace(cwd);
      let config = await readConfig(ws.uiRoot);

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
        await writeConfig(ws.uiRoot, config);
      }

      const items = await resolveTree(config, components, opts.registry);
      await installItems(ws.uiRoot, config, items, { overwrite: opts.overwrite });
      console.log(`\nAdded: ${components.join(", ")}`);
      if (ws.kind === "monorepo") {
        console.log(`(installed under ${path.relative(ws.root, ws.uiRoot) || "packages/ui"})`);
      }
    },
  );
