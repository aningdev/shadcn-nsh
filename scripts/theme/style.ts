/**
 * The style data of a theme, checked: the groups `semantics.json` states beside its finishes
 * (typography, dimension, shape, state, transition, motion, controls), which every theme states
 * with the same keys, whose enums come from a list, whose token references (`dimension.shape.*`
 * radii) name `dimension` tokens in `theme.json`, and whose sizes land on the three scales
 * (`checkScales`): three heights, three icons, spacing on the 4 grid, and a type ramp that never
 * steps down.
 *
 * Pure: no `node:fs`, so `theme-lint.ts`, the theme generators and the unit tests all read it.
 */
import { CONTROL_DIMENSIONS, MOTION_ROLES, type ControlDimension } from "../tokens/types";
import { parseTokenRef, type SplitFinishes, type TokenKind } from "./tokens";

/** The groups of `semantics.json` that are style, in the order the file writes them. */
export const styleGroups = [
  "typography",
  "dimension",
  "shape",
  "state",
  "transition",
  "motion",
  "controls",
] as const;

/** The style groups of a `semantics.json` document: every group, nothing else. */
export const styleOf = (file: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(styleGroups.filter((group) => group in file).map((g) => [g, file[g]]));

/** Every easing name a theme may name in `transition.enter.timingFunction` or a timing `motion.<role>`. */
export const easingNames = [
  "out-cubic",
  "in-cubic",
  "in-out-cubic",
  "standard",
  "emphasized-decelerate",
  "emphasized-accelerate",
  "decelerate",
  "accelerate",
  "point-to-point",
] as const;

/**
 * The values each control dimension may take (`docs/specs/theme-contract-v2.md` §14): the axes are
 * behaviour-named, so a name may recur in another dimension with another meaning (`track`).
 */
export const controlDimensionValues: Record<ControlDimension, readonly string[]> = {
  selection: ["pill", "underline", "bar"],
  field: ["box", "underline", "box-underline"],
  choice: ["well", "outline", "inset"],
  track: ["sunk", "tint", "hairline"],
  handle: ["circle", "bar", "ring"],
  group: ["track", "cells"],
};

/** One theme's values that must come from a list: the path of the key, and the values it may take. */
export const whitelists: Record<string, readonly (string | number | null)[]> = {
  "typography.*.fontWeight": [400, 500, 600, 700],
  "shape.curve": ["continuous", "circular"],
  "shape.corners.button": ["radius", "full"],
  "dimension.size.control.*.switch": ["small", "regular"],
  "dimension.focus.style": ["halo", "outline", "double"],
  ...Object.fromEntries(
    CONTROL_DIMENSIONS.map((key) => [`dimension.control.${key}`, controlDimensionValues[key]]),
  ),
  "transition.enter.timingFunction": easingNames,
  controls: ["base", "material", "winui"],
};

/** The motion roles, named by speed and the state fade (`docs/specs/theme-contract-v2.md` §17). */
export const motionRoleNames = MOTION_ROLES;

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isMotionRolePath = (path: string) =>
  motionRoleNames.some((role) => path === `motion.${role}` || path.startsWith(`motion.${role}.`));

/** Shared validator for a timing motion spec (`duration` >= 0 and whitelisted `timingFunction`). */
export function checkTimingSpec(
  path: string,
  key: string,
  value: Record<string, unknown>,
): string[] {
  const problems: string[] = [];
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
  if (!("timingFunction" in value)) problems.push(`${path}: \`${key}.timingFunction\` is missing`);
  else if (
    typeof value.timingFunction !== "string" ||
    !easingNames.includes(value.timingFunction as never)
  ) {
    problems.push(
      `${path}: \`${key}.timingFunction\` is ${JSON.stringify(value.timingFunction)}, not one of ${easingNames.map((v) => JSON.stringify(v)).join(", ")}`,
    );
  }
  return problems;
}

/** Shared validator for a spring motion spec (`stiffness` >= 0 and `damping` >= 0). */
export function checkSpringSpec(
  path: string,
  key: string,
  value: Record<string, unknown>,
): string[] {
  const problems: string[] = [];
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

/** Shared bounds check for `state["press-scale"]` in `(0, 1]`. */
export const isValidPressScale = (value: unknown): boolean =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1;

function checkMotionRole(path: string, role: string, value: unknown): string[] {
  const key = `motion.${role}`;
  if (value === undefined) return [`${path}: \`${key}\` is missing`];
  if (!isObject(value))
    return [`${path}: \`${key}\` is ${JSON.stringify(value)}, not a Spring or Timing object`];

  const problems: string[] = [];
  const hasSpring = "stiffness" in value || "damping" in value;
  const hasTiming = "duration" in value || "timingFunction" in value;
  if (hasSpring && hasTiming) {
    return [
      `${path}: \`${key}\` mixes spring keys (stiffness/damping) and timing keys (duration/timingFunction)`,
    ];
  }

  if (hasTiming) {
    const allowed = new Set(["duration", "timingFunction"]);
    for (const k of Object.keys(value))
      if (!allowed.has(k)) problems.push(`${path}: \`${key}.${k}\` is not a key of a Timing`);
    problems.push(...checkTimingSpec(path, key, value));
    return problems;
  }

  const allowed = new Set(["stiffness", "damping"]);
  for (const k of Object.keys(value))
    if (!allowed.has(k)) problems.push(`${path}: \`${key}.${k}\` is not a key of a Spring`);
  problems.push(...checkSpringSpec(path, key, value));
  return problems;
}

/** The steps a spacing value may take: the 4 px grid, up to a section's inset. */
export const spacingSteps = [4, 8, 12, 16, 24, 32] as const;

/** A value a platform states off the grid, with the source that states it. */
export interface ScaleCitation {
  /** The style key it sits at: `dimension.size.control.pointer.padding`. */
  key: string;
  /** The value it takes. */
  value: number;
  /** Where the platform says so: the spec or source file, in `docs/specs/theme-roles.md`'s list. */
  source: string;
}

/** A citation's id: the key and the value it excuses. */
export const citationId = (key: string, value: number) => `${key} ${value}`;

const scaleKey = (key: string, theme: string) => `${theme}:${key}`;

/** Cited values by theme: `theme:key` → the values its citations excuse. */
export function citedValues(citations: readonly (ScaleCitation & { theme: string })[]) {
  const out = new Map<string, Set<number>>();
  for (const { theme, key, value } of citations) {
    const id = scaleKey(key, theme);
    const values = out.get(id) ?? new Set<number>();
    values.add(value);
    out.set(id, values);
  }
  return out;
}

/** The keys a theme's spacing takes: the page's and a control's insets and gaps. */
const spacingKeys = [
  "dimension.size.density.pad",
  "dimension.size.density.gap",
  "dimension.size.control.padding",
  "dimension.size.control.gap",
] as const;

/** The typography roles, in the order the ramp climbs. */
export const typeRamp = [
  "caption",
  "detail",
  "body",
  "label",
  "title",
  "headline",
  "display",
] as const;

/**
 * What is wrong with a theme's scales, each as a line naming the key:
 * - a height or an icon that is not three steps, climbing, on the 4 px grid;
 * - a spacing value off the grid (`spacingSteps`), and more than three of them in a tier;
 * - a list row's inset or pad off the grid (0 allowed for an inset), or a pad inside its inset;
 * - a type ramp that steps down, or a line height that is not a whole number of points or is
 *   shorter than its text.
 * A value the platform states itself is excused by a citation (`citedValues`): the spec's list
 * names the theme, the key, the value and the source.
 */
export function checkScales(
  path: string,
  file: Record<string, unknown>,
  themeId: string,
  cited: Map<string, Set<number>> = new Map(),
): string[] {
  const problems: string[] = [];
  const excused = (key: string, value: number) => cited.get(scaleKey(key, themeId))?.has(value);
  const dimension = isObject(file.dimension) ? file.dimension : {};
  const size = isObject(dimension.size) ? dimension.size : {};
  const icon = isObject(dimension.icon) ? dimension.icon : {};

  const checkSteps = (group: string, steps: Record<string, unknown>, key: string) => {
    const full = `${group}.${key}`;
    for (const tier of ["pointer", "touch"] as const) {
      const tierSteps = isObject(steps) ? steps[tier] : undefined;
      if (!isObject(tierSteps)) continue;
      let previous = -1;
      for (const step of ["sm", "md", "lg"] as const) {
        const value = tierSteps[step];
        if (typeof value !== "number") continue;
        if (!Number.isInteger(value) || value % 4 !== 0) {
          if (excused(`${full}.${tier}.${step}`, value)) continue;
          problems.push(
            `${path}: \`${full}.${tier}.${step}\` is ${value}, not a whole number of 4 px steps`,
          );
        }
        if (value <= previous)
          problems.push(
            `${path}: \`${full}.${tier}.${step}\` is ${value}, not above the step before it (${previous})`,
          );
        previous = value;
      }
    }
  };
  checkSteps("dimension.size", isObject(size.height) ? size.height : {}, "height");
  checkSteps("dimension", isObject(icon) ? icon : {}, "icon");

  // A finger needs 44 points: Apple HIG's minimum hit region, WCAG 2.2 SC 2.5.5 (AAA) and Material's
  // 48dp both sit at or above it, so a touch tier that pads a control's hit region pads it that far.
  const hit = isObject(size.hit) ? size.hit.touch : undefined;
  if (typeof hit === "number" && hit < 44 && !excused("dimension.size.hit.touch", hit))
    problems.push(
      `${path}: \`dimension.size.hit.touch\` is ${hit}, below the 44-point touch target`,
    );

  for (const tier of ["pointer", "touch"] as const) {
    const values = new Set<number>();
    for (const key of spacingKeys) {
      const parts = key.split(".");
      let cursor: unknown = file;
      for (const part of parts) cursor = isObject(cursor) ? cursor[part] : undefined;
      const value = isObject(cursor) ? cursor[tier] : undefined;
      if (typeof value !== "number") continue;
      values.add(value);
      if (!(spacingSteps as readonly number[]).includes(value) && !excused(`${key}.${tier}`, value))
        problems.push(
          `${path}: \`${key}.${tier}\` is ${value}, not one of the spacing steps (${spacingSteps.join(", ")})`,
        );
    }
    if (values.size > 3)
      problems.push(
        `${path}: the ${tier} tier spaces with ${values.size} values (${[...values].join(", ")}), not 3 or fewer`,
      );
  }

  // A list's rows: on the spacing steps, or 0 for a fill that spans its container; the text sits
  // at least as far inside the fill as the fill sits inside its container. Not counted in the
  // tier's three spacing values: a platform states these beside its page spacing (WinUI's 4 and 11).
  const item = isObject(size.item) ? size.item : {};
  for (const tier of ["pointer", "touch"] as const) {
    const spacing = isObject(item[tier]) ? item[tier] : {};
    for (const part of ["inset", "pad"] as const) {
      const value = spacing[part];
      if (typeof value !== "number") continue;
      const key = `dimension.size.item.${tier}.${part}`;
      if (
        !(value === 0 || (spacingSteps as readonly number[]).includes(value)) &&
        !excused(key, value)
      )
        problems.push(
          `${path}: \`${key}\` is ${value}, not 0 or one of the spacing steps (${spacingSteps.join(", ")})`,
        );
    }
    const { inset, pad } = spacing;
    if (typeof inset === "number" && typeof pad === "number" && pad < inset)
      problems.push(
        `${path}: \`dimension.size.item.${tier}.pad\` is ${pad}, inside its ${inset} inset: the text would sit closer to the fill's edge than the fill to its container's`,
      );
  }

  const typography = isObject(file.typography) ? file.typography : {};
  for (const tier of ["pointer", "touch"] as const) {
    let previousSize = -1;
    for (const role of typeRamp) {
      const entry = typography[role];
      if (!isObject(entry)) continue;
      const fontSize = isObject(entry.fontSize) ? entry.fontSize[tier] : undefined;
      const lineHeight = isObject(entry.lineHeight) ? entry.lineHeight[tier] : undefined;
      if (typeof fontSize === "number") {
        if (fontSize < previousSize)
          problems.push(
            `${path}: \`typography.${role}.fontSize.${tier}\` is ${fontSize}, below the role before it (${previousSize})`,
          );
        previousSize = fontSize;
      }
      if (typeof lineHeight !== "number") continue;
      if (!Number.isInteger(lineHeight))
        problems.push(
          `${path}: \`typography.${role}.lineHeight.${tier}\` is ${lineHeight}, not a whole number of points`,
        );
      else if (typeof fontSize === "number" && lineHeight < fontSize)
        problems.push(
          `${path}: \`typography.${role}.lineHeight.${tier}\` is ${lineHeight}, shorter than its ${fontSize} pt text`,
        );
    }
  }
  return problems;
}

/** The three corner roles in `dimension.shape` that must reference a `dimension` token in `theme.json`. */
export const shapeRadiusRoles = ["control", "container", "modal"] as const;

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
 * Emit the four `radius*` tokens of `theme.json` from the theme's layer values (`control`,
 * `container`, `modal`, in px), with the shadcn A-layer `radius` slot matching `control`.
 */
export function scaledRadii(radii: {
  control: number;
  container: number;
  modal: number;
}): Record<string, string> {
  for (const [role, px] of Object.entries(radii)) {
    if (!Number.isFinite(px) || px < 0) {
      throw new Error(`radius.${role} must be a non-negative number, got ${px}`);
    }
  }
  return {
    radius: `${radii.control}px`,
    "radius-control": `${radii.control}px`,
    "radius-container": `${radii.container}px`,
    "radius-modal": `${radii.modal}px`,
  };
}

/**
 * A generated theme's `semantics.json`: the default theme's style (with the theme's own
 * `state["press-scale"]`), then its split finishes (`{ shared, light, dark }`). The default theme is
 * the one place the style numbers and `{radius-…}` references are written.
 */
export function semanticsWithStyle(
  generated: { "press-scale": number; finishes: SplitFinishes },
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const base = structuredClone(styleOf(defaults));
  (base.state as Record<string, unknown>)["press-scale"] = generated["press-scale"];
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
 * - a `dimension.shape.<role>` corner that is not a `{token}` reference to a `dimension` token in `theme.json`;
 * - a `state.press-scale` outside `(0, 1]`.
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

  const shapeRadiusKeys = new Set<string>(
    shapeRadiusRoles.map((role) => `dimension.shape.${role}`),
  );

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

    if (value !== null && other !== null && typeof value !== typeof other)
      problems.push(
        `${path}: \`${key}\` is a ${typeof value}, ${referenceName}'s is a ${typeof other}`,
      );
    else if (typeof value === "number" && !(Number.isFinite(value) && value >= 0))
      problems.push(`${path}: \`${key}\` is ${value}, not a number of 0 or more`);

    if (key === "state.press-scale" && typeof value === "number" && !isValidPressScale(value))
      problems.push(`${path}: \`state.press-scale\` is ${value}, not in (0, 1]`);

    for (const [pattern, allowed] of Object.entries(whitelists))
      if (matches(pattern, key) && !allowed.includes(value as string | number | null))
        problems.push(
          `${path}: \`${key}\` is ${JSON.stringify(value)}, not one of ${allowed.map((v) => JSON.stringify(v)).join(", ")}`,
        );
  }
  return problems;
}
