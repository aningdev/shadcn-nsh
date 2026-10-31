import fs from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import { DEFAULT_CONFIG, type NshUiConfig } from "../types";
import { findNshJson, readJson, writeConfig, writeJson } from "../utils/config";
import { installItems } from "../utils/install";
import { resolveTree } from "../utils/registry";
import { resolveWorkspace, themePathForApp } from "../utils/workspace";

export async function runInit(opts: {
  cwd: string;
  overwrite?: boolean;
  registry?: string;
}): Promise<NshUiConfig> {
  const cwd = path.resolve(opts.cwd);
  const ws = await resolveWorkspace(cwd);

  if (ws.kind === "app") {
    const nshJsonPath = await findNshJson(cwd);
    if (!nshJsonPath) {
      throw new Error(
        `No nsh.json in ${cwd}. Create an NSH app first (nsh init), or use: shadcn-nsh create <name>`,
      );
    }
  } else if (ws.apps.length === 0) {
    throw new Error(
      `Monorepo at ${ws.root} has packages/ui but no apps/*/nsh.json. Add an NSH app under apps/.`,
    );
  }

  const config: NshUiConfig = DEFAULT_CONFIG();
  if (opts.registry) config.registry = opts.registry;

  await writeConfig(ws.uiRoot, config);
  console.log(`write ${path.relative(cwd, path.join(ws.uiRoot, "nsh-ui.json")) || "nsh-ui.json"}`);

  const items = await resolveTree(config, ["theme"], opts.registry);
  await installItems(ws.uiRoot, config, items, { overwrite: opts.overwrite });

  for (const appDir of ws.apps) {
    const nshJsonPath = await findNshJson(appDir);
    if (!nshJsonPath) continue;
    const nsh = await readJson<Record<string, unknown>>(nshJsonPath);
    nsh.theme = ws.kind === "monorepo" ? themePathForApp(appDir, ws.uiRoot) : "./theme.json";
    await writeJson(nshJsonPath, nsh);
    console.log(
      `update ${path.relative(cwd, nshJsonPath) || "nsh.json"} theme → ${String(nsh.theme)}`,
    );
  }

  if (ws.kind === "app") {
    const tsconfig = path.join(cwd, "tsconfig.json");
    try {
      await fs.access(tsconfig);
    } catch {
      await writeJson(tsconfig, {
        extends: "./.nsh/tsconfig.json",
        include: ["**/*.ts", "**/*.tsx"],
      });
      console.log("write tsconfig.json");
    }
  }

  return config;
}

export const init = new Command()
  .name("init")
  .description("Initialize shadcn-nsh (writes nsh-ui.json + theme; monorepo → packages/ui)")
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("-y, --yes", "skip confirmation", false)
  .option("--overwrite", "overwrite existing files", false)
  .option("--registry <url>", "registry URL template containing {name}")
  .action(async (opts: { cwd: string; yes: boolean; overwrite: boolean; registry?: string }) => {
    await runInit(opts);
    console.log("\nDone. Next: shadcn-nsh add button");
  });
