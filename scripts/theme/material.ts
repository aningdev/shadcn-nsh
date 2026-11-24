/**
 * The platform material a finish asks for (`material`), checked: every finish whose role has one
 * states it, `"none"` where it asks nothing of the platform, and otherwise one of the recipes
 * `packages/theme/materials.ts` expands into NSH's props and a fallback. The `elevation` a finish may
 * state beside it is checked here too: Android draws its own shadow at that height.
 *
 * The enum is the theme source's vocabulary; the compiled `semantics.json` writes `null` for
 * `"none"`, and `null` for `elevation` where the layer has no height of its own (the neutral the
 * base set writes), as it writes `null` for a `gradient` a finish does not state.
 *
 * Pure: no `node:fs`, so `theme-lint.ts`, the theme generators and the unit tests all read it.
 */
import { finishFields, type FinishRole } from "../../packages/theme/finish-fields";
import { materials, type FinishMaterial } from "../../packages/theme/materials";

/** The values a finish's `material` may take: the recipes, and `"none"` for a layer that asks nothing. */
export const finishMaterials = ["none", "glass", "acrylic"] as const;

/** The two fields a finish may ask the platform for, named here so no rule reads a theme's id. */
const MATERIAL_FIELD = "material";
const ELEVATION_FIELD = "elevation";

/** What a finish's `material` states in the theme sources. */
export type MaterialValue = (typeof finishMaterials)[number];

/**
 * What is wrong with one finish's `material` and `elevation`, each as a line naming the finish: a
 * finish whose role has a material states one, a value outside the recipes, an elevation that is no
 * height, a field the role does not have. `path` and `where` name the finish; `role` says which
 * fields it has (`packages/theme/finish-fields.ts`); `material` is the source's `material` value (or
 * the compiled `null`), `elevation` the source's `elevation`.
 */
export function checkMaterial(
  path: string,
  where: string,
  finish: { material?: unknown; elevation?: unknown },
  role?: FinishRole,
): string[] {
  const label = `${path}: ${where}`;
  const problems: string[] = [];
  const fields: readonly string[] = role === undefined ? [] : finishFields[role];
  const stated = (field: string) => role === undefined || fields.includes(field);
  const material = finish.material;
  if (material === undefined || material === null) {
    if (material === undefined && stated(MATERIAL_FIELD)) {
      problems.push(
        `${label}.material is missing, and ${where} has one (${finishMaterials.join(", ")})`,
      );
    }
    if (material !== undefined && !stated(MATERIAL_FIELD)) {
      problems.push(`${label}.material is not a field \`${where}\` has`);
    }
  } else if (typeof material !== "string" || !finishMaterials.includes(material as MaterialValue)) {
    problems.push(
      `${label}.material is ${JSON.stringify(material)}, not one of ${finishMaterials.map((value) => JSON.stringify(value)).join(", ")}`,
    );
  }
  // `null` is the base set's neutral: the layer has no height of its own.
  const elevation = finish.elevation;
  if (elevation !== undefined && !stated(ELEVATION_FIELD)) {
    problems.push(`${label}.elevation is not a field \`${where}\` has`);
  } else if (elevation !== undefined && elevation !== null) {
    if (typeof elevation !== "number" || !Number.isFinite(elevation) || elevation < 0) {
      problems.push(
        `${label}.elevation is ${JSON.stringify(elevation)}, not a non-negative number of points`,
      );
    }
  }
  return problems;
}

/** The material a finish asks for, as a recipe name: `null` where it asks nothing of the platform. */
export function recipeOf(material: unknown): FinishMaterial | null {
  return material === "glass" || material === "acrylic" ? material : null;
}

/** The alpha a finish's fill is drawn at: `oklch(from {popover} l c h / 0.72)` is 0.72, a plain token 1. */
const fillAlpha = (background: unknown): number => {
  if (background === "transparent") return 0;
  const match = typeof background === "string" ? /\/\s*([\d.]+)\s*\)\s*$/.exec(background) : null;
  return match ? Number(match[1]) : 1;
};

/**
 * A finish whose material's fill is too translucent to stand in for the material where the platform
 * draws none, named: a glass or acrylic layer wears its recipe's `fallback.minOpacity` or more, so
 * a platform without the platform's blur (Linux, GPUI) does not show what is behind it unfiltered.
 * `background` is the finish's compiled fill.
 */
export function checkMaterialFill(
  path: string,
  where: string,
  finish: { background?: unknown; material?: unknown },
): string[] {
  const recipe = recipeOf(finish.material);
  if (recipe === null) return [];
  const least = materials[recipe].fallback.minOpacity;
  const alpha = fillAlpha(finish.background);
  return alpha >= least
    ? []
    : [
        `${path}: ${where} asks for ${recipe} over a fill ${alpha} opaque, below its fallback's ${least}`,
      ];
}
