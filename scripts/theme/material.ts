/**
 * The platform material a finish asks for (`material`), checked: every finish of every theme states
 * the field, `null` where it asks for nothing, and what it states comes from NSH's lists.
 *
 * The lists are NSH's own (`references/nsh/website/docs/styling.md`, the types in `nsh`): `glassEffect`
 * and `glassTintColor` for Apple's glass, `ios.backdropMaterial`, `macos.backdrop`, `windows.backdrop`.
 *
 * Pure: no `node:fs`, so `theme-lint.ts`, the theme generators and the unit tests all read it.
 */
import { readColour } from "./finish-colour";
import { parseTokenRef, type TokenKind } from "./tokens";

/** What each platform's entry may hold, key by key: the value a key may take, and whether it must be there. */
const shape: Record<
  string,
  Record<string, { values: readonly string[] | "color"; required: boolean }>
> = {
  apple: {
    glass: { values: ["regular", "clear"], required: true },
    tint: { values: "color", required: true },
  },
  ios: {
    backdrop: { values: ["ultraThin", "thin", "regular", "thick", "chrome"], required: true },
  },
  macos: {
    backdrop: {
      values: [
        "titlebar",
        "selection",
        "menu",
        "popover",
        "sidebar",
        "headerView",
        "sheet",
        "windowBackground",
        "hudWindow",
        "fullScreenUI",
        "toolTip",
        "contentBackground",
        "underWindowBackground",
        "underPageBackground",
      ],
      required: true,
    },
    blending: { values: ["withinWindow", "behindWindow"], required: false },
    state: { values: ["followsWindowActiveState", "active", "inactive"], required: false },
  },
  windows: { backdrop: { values: ["blur"], required: true } },
};

/** A finish's `material` the way every finish writes it when it asks for nothing. */
export const noMaterial = null;

/** Every finish of a `semantics.json` document with `material: null`: what a generated theme writes. */
export const withoutMaterial = (
  finishes: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> =>
  Object.fromEntries(
    Object.entries(finishes).map(([role, finish]) => [role, { ...finish, material: noMaterial }]),
  );

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const platforms = [...Object.keys(shape), "android"] as const;

function checkAndroidMaterial(
  label: string,
  entry: unknown,
  known: Map<string, TokenKind> | Set<string>,
  refFormat: "flat" | "dtcg",
): string[] {
  if (!isObject(entry)) return [`${label}.android is ${JSON.stringify(entry)}, not an object`];
  const problems: string[] = [];
  const allowedKeys = new Set(["ripple", "elevation"]);
  for (const key of Object.keys(entry)) {
    if (!allowedKeys.has(key))
      problems.push(`${label}.android.${key} is not a key of android (ripple, elevation)`);
  }
  if ("elevation" in entry) {
    const elevation = entry.elevation;
    if (typeof elevation !== "number" || !Number.isFinite(elevation) || elevation < 0) {
      problems.push(
        `${label}.android.elevation is ${JSON.stringify(elevation)}, not a non-negative number`,
      );
    }
  }
  if ("ripple" in entry) {
    const ripple = entry.ripple;
    if (!isObject(ripple)) {
      problems.push(`${label}.android.ripple is ${JSON.stringify(ripple)}, not an object`);
      return problems;
    }
    const allowedRippleKeys = new Set(["color", "borderless", "radius", "foreground"]);
    for (const key of Object.keys(ripple)) {
      if (!allowedRippleKeys.has(key)) {
        problems.push(
          `${label}.android.ripple.${key} is not a key of android.ripple (${[...allowedRippleKeys].join(", ")})`,
        );
      }
    }
    if (!("color" in ripple)) {
      problems.push(`${label}.android.ripple.color is missing`);
    } else if (typeof ripple.color !== "string") {
      problems.push(
        `${label}.android.ripple.color is ${JSON.stringify(ripple.color)}, not a \`{token}\` reference to a color token`,
      );
    } else {
      const ref =
        refFormat === "dtcg"
          ? (/^\{color\.([a-z0-9-]+)\}$/.exec(ripple.color)?.[1] ?? null)
          : parseTokenRef(ripple.color);
      if (ref === null) {
        problems.push(
          `${label}.android.ripple.color writes ${ripple.color}, not a \`{token}\` reference to a color token`,
        );
      } else if (known instanceof Map) {
        const kind = known.get(ref);
        if (kind === undefined) {
          problems.push(
            `${label}.android.ripple.color names token \`${ref}\`, which the theme does not have`,
          );
        } else if (kind !== "color") {
          problems.push(
            `${label}.android.ripple.color names token \`${ref}\`, which is a ${kind}, not a color`,
          );
        }
      } else if (!known.has(ref)) {
        problems.push(
          `${label}.android.ripple.color names token \`${ref}\`, which the theme does not have`,
        );
      }
    }
    for (const flag of ["borderless", "foreground"] as const) {
      if (flag in ripple && typeof ripple[flag] !== "boolean") {
        problems.push(
          `${label}.android.ripple.${flag} is ${JSON.stringify(ripple[flag])}, not a boolean`,
        );
      }
    }
    if ("radius" in ripple) {
      const radius = ripple.radius;
      if (typeof radius !== "number" || !Number.isFinite(radius) || radius < 0) {
        problems.push(
          `${label}.android.ripple.radius is ${JSON.stringify(radius)}, not a non-negative number`,
        );
      }
    }
  }
  return problems;
}

/**
 * What is wrong with one finish's `material`, each as a line naming the finish: a finish that does
 * not state it, a platform or key outside the shape, a value outside NSH's list, a tint that is
 * no color of the theme. `known` are the theme's tokens, for the tint and ripple colour.
 */
export function checkMaterial(
  path: string,
  where: string,
  finish: Record<string, unknown>,
  known: Map<string, TokenKind> | Set<string>,
  refFormat: "flat" | "dtcg" = "flat",
): string[] {
  const label = `${path}: ${where}.material`;
  if (!("material" in finish))
    return [`${label} is missing, and every finish states a material (null for none)`];
  const material = finish.material;
  if (material === null) return [];
  if (!isObject(material))
    return [`${label} is ${JSON.stringify(material)}, not null or an object`];
  const problems: string[] = [];
  for (const [platform, entry] of Object.entries(material)) {
    if (platform === "android") {
      problems.push(...checkAndroidMaterial(label, entry, known, refFormat));
      continue;
    }
    const keys = shape[platform];
    if (keys === undefined) {
      problems.push(
        `${label}.${platform} is no platform of the material (${platforms.join(", ")})`,
      );
      continue;
    }
    if (!isObject(entry)) {
      problems.push(`${label}.${platform} is ${JSON.stringify(entry)}, not an object`);
      continue;
    }
    for (const [key, rule] of Object.entries(keys))
      if (rule.required && !(key in entry)) problems.push(`${label}.${platform}.${key} is missing`);
    for (const [key, value] of Object.entries(entry)) {
      const rule = keys[key];
      if (rule === undefined) {
        problems.push(
          `${label}.${platform}.${key} is not a key of ${platform} (${Object.keys(keys).join(", ")})`,
        );
      } else if (rule.values === "color") {
        // A tint is null (the system's own) or a color of the theme, written as a finish writes one.
        if (value === null) continue;
        if (typeof value !== "string") {
          problems.push(
            `${label}.${platform}.${key} is ${JSON.stringify(value)}, not null or a color string`,
          );
          continue;
        }
        const normalized =
          refFormat === "dtcg" ? value.replace(/\{color\.([a-z0-9-]+)\}/g, "{$1}") : value;
        const verdict = readColour(normalized, known, new Set(), "material");
        for (const problem of verdict.problems)
          problems.push(
            problem.kind === "unknown-token"
              ? `${label}.${platform}.${key} names token \`${problem.name}\`, which the theme does not have`
              : problem.kind === "wrong-kind"
                ? `${label}.${platform}.${key} names token \`${problem.name}\`, which is a ${problem.actual}, not a ${problem.expected}`
                : `${label}.${platform}.${key} writes ${problem.literal}, which is no token of the theme`,
          );
      } else if (!rule.values.includes(value as string)) {
        problems.push(
          `${label}.${platform}.${key} is ${JSON.stringify(value)}, not one of ${rule.values.map((v) => JSON.stringify(v)).join(", ")}`,
        );
      }
    }
  }
  return problems;
}
