import { Command } from "commander";

import { readApp } from "../utils/app";
import { isInstalled } from "../utils/plan";
import { fetchIndex } from "../utils/registry";

export type ListOptions = {
  cwd: string;
  registry?: string;
  /** Print the catalog as JSON (name, type, description, installed). */
  json?: boolean;
};

/**
 * Every item the registry lists, marked when the app has it (any of its files is there).
 * Reads the catalog (`index.json`); it does not fetch the items themselves.
 */
export async function runList(opts: ListOptions): Promise<number> {
  const { ws, config } = await readApp(opts.cwd, opts.registry);
  const index = await fetchIndex(config, opts.registry);
  const rows = index.items.map((item) => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    installed: isInstalled(ws.uiRoot, config, item),
  }));

  if (opts.json) {
    console.log(
      JSON.stringify({ name: index.name, homepage: index.homepage, items: rows }, null, 2),
    );
    return 0;
  }

  const nameWidth = Math.max(...rows.map((row) => row.name.length));
  const typeWidth = Math.max(...rows.map((row) => row.type.length));
  for (const row of rows) {
    const mark = row.installed ? "✓" : " ";
    const line = `${mark} ${row.name.padEnd(nameWidth)}  ${row.type.padEnd(typeWidth)}  ${row.description ?? ""}`;
    console.log(line.trimEnd());
  }
  const installed = rows.filter((row) => row.installed).length;
  console.log(`\n${rows.length} items, ${installed} installed`);
  return 0;
}

export const list = new Command()
  .name("list")
  .description("List the registry's items, marking the ones the app has")
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("--registry <url>", "registry URL template containing {name}")
  .option("--json", "print the catalog as JSON", false)
  .action(async (opts: ListOptions) => {
    process.exitCode = await runList(opts);
  });
