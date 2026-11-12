import { Command } from "commander";

import { readApp } from "../utils/app";
import { changeSummary, diffLines, formatDiff } from "../utils/diff";
import { hasChange, isInstalled, planItems, type PlannedFile } from "../utils/plan";
import { fetchIndex, resolveTree } from "../utils/registry";

export type DiffOptions = {
  cwd: string;
  registry?: string;
};

/**
 * Compare the app's files with the registry's, after the same import rewriting `add` does.
 *
 * Without an item, list the installed items that differ; with items, print the changed files
 * line by line. `theme.json` compares keys, not values: its palette belongs to the app (only
 * `add --overwrite` replaces it), so a theme that is only recolored is not a difference.
 *
 * Returns 1 when anything differs, so it can gate updates.
 */
export async function runDiff(names: string[], opts: DiffOptions): Promise<number> {
  const { ws, config, hasConfig } = await readApp(opts.cwd, opts.registry);
  if (!hasConfig) {
    console.log("No nsh-ui.json — run init first.");
    return 1;
  }

  const index = await fetchIndex(config, opts.registry);
  const targets = names.length
    ? names
    : index.items.filter((item) => isInstalled(ws.uiRoot, config, item)).map((item) => item.name);

  if (targets.length === 0) {
    console.log("Nothing installed.");
    return 0;
  }

  const items = await resolveTree(config, targets, opts.registry);
  const changed = (await planItems(ws.uiRoot, config, items)).filter(hasChange);

  if (changed.length === 0) {
    console.log("No differences.");
    return 0;
  }

  if (names.length === 0) {
    for (const name of targets) {
      const files = changed.filter((file) => file.item === name);
      if (files.length === 0) continue;
      const lines = files.map((file) => `  ${file.path}`);
      console.log(`${name} ${summary(files)}`);
      console.log(lines.join("\n"));
    }
    console.log(`\nRun shadcn-nsh diff <item> to see the changes.`);
    return 1;
  }

  for (const file of changed) {
    console.log(`${file.path} ${summary([file])}`);
    console.log(formatDiff(diffLines(file.existing ?? "", file.content)));
    console.log();
  }
  return 1;
}

const summary = (files: PlannedFile[]) =>
  changeSummary(
    files.reduce((total, file) => total + file.added, 0),
    files.reduce((total, file) => total + file.removed, 0),
  );

export const diff = new Command()
  .name("diff")
  .description("Compare the app's installed files with the registry's; exit 1 when they differ")
  .argument("[items...]", "item names (default: every installed item)")
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("--registry <url>", "registry URL template containing {name}")
  .action(async (items: string[], opts: DiffOptions) => {
    process.exitCode = await runDiff(items, opts);
  });
