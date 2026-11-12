import { Command } from "commander";

import { readApp } from "../utils/app";
import { planItems } from "../utils/plan";
import { resolveTree } from "../utils/registry";

export type ViewOptions = {
  cwd: string;
  registry?: string;
};

/**
 * Print the files `add` would write for `names`, dependencies first, at their target paths and
 * with the imports rewritten for this app — the exact bytes, so it doubles as a review.
 */
export async function runView(names: string[], opts: ViewOptions): Promise<number> {
  const { ws, config } = await readApp(opts.cwd, opts.registry);
  const items = await resolveTree(config, names, opts.registry);
  const planned = await planItems(ws.uiRoot, config, items);

  let first = true;
  for (const item of items) {
    if (!first) console.log();
    first = false;

    console.log(`${item.name} (${item.type})`);
    const deps = item.registryDependencies ?? [];
    if (deps.length > 0) console.log(`  depends on: ${deps.join(", ")}`);

    for (const file of planned.filter((entry) => entry.item === item.name)) {
      console.log(`file ${file.path}`);
      console.log(file.content.replace(/\n$/, ""));
    }
  }

  return 0;
}

export const view = new Command()
  .name("view")
  .description("Print the files an item would write, its dependencies resolved")
  .argument("<items...>", "item names (e.g. button)")
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("--registry <url>", "registry URL template containing {name}")
  .action(async (items: string[], opts: ViewOptions) => {
    process.exitCode = await runView(items, opts);
  });
