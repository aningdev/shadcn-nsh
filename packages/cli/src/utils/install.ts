import fs from "node:fs/promises";
import path from "node:path";

import type { NshUiConfig, RegistryItem } from "../types";
import { defaultTarget } from "./paths";
import { mergeTheme } from "./theme-merge";
import { transformContent } from "./transform";

export async function installItems(
  cwd: string,
  config: NshUiConfig,
  items: RegistryItem[],
  opts: { overwrite?: boolean } = {},
) {
  const written: string[] = [];

  for (const item of items) {
    for (const file of item.files) {
      if (file.content == null) {
        throw new Error(`Item ${item.name} file ${file.path} has no content (run registry:build)`);
      }

      const targetRel = defaultTarget(file, config.aliases);
      const absolute = path.isAbsolute(targetRel) ? targetRel : path.resolve(cwd, targetRel);

      let exists = true;
      try {
        await fs.access(absolute);
      } catch {
        exists = false;
      }
      if (exists && !opts.overwrite) {
        if (
          path.basename(absolute) === "theme.json" &&
          (await mergeThemeFile(absolute, file.content))
        ) {
          console.log(`merge ${path.relative(cwd, absolute)} (added missing custom-* keys)`);
          written.push(path.relative(cwd, absolute));
        } else {
          console.log(`skip ${path.relative(cwd, absolute)} (exists)`);
        }
        continue;
      }

      const content = transformContent(file.content, absolute, config, cwd);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, content, "utf8");
      written.push(path.relative(cwd, absolute));
      console.log(`write ${path.relative(cwd, absolute)}`);
    }
  }

  return written;
}

/** Adds the `custom-*` keys an existing `theme.json` lacks. True when it changed the file. */
async function mergeThemeFile(file: string, incoming: string) {
  const existing = JSON.parse(await fs.readFile(file, "utf8")) as Record<string, unknown>;
  const { theme, added } = mergeTheme(existing, JSON.parse(incoming) as Record<string, unknown>);
  if (added === 0) return false;
  await fs.writeFile(file, `${JSON.stringify(theme, null, 2)}\n`, "utf8");
  return true;
}
