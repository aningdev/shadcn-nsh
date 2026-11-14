import path from "node:path";

import { Command } from "commander";

import { DEFAULT_CONFIG } from "../types";
import { readApp } from "../utils/app";
import { writeConfig } from "../utils/config";
import { installDependencies } from "../utils/deps";
import { installItems } from "../utils/install";
import { fetchIndex, resolveTree } from "../utils/registry";
import { runInit } from "./init";

export type AddOptions = {
  cwd: string;
  overwrite?: boolean;
  registry?: string;
  /** Every `registry:ui` item the registry lists. */
  all?: boolean;
  /** Print what would be written; write nothing. */
  dryRun?: boolean;
};

/**
 * Copy `components` (and `--all`, every `registry:ui` item) into the app, dependencies first.
 *
 * Files the app has changed are kept unless `--overwrite`; a `theme.json` that only lacks keys
 * is merged. Naming a theme item (`add theme-shadcn`, `add theme`) switches the app's theme: its
 * files are written and `nsh-ui.json`'s `theme` records it, so every later `add` resolves the
 * `theme` dependency to it instead of writing the default theme back. The packages the items
 * declare are installed with the app's own package manager (`utils/deps.ts`). With `--dry-run`
 * nothing is written, not even `nsh-ui.json` or the theme, and the install is printed instead of
 * run.
 */
export async function runAdd(components: string[], opts: AddOptions): Promise<number> {
  const cwd = path.resolve(opts.cwd);
  const dryRun = opts.dryRun === true;
  if (components.length === 0 && !opts.all) {
    throw new Error("Name at least one component, or pass --all.");
  }
  const { ws, config: stored, hasConfig } = await readApp(cwd, opts.registry);

  let config = stored;
  if (!hasConfig) {
    if (dryRun) {
      console.log("No nsh-ui.json — a dry run uses the default aliases (run init first).");
      config = DEFAULT_CONFIG();
      if (opts.registry) config.registry = opts.registry;
    } else {
      console.log("No nsh-ui.json — running init first…");
      config = await runInit({ cwd, overwrite: opts.overwrite, registry: opts.registry });
    }
  }

  if (opts.registry) {
    config.registry = opts.registry;
    if (hasConfig && !dryRun) await writeConfig(ws.uiRoot, config);
  }

  const names = [...components];
  if (opts.all) {
    const index = await fetchIndex(config, opts.registry);
    for (const item of index.items) {
      if (item.type === "registry:ui" && !names.includes(item.name)) names.push(item.name);
    }
  }
  if (names.length === 0) {
    throw new Error("The registry lists no registry:ui item to add.");
  }

  const items = await resolveTree(config, names, opts.registry);

  // A theme item other than the app's is its new theme: its files land where a plain `add` would
  // keep the app's own, and `nsh-ui.json` records it, so later `add`s resolve `theme` to it. Naming
  // the theme the app already has is a plain `add`: its colors stay unless `--overwrite`.
  const themes = items.filter((item) => item.type === "registry:theme").map((item) => item.name);
  const named = names.filter((name) => themes.includes(name));
  if (named.length > 1) {
    throw new Error(`Name one theme, not ${named.join(", ")}: an app installs one.`);
  }
  const theme = named[0] === config.theme ? undefined : named[0];
  if (theme != null) {
    config.theme = theme;
    if (!dryRun) await writeConfig(ws.uiRoot, config);
  }

  await installItems(ws.uiRoot, config, items, {
    overwrite: opts.overwrite,
    dryRun,
    adopt: theme == null ? [] : [theme],
  });
  const installed = await installDependencies(ws.uiRoot, items, { dryRun });

  if (dryRun) {
    const count = `${names.length} item${names.length === 1 ? "" : "s"}`;
    console.log(`\nDry run: nothing written. ${count} checked.`);
    return 0;
  }

  console.log(
    opts.all ? `\nAdded: all ${names.length} registry:ui items` : `\nAdded: ${names.join(", ")}`,
  );
  if (ws.kind === "monorepo") {
    console.log(`(installed under ${path.relative(ws.root, ws.uiRoot) || "packages/ui"})`);
  }
  // The files are in; the packages they import are not, so the app does not type check yet.
  return installed?.ok === false ? 1 : 0;
}

export const add = new Command()
  .name("add")
  .description("Add registry components (monorepo: installs into packages/ui)")
  .argument("[components...]", "component names (e.g. button)")
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("-o, --overwrite", "replace files the app has changed", false)
  .option("-a, --all", "every registry:ui item the registry lists", false)
  .option("--dry-run", "print what would be written; write nothing", false)
  .option("--registry <url>", "registry URL template containing {name}")
  .action(
    async (
      components: string[],
      opts: { cwd: string; overwrite: boolean; all: boolean; dryRun: boolean; registry?: string },
    ) => {
      process.exitCode = await runAdd(components, opts);
    },
  );
