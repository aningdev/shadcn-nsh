import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_CONFIG, type NshUiConfig } from "../types";

export const CONFIG_FILE = "nsh-ui.json";

export async function readConfig(cwd: string): Promise<NshUiConfig | null> {
  const file = path.join(cwd, CONFIG_FILE);
  try {
    const raw = await fs.readFile(file, "utf8");
    return { ...DEFAULT_CONFIG(), ...JSON.parse(raw) } as NshUiConfig;
  } catch {
    return null;
  }
}

export async function writeConfig(cwd: string, config: NshUiConfig) {
  const file = path.join(cwd, CONFIG_FILE);
  await fs.writeFile(file, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export async function findNshJson(cwd: string) {
  const file = path.join(cwd, "nsh.json");
  try {
    await fs.access(file);
    return file;
  } catch {
    return null;
  }
}

export async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

export async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
