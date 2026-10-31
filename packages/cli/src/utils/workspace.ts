import fs from "node:fs/promises";
import path from "node:path";

import { CONFIG_FILE, findNshJson } from "./config";

export type WorkspaceInfo = {
  kind: "app" | "monorepo";
  /** Directory that owns nsh-ui.json and receives installed files. */
  uiRoot: string;
  /** NSH apps whose nsh.json theme pointer should be updated. */
  apps: string[];
  /** Monorepo root, or the single-app directory. */
  root: string;
};

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** True when packages/ui is a consumer copy-into-app package (not this repo's authoring @shadcn-nsh/ui). */
async function isConsumerUiPackage(uiDir: string) {
  if (await exists(path.join(uiDir, CONFIG_FILE))) return true;
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(uiDir, "package.json"), "utf8")) as {
      name?: string;
    };
    return pkg.name === "@workspace/ui";
  } catch {
    return false;
  }
}

/** Walk parents for a consumer monorepo (apps/* + packages/ui with nsh-ui.json or @workspace/ui). */
export async function findMonorepoRoot(start: string): Promise<string | null> {
  let dir = path.resolve(start);
  for (;;) {
    const uiDir = path.join(dir, "packages", "ui");
    if (await isConsumerUiPackage(uiDir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function listApps(root: string): Promise<string[]> {
  const appsDir = path.join(root, "apps");
  if (!(await exists(appsDir))) return [];
  const entries = await fs.readdir(appsDir, { withFileTypes: true });
  const apps: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const appDir = path.join(appsDir, entry.name);
    if (await findNshJson(appDir)) apps.push(appDir);
  }
  return apps;
}

/**
 * Resolve where nsh-ui.json lives and where components install.
 * - Single app: cwd (must contain or will receive nsh.json)
 * - Monorepo: packages/ui; `-c apps/web` still resolves here
 */
export async function resolveWorkspace(cwd: string): Promise<WorkspaceInfo> {
  const resolved = path.resolve(cwd);

  const monoRoot = await findMonorepoRoot(resolved);
  if (monoRoot) {
    const uiRoot = path.join(monoRoot, "packages", "ui");
    return {
      kind: "monorepo",
      uiRoot,
      apps: await listApps(monoRoot),
      root: monoRoot,
    };
  }

  // Direct packages/ui cwd (consumer only)
  if (
    path.basename(resolved) === "ui" &&
    path.basename(path.dirname(resolved)) === "packages" &&
    (await isConsumerUiPackage(resolved))
  ) {
    const root = path.dirname(path.dirname(resolved));
    return {
      kind: "monorepo",
      uiRoot: resolved,
      apps: await listApps(root),
      root,
    };
  }

  return {
    kind: "app",
    uiRoot: resolved,
    apps: (await findNshJson(resolved)) ? [resolved] : [],
    root: resolved,
  };
}

export async function readConfigAt(uiRoot: string) {
  const file = path.join(uiRoot, CONFIG_FILE);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Relative path from an app directory to packages/ui/theme.json (posix). */
export function themePathForApp(appDir: string, uiRoot: string) {
  const abs = path.join(uiRoot, "theme.json");
  let rel = path.relative(appDir, abs);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel.replace(/\\/g, "/");
}
