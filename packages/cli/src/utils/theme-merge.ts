type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Adds the keys of `incoming` that `existing` lacks, at any depth; a value `existing` already
 * has stays as it is. Returns the merged JSON, how many keys were added, and their dotted paths
 * (`cssVars.light.brand`, `controls`, `finishes.shared.modal`), which is what `add` reports
 * and `diff` compares.
 *
 * An app that brought its own `theme.json` or customized `semantics.json` keeps its values and
 * gains any tokens, style keys, finish roles, or finish fields the copied theme / `theme.ts`
 * reads that it did not already define.
 */
export function mergeTheme(
  existing: Json,
  incoming: Json,
): { theme: Json; added: number; missing: string[] } {
  const missing: string[] = [];
  const merge = (base: Json, extra: Json, prefix: string): Json => {
    const out: Json = { ...base };
    for (const [key, value] of Object.entries(extra)) {
      const at = prefix ? `${prefix}.${key}` : key;
      if (!(key in out)) {
        out[key] = value;
        missing.push(at);
      } else if (isObject(out[key]) && isObject(value)) {
        out[key] = merge(out[key], value, at);
      }
    }
    return out;
  };
  const theme = merge(existing, incoming, "");
  return { theme, added: missing.length, missing };
}
