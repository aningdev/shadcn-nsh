import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";

import { DEFAULT_CONFIG } from "../types";
import { writeConfig } from "../utils/config";
import { runInit } from "./init";

const PLACEHOLDER = "{{name}}";
const APP_NAME_TOKEN = "__APP_NAME__";

async function templateRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Published dist/, local src/, and monorepo-relative layouts.
  const candidates = [
    path.resolve(here, "templates/nsh-monorepo"),
    path.resolve(here, "../templates/nsh-monorepo"),
    path.resolve(here, "../../templates/nsh-monorepo"),
    path.resolve(here, "../../../../templates/nsh-monorepo"),
  ];
  for (const candidate of candidates) {
    if (await pathExists(path.join(candidate, "package.json"))) return candidate;
  }
  return candidates[0]!;
}

async function pathExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".nsh") continue;
      await copyDir(from, to);
    } else {
      await fs.copyFile(from, to);
    }
  }
}

async function replaceInTree(root: string, name: string) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".nsh") continue;
      await replaceInTree(full, name);
      continue;
    }
    if (!/\.(json|ts|tsx|md|html|css)$/.test(entry.name) && entry.name !== "package.json") {
      continue;
    }
    let text = await fs.readFile(full, "utf8");
    if (!text.includes(PLACEHOLDER) && !text.includes(APP_NAME_TOKEN)) continue;
    text = text.replaceAll(PLACEHOLDER, name).replaceAll(APP_NAME_TOKEN, name);
    await fs.writeFile(full, text, "utf8");
  }
}

function sanitizeName(raw: string) {
  const base = path.basename(raw).trim();
  const name = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!name) throw new Error(`Invalid project name: ${raw}`);
  return name;
}

export async function runCreate(opts: {
  name: string;
  cwd?: string;
  force?: boolean;
  registry?: string;
  skipInit?: boolean;
}) {
  const name = sanitizeName(opts.name);
  const parent = path.resolve(opts.cwd ?? process.cwd());
  const dest = path.join(parent, name);

  const src = await templateRoot();
  if (!(await pathExists(path.join(src, "package.json")))) {
    throw new Error(`Template not found at ${src}`);
  }

  if (await pathExists(dest)) {
    if (!opts.force) {
      throw new Error(`Destination already exists: ${dest} (pass --force to overwrite)`);
    }
    await fs.rm(dest, { recursive: true, force: true });
  }

  console.log(`create ${dest}`);
  await copyDir(src, dest);
  await replaceInTree(dest, name);

  const uiRoot = path.join(dest, "packages", "ui");

  if (!opts.skipInit) {
    try {
      await runInit({
        cwd: dest,
        overwrite: false,
        registry: opts.registry,
      });
    } catch (err) {
      // Offline / registry unreachable: keep pre-seeded theme from template
      console.warn(
        `init skipped registry install: ${err instanceof Error ? err.message : String(err)}`,
      );
      const config = DEFAULT_CONFIG();
      if (opts.registry) config.registry = opts.registry;
      await writeConfig(uiRoot, config);
      console.log("write packages/ui/nsh-ui.json (template theme kept)");
    }
  }

  console.log(`
Done.

  cd ${name}
  bun install
  bun run check
  bun run dev

Add more components:

  shadcn-nsh add <name> -c apps/web
`);

  return dest;
}

export const create = new Command()
  .name("create")
  .description("Scaffold an NSH monorepo (apps/web + packages/ui)")
  .argument("<name>", "project directory name")
  .option("-c, --cwd <cwd>", "parent directory", process.cwd())
  .option("--force", "overwrite existing directory", false)
  .option("--registry <url>", "registry URL template containing {name}")
  .option("--skip-init", "only copy the template (skip registry theme sync)", false)
  .action(
    async (
      name: string,
      opts: { cwd: string; force: boolean; registry?: string; skipInit: boolean },
    ) => {
      await runCreate({
        name,
        cwd: opts.cwd,
        force: opts.force,
        registry: opts.registry,
        skipInit: opts.skipInit,
      });
    },
  );
