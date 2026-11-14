import fs from "node:fs/promises";
import path from "node:path";

import type { NshUiConfig, RegistryItem } from "../types";
import { changeSummary } from "./diff";
import { isThemeFile, planItems, type PlannedFile, type PlanOptions } from "./plan";
import { mergeTheme } from "./theme-merge";

export type InstallOptions = PlanOptions & {
  /** Replace files the app has changed. Without it they are kept and reported. */
  overwrite?: boolean;
  /** Report what would happen; write nothing. */
  dryRun?: boolean;
};

export type InstallResult = {
  /** Every file the items ship, resolved against the app. */
  planned: PlannedFile[];
  /** Paths written (or merged), relative to the app. */
  written: string[];
};

/**
 * Write `items` into the app at `uiRoot`.
 *
 * A file the app does not have is written; one identical to the registry's is skipped; a
 * `theme.json` that only lacks keys is merged; any other file the app has is its own and is
 * kept, unless `overwrite` replaces it (reporting how much changes). With `dryRun` the same
 * lines are printed as `would …` and nothing is written. `adopt` items are written as if the app
 * had none of their files: that is how a theme switch lands.
 */
export async function installItems(
  uiRoot: string,
  config: NshUiConfig,
  items: RegistryItem[],
  opts: InstallOptions = {},
): Promise<InstallResult> {
  const planned = await planItems(uiRoot, config, items, opts);
  const written: string[] = [];

  for (const file of planned) {
    const shown = file.path;

    if (file.status === "same") {
      console.log(`skip ${shown} (identical)`);
      continue;
    }

    if (file.status === "create") {
      if (opts.dryRun) console.log(`would write ${shown}`);
      else {
        await write(file, file.content);
        written.push(shown);
        console.log(`write ${shown}`);
      }
      continue;
    }

    if (file.status === "merge" && !opts.overwrite) {
      const count = file.missing?.length ?? 0;
      if (opts.dryRun) {
        console.log(`would merge ${shown} (${count} keys missing)`);
      } else {
        await write(file, (await merged(file)) ?? file.content);
        written.push(shown);
        console.log(`merge ${shown} (added ${count} keys)`);
      }
      continue;
    }

    // `differs`, or a `theme.json` the app has changed and `--overwrite` was given.
    const summary = changeSummary(file.added, file.removed);
    if (!opts.overwrite) {
      // A recolored theme is the app's own and `diff` reports no difference for it, so do not
      // send the reader there.
      console.log(
        isThemeFile(file)
          ? `kept ${shown} (the app's colors stay)`
          : `kept ${shown}, differs (run diff)`,
      );
    } else if (opts.dryRun) {
      console.log(`would overwrite ${shown} ${summary}`);
    } else {
      await write(file, file.content);
      written.push(shown);
      console.log(`overwrite ${shown} ${summary}`);
    }
  }

  return { planned, written };
}

async function write(file: PlannedFile, content: string) {
  await fs.mkdir(path.dirname(file.absolute), { recursive: true });
  await fs.writeFile(file.absolute, content, "utf8");
}

/** The app's `theme.json` with the registry's missing keys added, as text. */
async function merged(file: PlannedFile) {
  if (file.existing == null) return null;
  try {
    const { theme } = mergeTheme(
      JSON.parse(file.existing) as Record<string, unknown>,
      JSON.parse(file.content) as Record<string, unknown>,
    );
    return `${JSON.stringify(theme, null, 2)}\n`;
  } catch {
    return null;
  }
}
