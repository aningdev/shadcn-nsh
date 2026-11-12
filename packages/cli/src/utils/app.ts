import path from "node:path";

import { DEFAULT_CONFIG, type NshUiConfig } from "../types";
import { readConfig } from "./config";
import { resolveWorkspace, type WorkspaceInfo } from "./workspace";

/** The app a command works on and the config it would use. */
export type App = {
  ws: WorkspaceInfo;
  /** `nsh-ui.json`, or the defaults when the app has none. */
  config: NshUiConfig;
  /** False when the app has no `nsh-ui.json` (the config is the default one). */
  hasConfig: boolean;
};

/**
 * Resolve the app at `cwd` and its `nsh-ui.json`.
 *
 * Read-only commands work without the file — the default aliases say where files would land —
 * but `add` / `init` write the file and check `hasConfig`.
 */
export async function readApp(cwd: string, registry?: string): Promise<App> {
  const ws = await resolveWorkspace(path.resolve(cwd));
  const stored = await readConfig(ws.uiRoot);
  const config = stored ?? DEFAULT_CONFIG();
  if (registry) config.registry = registry;
  return { ws, config, hasConfig: stored != null };
}
