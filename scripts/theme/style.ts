/**
 * The style data of a theme, checked: the groups `finishes.json` states beside its finishes (type,
 * shape, size, stroke, focus, state, motion, icon, indicator), which every theme states with the
 * same keys, whose enums come from a list, and whose corner roles agree with `theme.json`'s radii.
 *
 * Pure: no `node:fs`, so `theme-lint.ts`, the theme generators and the unit tests all read it.
 */

/** The groups of `finishes.json` that are style, in the order the file writes them. */
export const styleGroups = [
  "type",
  "shape",
  "size",
  "stroke",
  "focus",
  "state",
  "motion",
  "icon",
  "indicator",
] as const;

/** The style groups of a `finishes.json` document: every group, nothing else. */
export const styleOf = (file: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(styleGroups.filter((group) => group in file).map((g) => [g, file[g]]));

/** One theme's strings that must come from a list: the path of the key, and the values it may take. */
export const whitelists: Record<string, readonly (string | null)[]> = {
  "type.family": [null, "sans", "rounded", "mono"],
  "type.*.weight": ["400", "500", "600", "700"],
  "shape.curve": ["continuous", "circular"],
  "shape.corners.field": ["all", "top"],
  "size.control.*.switch": ["small", "regular"],
  "focus.style": ["halo", "outline"],
  "motion.enter.easing": ["out-cubic", "in-cubic", "in-out-cubic"],
  "indicator.tabs": ["underline", "pill"],
  "indicator.nav": ["fill", "bar"],
  "indicator.field": ["box", "underline"],
};

/** Every leaf of a document, by dotted path. A leaf is anything that is not a plain object. */
export function leaves(value: unknown, prefix = ""): Map<string, unknown> {
  const out = new Map<string, unknown>();
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, item] of Object.entries(value))
      for (const [path, leaf] of leaves(item, prefix === "" ? key : `${prefix}.${key}`))
        out.set(path, leaf);
  } else out.set(prefix, value);
  return out;
}

/** Whether a dotted path matches a whitelist's pattern, `*` standing for one segment. */
const matches = (pattern: string, path: string) => {
  const want = pattern.split(".");
  const have = path.split(".");
  return want.length === have.length && want.every((part, i) => part === "*" || part === have[i]);
};

/** The corner roles that are `theme.json`'s radii, by the `shape` role that states the same number. */
export const radiusRoles = [
  ["radius", "inset"],
  ["radius-card", "card"],
  ["radius-control", "control"],
] as const;

/** A px length of `theme.json`'s `cssVars.theme` as a number, or undefined. */
const px = (value: string | undefined) => {
  const match = value?.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : undefined;
};

/**
 * `style` with its `shape` corners set from the theme's radii: `control`, `field` and `chip`'s
 * tiers follow `radius-control`, `radius` and `radius-card` as the default theme's numbers do. A
 * generated theme (shadcn, Solid Glass) takes the default's style and states its own corners.
 */
export function withRadii(
  style: Record<string, unknown>,
  shared: Record<string, string>,
): Record<string, unknown> {
  const base = px(shared.radius);
  const card = px(shared["radius-card"]);
  const control = px(shared["radius-control"]);
  if (base === undefined || card === undefined || control === undefined)
    throw new Error("theme.json states no px radius, radius-card and radius-control");
  const shape = style.shape as Record<string, unknown>;
  return {
    ...style,
    shape: {
      ...shape,
      control,
      field: control,
      chip: base,
      card,
      overlay: base,
      dialog: card,
      sheet: card,
      inset: base,
    },
  };
}

/**
 * A generated theme's `finishes.json`: its `press`, the default theme's style with the theme's own
 * corners, then its finishes. The default theme is the one place the style numbers are written.
 */
export function finishesWithStyle(
  generated: { press: unknown; dark: unknown; light: unknown },
  defaults: Record<string, unknown>,
  shared: Record<string, string>,
): Record<string, unknown> {
  return {
    press: generated.press,
    ...withRadii(styleOf(defaults), shared),
    dark: generated.dark,
    light: generated.light,
  };
}

/**
 * What is wrong with one theme's style data, each as a line naming the key: a key the reference
 * (the default theme) states and this one lacks or the other way round, a leaf of another type, an
 * enum outside its list, and a `shape` corner that is not the radius `theme.json` states.
 */
export function checkStyle(
  path: string,
  file: Record<string, unknown>,
  reference: Record<string, unknown>,
  shared: Record<string, string>,
  referenceName = "the default theme",
): string[] {
  const problems: string[] = [];
  const have = leaves(styleOf(file));
  const want = leaves(styleOf(reference));
  for (const key of want.keys())
    if (!have.has(key))
      problems.push(`${path}: \`${key}\` is missing, and ${referenceName} states it`);
  for (const key of have.keys())
    if (!want.has(key)) problems.push(`${path}: \`${key}\` is not a key ${referenceName} states`);
  for (const [key, value] of have) {
    const other = want.get(key);
    if (other === undefined && !want.has(key)) continue;
    if (value !== null && other !== null && typeof value !== typeof other)
      problems.push(
        `${path}: \`${key}\` is a ${typeof value}, ${referenceName}'s is a ${typeof other}`,
      );
    else if (typeof value === "number" && !(Number.isFinite(value) && value >= 0))
      problems.push(`${path}: \`${key}\` is ${value}, not a number of 0 or more`);
    for (const [pattern, allowed] of Object.entries(whitelists))
      if (matches(pattern, key) && !allowed.includes(value as string | null))
        problems.push(
          `${path}: \`${key}\` is ${JSON.stringify(value)}, not one of ${allowed.map((v) => JSON.stringify(v)).join(", ")}`,
        );
  }
  for (const [token, role] of radiusRoles) {
    const radius = px(shared[token]);
    const stated = have.get(`shape.${role}`);
    if (radius !== undefined && stated !== undefined && stated !== radius)
      problems.push(
        `${path}: \`shape.${role}\` is ${JSON.stringify(stated)}, and theme.json's \`${token}\` is ${radius}px: the two are one number`,
      );
  }
  return problems;
}
