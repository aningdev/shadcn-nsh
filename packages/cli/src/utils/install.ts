import fs from "node:fs/promises";
import path from "node:path";
import type { NshUiConfig, RegistryItem } from "../types";
import { defaultTarget } from "./paths";
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
      const absolute = path.isAbsolute(targetRel)
        ? targetRel
        : path.resolve(cwd, targetRel);

      try {
        await fs.access(absolute);
        if (!opts.overwrite) {
          console.log(`skip ${path.relative(cwd, absolute)} (exists)`);
          continue;
        }
      } catch {
        // missing — write
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
