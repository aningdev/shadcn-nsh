import fs from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";
import { parse } from "jsonc-parser";

import { DEFAULT_CONFIG, DEFAULT_THEME, themeItem, type NshUiConfig } from "../types";
import { findNshJson, writeConfig } from "../utils/config";
import { installDependencies } from "../utils/deps";
import { installItems } from "../utils/install";
import { setJsonValue } from "../utils/jsonc-edit";
import { cacheIndex, resolveTree } from "../utils/registry";
import { isRecord } from "../utils/registry-schema";
import { warnShadowedTokens } from "../utils/tailwind-shadow";
import { ensureAtPaths } from "../utils/tsconfig";
import { resolveWorkspace, themePathForApp } from "../utils/workspace";

export async function runInit(opts: {
  cwd: string;
  overwrite?: boolean;
  registry?: string;
  /** The theme to install: `default` (the library's own) or `shadcn`; an unknown name throws. */
  theme?: string;
}): Promise<NshUiConfig> {
  const cwd = path.resolve(opts.cwd);
  const ws = await resolveWorkspace(cwd);

  if (ws.kind === "app") {
    const nshJsonPath = await findNshJson(cwd);
    if (!nshJsonPath) {
      throw new Error(
        `No nsh.json in ${cwd}. Create an NSH app first (nsh init), then run shadcn-nsh init.`,
      );
    }
  } else if (ws.apps.length === 0) {
    throw new Error(
      `Monorepo at ${ws.root} has packages/ui but no apps/*/nsh.json. Add an NSH app under apps/.`,
    );
  }

  const config: NshUiConfig = DEFAULT_CONFIG();
  if (opts.registry) config.registry = opts.registry;
  // Before anything is written: an unknown theme is the command's error, not a half-made app.
  config.theme = themeItem(opts.theme ?? "default");

  await writeConfig(ws.uiRoot, config);
  console.log(`write ${path.relative(cwd, path.join(ws.uiRoot, "nsh-ui.json")) || "nsh-ui.json"}`);

  // The theme: the default item, or another theme's roles, run-time copy and build-time data.
  const items = await resolveTree(config, [DEFAULT_THEME], opts.registry);
  await cacheIndex(config, opts.registry);
  await installItems(ws.uiRoot, config, items, { overwrite: opts.overwrite });
  await installDependencies(ws.uiRoot, items);

  for (const appDir of ws.apps) {
    const nshJsonPath = await findNshJson(appDir);
    if (!nshJsonPath) continue;
    // Edited in place, not re-serialized: the app's formatting and comments stay as they were.
    const before = await fs.readFile(nshJsonPath, "utf8");
    const nsh: unknown = parse(before, [], { allowTrailingComma: true });
    if (!isRecord(nsh)) throw new Error(`${nshJsonPath} is not a JSON object`);
    const theme = ws.kind === "monorepo" ? themePathForApp(appDir, ws.uiRoot) : "./theme.json";
    let text = setJsonValue(before, ["theme"], theme);
    if (ws.kind === "app") {
      // The bundler's half of the alias: `nsh run`/`build`/`test` read `nsh.json`, never
      // tsconfig. A monorepo imports from `@workspace/ui` instead, so it is left alone.
      const existing =
        isRecord(nsh.resolve) && isRecord(nsh.resolve.alias) ? nsh.resolve.alias["@"] : undefined;
      if (existing === undefined) {
        text = setJsonValue(text, ["resolve", "alias", "@"], "./");
        console.log(`update ${path.relative(cwd, nshJsonPath) || "nsh.json"} alias @ → ./`);
      } else if (existing !== "./") {
        console.error(
          `shadcn-nsh: nsh.json maps @ to ${JSON.stringify(existing)}, not ./ — kept. ` +
            `The docs' snippets import @/components/ui/… and @/lib/…, which need "@": "./".`,
        );
      }
    }
    if (text !== before) await fs.writeFile(nshJsonPath, text);
    console.log(`update ${path.relative(cwd, nshJsonPath) || "nsh.json"} theme → ${theme}`);
  }

  if (ws.kind === "app") {
    // The type checker's half: `nsh check` and the editors resolve `@/` through tsconfig
    // paths — and a child's paths replace the base's, so the NSH mappings ride along.
    const at = await ensureAtPaths(cwd);
    if (at.status === "wrote") console.log("write tsconfig.json");
    else if (at.status === "merged")
      console.log(
        `update tsconfig.json paths (@/* → ./*${at.detail === "base" ? ", plus .nsh/tsconfig.json's own" : ""})`,
      );
    else if (at.status === "present") console.log("skip tsconfig.json paths (@/* → ./* already)");
    else if (at.status === "conflict")
      console.error(
        `shadcn-nsh: tsconfig.json maps @/* to ${at.detail}, not ./* — kept. ` +
          `The docs' snippets import @/components/ui/… and @/lib/…, which need "@/*": ["./*"].`,
      );
    else
      console.error(
        `shadcn-nsh: tsconfig.json ${at.detail} — left alone. ` +
          `Add "@/*": ["./*"] under compilerOptions.paths yourself; a child's paths replace ` +
          `the base's, so keep the mappings .nsh/tsconfig.json declares too.`,
      );
  }

  // A color in nsh.json's `tailwind.colors` wins over the theme token of the same name for
  // classes, so a control can draw two colors for one name: say so, and only warn.
  await warnShadowedTokens(cwd);

  return config;
}

export const init = new Command()
  .name("init")
  .description(
    "Initialize shadcn-nsh (writes nsh-ui.json + theme + the @/ alias in an app; monorepo → packages/ui)",
  )
  .option("-c, --cwd <cwd>", "app or monorepo directory", process.cwd())
  .option("-y, --yes", "skip confirmation", false)
  .option("--overwrite", "overwrite existing files", false)
  .option("--theme <name>", "theme to install: default (the library's own) or shadcn", "default")
  .option("--registry <url>", "registry URL template containing {name}")
  .action(
    async (opts: {
      cwd: string;
      yes: boolean;
      overwrite: boolean;
      theme: string;
      registry?: string;
    }) => {
      await runInit(opts);
      console.log("\nDone. Next: shadcn-nsh add button");
    },
  );
