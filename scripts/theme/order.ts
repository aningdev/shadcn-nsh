/**
 * The key order a generated theme file is written in: the default theme's, so the two diff side by
 * side and a key that drifts is a new line rather than a moved one. All generators write through
 * here (`generate-shadcn.ts`, `generate-solid-glass.ts`, `generate-apple.ts`), and all refuse to write a file that
 * leaves a key out (`themes.test.ts` holds every theme to the default's key set).
 */

/**
 * A section's value for every key of the default section, in the default's order. A section
 * declares every key: one the default file has and the theme does not is an error, not a blank.
 */
export const ordered = <T>(
  keys: Record<string, string>,
  values: Record<string, T>,
): Record<string, T> =>
  Object.fromEntries(
    Object.keys(keys).map((key) => {
      const value = values[key];
      if (value === undefined) throw new Error(`no value for theme key ${key}`);
      return [key, value];
    }),
  );

/**
 * A finish role's value in the default file's key order. A role states every key of the default's
 * and no other: a missing one is an error and so is an extra one, because a finish has one shape in
 * every theme (`docs/specs/theme-roles.md`) — a theme with no gradient states a gradient of one
 * colour rather than leaving the key out.
 */
export const orderedFinish = (
  keys: Record<string, unknown>,
  values: Record<string, unknown>,
): Record<string, unknown> => {
  const missing = Object.keys(keys).filter((key) => !(key in values));
  const extra = Object.keys(values).filter((key) => !(key in keys));
  if (missing.length > 0) throw new Error(`finish states no ${missing.join(", ")}`);
  if (extra.length > 0)
    throw new Error(`finish states ${extra.join(", ")}, which the default theme's does not`);
  return Object.fromEntries(Object.keys(keys).map((key) => [key, values[key]]));
};
