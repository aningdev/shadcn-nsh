import type { NshUiConfig, RegistryItem } from "../types";

export function itemUrl(config: NshUiConfig, name: string, registryOverride?: string) {
  const template = registryOverride ?? config.registry;
  if (!template.includes("{name}")) {
    throw new Error(`Registry URL must contain {name}: ${template}`);
  }
  return template.replaceAll("{name}", name);
}

export async function fetchItem(
  config: NshUiConfig,
  name: string,
  registryOverride?: string,
): Promise<RegistryItem> {
  const url = itemUrl(config, name, registryOverride);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as RegistryItem;
}

/** Fetch item and recursive registryDependencies (depth-first, deduped). */
export async function resolveTree(
  config: NshUiConfig,
  names: string[],
  registryOverride?: string,
): Promise<RegistryItem[]> {
  const seen = new Set<string>();
  const out: RegistryItem[] = [];

  async function walk(name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const item = await fetchItem(config, name, registryOverride);
    for (const dep of item.registryDependencies ?? []) {
      await walk(dep);
    }
    out.push(item);
  }

  for (const name of names) {
    await walk(name);
  }
  return out;
}
