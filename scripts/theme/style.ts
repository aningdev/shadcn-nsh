/**
 * The style data of a theme, checked: the groups `semantics.json` states beside its finishes (type,
 * shape, size, stroke, focus, state, motion, icon, indicator), which every theme states with the
 * same keys, whose enums come from a list, and whose token references (`shape.*` radii,
 * `type.family`) name tokens of the right DTCG `$type` (`dimension`, `fontFamily`) in `theme.json`.
 *
 * Pure: no `node:fs`, so `theme-lint.ts`, the theme generators and the unit tests all read it.
 */
import { parseTokenRef, type SplitFinishes, type TokenKind } from "./tokens";

/** The groups of `semantics.json` that are style, in the order the file writes them. */
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

/** The style groups of a `semantics.json` document: every group, nothing else. */
export const styleOf = (file: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(styleGroups.filter((group) => group in file).map((g) => [g, file[g]]));

/** Every easing name a theme may name in `motion.enter.easing` or a timing `motion.<role>`. */
export const easingNames = [
  "out-cubic",
  "in-cubic",
  "in-out-cubic",
  "standard",
  "emphasized-decelerate",
  "emphasized-accelerate",
  "decelerate",
  "accelerate",
  "easy-ease",
  "point-to-point",
] as const;

/** One theme's strings that must come from a list: the path of the key, and the values it may take. */
export const whitelists: Record<string, readonly (string | null)[]> = {
  "type.*.weight": ["400", "500", "600", "700"],
  "shape.curve": ["continuous", "circular"],
  "shape.corners.field": ["all", "top"],
  "size.control.*.switch": ["small", "regular"],
  "focus.style": ["halo", "outline", "double"],
  "motion.enter.easing": easingNames,
  "indicator.tabs": ["underline", "pill"],
  "indicator.nav": ["fill", "bar"],
  "indicator.field": ["box", "underline"],
};

const motionRoleNames = ["press", "settle", "control", "move"] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isMotionRolePath = (path: string) =>
  motionRoleNames.some((role) => path === `motion.${role}` || path.startsWith(`motion.${role}.`));

function checkMotionRole(path: string, role: string, value: unknown): string[] {
  const key = `motion.${role}`;
  if (value === undefined) return [`${path}: \`${key}\` is missing`];
  if (!isObject(value))
    return [`${path}: \`${key}\` is ${JSON.stringify(value)}, not a Spring or Timing object`];

  const problems: string[] = [];
  const hasSpring = "stiffness" in value || "damping" in value;
  const hasTiming = "duration" in value || "easing" in value;
  if (hasSpring && hasTiming) {
    return [
      `${path}: \`${key}\` mixes spring keys (stiffness/damping) and timing keys (duration/easing)`,
    ];
  }

  if (hasTiming) {
    const allowed = new Set(["duration", "easing"]);
    for (const k of Object.keys(value))
      if (!allowed.has(k)) problems.push(`${path}: \`${key}.${k}\` is not a key of a Timing`);
    if (!("duration" in value)) problems.push(`${path}: \`${key}.duration\` is missing`);
    else if (
      typeof value.duration !== "number" ||
      !Number.isFinite(value.duration) ||
      value.duration < 0
    ) {
      problems.push(
        `${path}: \`${key}.duration\` is ${JSON.stringify(value.duration)}, not a number of 0 or more`,
      );
    }
    if (!("easing" in value)) problems.push(`${path}: \`${key}.easing\` is missing`);
    else if (typeof value.easing !== "string" || !easingNames.includes(value.easing as never)) {
      problems.push(
        `${path}: \`${key}.easing\` is ${JSON.stringify(value.easing)}, not one of ${easingNames.map((v) => JSON.stringify(v)).join(", ")}`,
      );
    }
    return problems;
  }

  const allowed = new Set(["stiffness", "damping"]);
  for (const k of Object.keys(value))
    if (!allowed.has(k)) problems.push(`${path}: \`${key}.${k}\` is not a key of a Spring`);
  if (!("stiffness" in value)) problems.push(`${path}: \`${key}.stiffness\` is missing`);
  else if (
    typeof value.stiffness !== "number" ||
    !Number.isFinite(value.stiffness) ||
    value.stiffness < 0
  ) {
    problems.push(
      `${path}: \`${key}.stiffness\` is ${JSON.stringify(value.stiffness)}, not a number of 0 or more`,
    );
  }
  if (!("damping" in value)) problems.push(`${path}: \`${key}.damping\` is missing`);
  else if (
    typeof value.damping !== "number" ||
    !Number.isFinite(value.damping) ||
    value.damping < 0
  ) {
    problems.push(
      `${path}: \`${key}.damping\` is ${JSON.stringify(value.damping)}, not a number of 0 or more`,
    );
  }
  return problems;
}

/** The eight corner roles in `shape` that must reference a `dimension` token in `theme.json`. */
export const shapeRadiusRoles = [
  "control",
  "field",
  "chip",
  "card",
  "overlay",
  "dialog",
  "sheet",
  "inset",
] as const;

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

/**
 * Derive the 8 `radius-*` tokens of `theme.json` from a base radius in px, using the 0.8× / 1.4×
 * scale shared by generated themes (shadcn, Solid Glass).
 */
export function scaledRadii(basePx: number): Record<string, string> {
  if (!Number.isFinite(basePx) || basePx < 0)
    throw new Error(`radius must be a non-negative number, got ${basePx}`);
  const control = `${Math.round(basePx * 0.8)}px`;
  const card = `${Math.round(basePx * 1.4)}px`;
  const base = `${basePx}px`;
  return {
    radius: base,
    "radius-control": control,
    "radius-field": control,
    "radius-chip": base,
    "radius-card": card,
    "radius-overlay": base,
    "radius-dialog": card,
    "radius-sheet": card,
  };
}

/**
 * A generated theme's `semantics.json`: the default theme's style (with the theme's own
 * `state.pressScale`), then its split finishes (`{ shared, light, dark }`). The default theme is
 * the one place the style numbers and `{radius-…}` references are written.
 */
export function semanticsWithStyle(
  generated: { pressScale: number; finishes: SplitFinishes },
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const base = structuredClone(styleOf(defaults));
  (base.state as Record<string, unknown>).pressScale = generated.pressScale;
  return {
    ...base,
    finishes: generated.finishes,
  };
}

/**
 * What is wrong with one theme's style data, each as a line naming the key:
 * - a key the reference (the default theme) states and this one lacks, or vice versa;
 * - a leaf of another type, or a negative number;
 * - an enum outside its whitelist;
 * - a `shape.<role>` corner that is not a `{token}` reference to a `dimension` token in `theme.json`;
 * - a `type.family` that is neither `null` nor a `{token}` reference to a `fontFamily` token in `theme.json`;
 * - a `state.pressScale` outside `(0, 1]`.
 */
export function checkStyle(
  path: string,
  file: Record<string, unknown>,
  reference: Record<string, unknown>,
  kinds: Map<string, TokenKind>,
  referenceName = "the default theme",
): string[] {
  const problems: string[] = [];
  const have = leaves(styleOf(file));
  const want = leaves(styleOf(reference));
  for (const key of want.keys())
    if (!isMotionRolePath(key) && !have.has(key))
      problems.push(`${path}: \`${key}\` is missing, and ${referenceName} states it`);
  for (const key of have.keys())
    if (!isMotionRolePath(key) && !want.has(key))
      problems.push(`${path}: \`${key}\` is not a key ${referenceName} states`);

  const motion = isObject(file.motion) ? file.motion : undefined;
  for (const role of motionRoleNames) {
    problems.push(...checkMotionRole(path, role, motion?.[role]));
  }

  const shapeRadiusKeys = new Set<string>(shapeRadiusRoles.map((role) => `shape.${role}`));

  for (const [key, value] of have) {
    if (isMotionRolePath(key)) continue;
    const other = want.get(key);
    if (other === undefined && !want.has(key)) continue;

    if (shapeRadiusKeys.has(key)) {
      if (typeof value !== "string") {
        problems.push(
          `${path}: \`${key}\` is ${JSON.stringify(value)}, not a \`{token}\` reference to a dimension token`,
        );
        continue;
      }
      const ref = parseTokenRef(value);
      if (ref === null) {
        problems.push(
          `${path}: \`${key}\` is ${JSON.stringify(value)}, not a \`{token}\` reference to a dimension token`,
        );
        continue;
      }
      const kind = kinds.get(ref);
      if (kind === undefined)
        problems.push(`${path}: \`${key}\` names token \`${ref}\`, which theme.json does not have`);
      else if (kind !== "dimension")
        problems.push(
          `${path}: \`${key}\` names token \`${ref}\`, which is a ${kind}, not a dimension`,
        );
      continue;
    }

    if (key === "type.family") {
      if (value === null) continue;
      if (typeof value !== "string") {
        problems.push(
          `${path}: \`type.family\` is ${JSON.stringify(value)}, not null or a \`{token}\` reference to a fontFamily token`,
        );
        continue;
      }
      const ref = parseTokenRef(value);
      if (ref === null) {
        problems.push(
          `${path}: \`type.family\` is ${JSON.stringify(value)}, not null or a \`{token}\` reference to a fontFamily token`,
        );
        continue;
      }
      const kind = kinds.get(ref);
      if (kind === undefined)
        problems.push(
          `${path}: \`type.family\` names token \`${ref}\`, which theme.json does not have`,
        );
      else if (kind !== "fontFamily")
        problems.push(
          `${path}: \`type.family\` names token \`${ref}\`, which is a ${kind}, not a fontFamily`,
        );
      continue;
    }

    if (value !== null && other !== null && typeof value !== typeof other)
      problems.push(
        `${path}: \`${key}\` is a ${typeof value}, ${referenceName}'s is a ${typeof other}`,
      );
    else if (typeof value === "number" && !(Number.isFinite(value) && value >= 0))
      problems.push(`${path}: \`${key}\` is ${value}, not a number of 0 or more`);

    if (key === "state.pressScale" && typeof value === "number" && (value <= 0 || value > 1))
      problems.push(`${path}: \`state.pressScale\` is ${value}, not in (0, 1]`);

    for (const [pattern, allowed] of Object.entries(whitelists))
      if (matches(pattern, key) && !allowed.includes(value as string | null))
        problems.push(
          `${path}: \`${key}\` is ${JSON.stringify(value)}, not one of ${allowed.map((v) => JSON.stringify(v)).join(", ")}`,
        );
  }
  return problems;
}
