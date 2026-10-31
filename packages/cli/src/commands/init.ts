import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { findNshJson, readJson, writeConfig, writeJson } from "../utils/config";
import { installItems } from "../utils/install";
import { resolveTree } from "../utils/registry";
import { DEFAULT_CONFIG, type NshUiConfig } from "../types";

export async function runInit(opts: {
  cwd: string;
  overwrite?: boolean;
  registry?: string;
}) {
  const cwd = path.resolve(opts.cwd);
  const nshJsonPath = await findNshJson(cwd);
  if (!nshJsonPath) {
    throw new Error(`No nsh.json in ${cwd}. Create an NSH app first (nsh init).`);
  }

  const config: NshUiConfig = DEFAULT_CONFIG();
  if (opts.registry) config.registry = opts.registry;

  await writeConfig(cwd, config);
  console.log("write nsh-ui.json");

  const items = await resolveTree(config, ["theme"], opts.registry);
  await installItems(cwd, config, items, { overwrite: opts.overwrite });

  const nsh = await readJson<Record<string, unknown>>(nshJsonPath);
  nsh.theme = "./theme.json";
  await writeJson(nshJsonPath, nsh);
  console.log("update nsh.json theme → ./theme.json");

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

  return config;
}

export const init = new Command()
  .name("init")
  .description("Initialize shadcn-nsh in an existing NSH app (writes nsh-ui.json + theme)")
  .option("-c, --cwd <cwd>", "app directory", process.cwd())
  .option("-y, --yes", "skip confirmation", false)
  .option("--overwrite", "overwrite existing files", false)
  .option("--registry <url>", "registry URL template containing {name}")
  .action(async (opts: {
    cwd: string;
    yes: boolean;
    overwrite: boolean;
    registry?: string;
  }) => {
    await runInit(opts);
    console.log("\nDone. Next: shadcn-nsh add button");
  });
