type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Adds the keys of `incoming` that `existing` lacks, at any depth; a value `existing` already
 * has stays as it is. Returns the merged theme and how many keys were added.
 *
 * An app that brought its own `theme.json` keeps its colors and gains any tokens the copied
 * theme / `theme.ts` reads that it did not already define.
 */
export function mergeTheme(existing: Json, incoming: Json): { theme: Json; added: number } {
  let added = 0;
  const merge = (base: Json, extra: Json): Json => {
    const out: Json = { ...base };
    for (const [key, value] of Object.entries(extra)) {
      if (!(key in out)) {
        out[key] = value;
        added += 1;
      } else if (isObject(out[key]) && isObject(value)) {
        out[key] = merge(out[key], value);
      }
    }
    return out;
  };
  return { theme: merge(existing, incoming), added };
}
