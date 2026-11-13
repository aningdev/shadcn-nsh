/**
 * The registry's JSON shapes, checked where the JSON is read: `registry.json`, a built item, an
 * `index.json` entry. Callers get the typed value or an error naming the place that is wrong;
 * nothing casts parsed JSON to a registry type.
 */
import type { Registry, RegistryFile, RegistryItem } from "../types";

/** A registry file or item that does not have the shape; `where` names the place. */
export class RegistryShapeError extends Error {
  override name = "RegistryShapeError";
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** True for a missing file only (`ENOENT`); any other failure is the caller's to report. */
export function isNotFound(error: unknown): boolean {
  return isRecord(error) && error.code === "ENOENT";
}

function stringAt(value: unknown, where: string): string {
  if (typeof value !== "string") throw new RegistryShapeError(`${where}: expected a string`);
  return value;
}

function optionalString(value: unknown, where: string): string | undefined {
  return value === undefined ? undefined : stringAt(value, where);
}

function optionalStrings(value: unknown, where: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new RegistryShapeError(`${where}: expected a list of strings`);
  }
  return value;
}

function fileAt(value: unknown, where: string): RegistryFile {
  if (!isRecord(value)) throw new RegistryShapeError(`${where}: not an object`);
  const file: RegistryFile = {
    path: stringAt(value.path, `${where}.path`),
    type: stringAt(value.type, `${where}.type`),
  };
  const target = optionalString(value.target, `${where}.target`);
  if (target !== undefined) file.target = target;
  const content = optionalString(value.content, `${where}.content`);
  if (content !== undefined) file.content = content;
  return inSourceOrder(value, file);
}

/**
 * `checked`'s fields in the order `source` wrote them: a checked item or file serialises as it
 * was written (the built `public/r` is compared byte for byte). Fields the type does not know are
 * dropped.
 */
function inSourceOrder<T extends object>(source: Record<string, unknown>, checked: T): T {
  const ordered: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (key in checked) ordered[key] = checked[key as keyof T];
  }
  return Object.assign(ordered, checked) as T;
}

/**
 * One registry item: a name, a `registry:` type and at least one file with a path and a type.
 * Optional fields are kept only when present.
 */
export function parseRegistryItem(value: unknown, where: string): RegistryItem {
  if (!isRecord(value)) throw new RegistryShapeError(`${where}: not an object`);
  const type = stringAt(value.type, `${where}: type`);
  if (!type.startsWith("registry:")) {
    throw new RegistryShapeError(`${where}: type "${type}" is not a registry: type`);
  }
  if (!Array.isArray(value.files) || value.files.length === 0) {
    throw new RegistryShapeError(`${where}: no files`);
  }
  const item: RegistryItem = {
    name: stringAt(value.name, `${where}: name`),
    type,
    files: value.files.map((file, at) => fileAt(file, `${where}: files[${at}]`)),
  };
  const title = optionalString(value.title, `${where}: title`);
  if (title !== undefined) item.title = title;
  const description = optionalString(value.description, `${where}: description`);
  if (description !== undefined) item.description = description;
  const registryDependencies = optionalStrings(
    value.registryDependencies,
    `${where}: registryDependencies`,
  );
  if (registryDependencies !== undefined) item.registryDependencies = registryDependencies;
  const dependencies = optionalStrings(value.dependencies, `${where}: dependencies`);
  if (dependencies !== undefined) item.dependencies = dependencies;
  return inSourceOrder(value, item);
}

/** `registry.json`: a name, a homepage and its items, each checked. */
export function parseRegistry(value: unknown, where: string): Registry {
  if (!isRecord(value)) throw new RegistryShapeError(`${where}: not a JSON object`);
  if (!Array.isArray(value.items)) throw new RegistryShapeError(`${where}: no items list`);
  return {
    name: stringAt(value.name, `${where}: name`),
    homepage: stringAt(value.homepage, `${where}: homepage`),
    items: value.items.map((item, at) => parseRegistryItem(item, `${where}: items[${at}]`)),
  };
}
