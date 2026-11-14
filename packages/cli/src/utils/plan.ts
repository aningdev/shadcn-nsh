import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

import type { NshUiConfig, RegistryFile, RegistryIndexItem, RegistryItem } from "../types";
import { countChanges, diffLines } from "./diff";
import { defaultTarget } from "./paths";
import { mergeTheme } from "./theme-merge";
import { transformContent } from "./transform";

/**
 * What `add` would do with one file:
 * - `create`: the app has none.
 * - `same`: the app's file is byte-identical to the rewritten registry file.
 * - `merge`: a `theme.json` that lacks keys the registry's has; `add` fills those in.
 * - `differs`: the app's file is its own. Only `--overwrite` replaces it.
 */
export type PlanStatus = "create" | "same" | "merge" | "differs";

/** One registry file, resolved against an app: where it lands, what it would hold, what is there. */
export type PlannedFile = {
  /** The item that ships this file (a dependency's own name for a dependency's file). */
  item: string;
  file: RegistryFile;
  /** The target, relative to the app (what `add` prints). */
  path: string;
  /** The target, absolute. */
  absolute: string;
  /** The registry's content with imports rewritten for this app: what `add` writes. */
  content: string;
  /** The app's file, or null when it has none. */
  existing: string | null;
  status: PlanStatus;
  /** Lines each side has alone (`diff` and the overwrite summary). */
  added: number;
  removed: number;
  /** For `merge`: the dotted key paths the registry has and the app's `theme.json` lacks. */
  missing?: string[];
};

/** `theme.json` is merged by key, never compared by value: its palette belongs to the app. */
export function isThemeFile(file: PlannedFile) {
  return path.basename(file.absolute) === "theme.json";
}

/**
 * How to plan: `adopt` names items whose files the app takes as they are — a theme switch writes
 * the new theme's `theme.json` and finishes where a plain `add` would keep the app's own.
 */
export type PlanOptions = {
  adopt?: string[];
};

/** True when the file `add` would write differs from what the app has, by the rule above. */
export function hasChange(file: PlannedFile) {
  if (file.status === "merge") return true;
  return file.status === "differs" && !isThemeFile(file);
}

async function readOrNull(file: string): Promise<string | null> {
  try {
    return await fsPromises.readFile(file, "utf8");
  } catch {
    return null;
  }
}

/** The app's `theme.json` against the registry's, or null when either is not JSON. */
function themeMerge(existing: string, incoming: string) {
  try {
    return mergeTheme(
      JSON.parse(existing) as Record<string, unknown>,
      JSON.parse(incoming) as Record<string, unknown>,
    );
  } catch {
    return null;
  }
}

/**
 * Resolve every file of `items` (dependencies included, in install order) against the app at
 * `uiRoot`: target path, rewritten content, the app's current file and what `add` would do.
 * Reads the app; writes nothing.
 */
export async function planItems(
  uiRoot: string,
  config: NshUiConfig,
  items: RegistryItem[],
  opts: PlanOptions = {},
): Promise<PlannedFile[]> {
  const planned: PlannedFile[] = [];
  const adopted = new Set(opts.adopt ?? []);

  for (const item of items) {
    for (const file of item.files) {
      if (file.content == null) {
        throw new Error(`Item ${item.name} file ${file.path} has no content (run registry:build)`);
      }

      const target = defaultTarget(file, config.aliases);
      const absolute = path.isAbsolute(target) ? target : path.resolve(uiRoot, target);
      const content = transformContent(file.content, absolute, config, uiRoot);
      const existing = adopted.has(item.name) ? null : await readOrNull(absolute);
      const relative = path.relative(uiRoot, absolute) || path.basename(absolute);

      const entry: PlannedFile = {
        item: item.name,
        file,
        path: relative,
        absolute,
        content,
        existing,
        status: "create",
        added: 0,
        removed: 0,
      };

      if (existing != null) {
        if (existing === content) {
          entry.status = "same";
        } else if (path.basename(absolute) === "theme.json") {
          const merged = themeMerge(existing, content);
          if (merged && merged.added > 0) {
            entry.status = "merge";
            entry.missing = merged.missing;
          } else {
            entry.status = "differs";
          }
        } else {
          entry.status = "differs";
        }
      }

      if (existing != null && entry.status !== "same") {
        const changes = countChanges(diffLines(existing, content));
        entry.added = changes.added;
        entry.removed = changes.removed;
      }

      planned.push(entry);
    }
  }

  return planned;
}

/**
 * True when the app has any of the item's files (what `list` marks and `diff` compares).
 * Depends on the index carrying `files`, which `registry:build` writes.
 */
export function isInstalled(uiRoot: string, config: NshUiConfig, item: RegistryIndexItem) {
  return (item.files ?? []).some((file) => {
    const target = defaultTarget(file, config.aliases);
    return fs.existsSync(path.isAbsolute(target) ? target : path.resolve(uiRoot, target));
  });
}
