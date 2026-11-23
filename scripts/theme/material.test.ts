import { describe, expect, test } from "bun:test";

import { materials } from "../../packages/theme/materials";
import { checkMaterial, checkMaterialFill, finishMaterials, recipeOf } from "./material";

const check = (material: unknown, elevation?: unknown) =>
  checkMaterial("themes/x/semantics.json", "menu.light", { material, elevation });

const fallback = (finish: Record<string, unknown>) =>
  checkMaterialFill("themes/x/semantics.json", "menu.light", finish);

describe("the recipes", () => {
  test("every recipe guarantees a blur and a least opaque fill", () => {
    for (const [name, recipe] of Object.entries(materials)) {
      expect(recipe.fallback.blur, name).toBeGreaterThan(0);
      expect(recipe.fallback.minOpacity, name).toBeGreaterThan(0);
      expect(recipe.fallback.minOpacity, name).toBeLessThanOrEqual(1);
    }
  });

  test("every recipe asks the platform for something", () => {
    for (const [name, recipe] of Object.entries(materials)) {
      expect(recipe.glassEffect !== undefined || Object.keys(recipe.props).length > 0, name).toBe(
        true,
      );
    }
  });

  test("glass is the system glass; acrylic is the window's blur", () => {
    expect(materials.glass.glassEffect).toBe("regular");
    expect(materials.glass.props.ios).toEqual({ backdropMaterial: "regular" });
    expect(materials.acrylic.glassEffect).toBeUndefined();
    expect(materials.acrylic.props.windows).toEqual({ backdrop: { material: "blur" } });
  });
});

describe("checkMaterial", () => {
  test("every recipe and none pass, with an elevation or without", () => {
    for (const value of finishMaterials) expect(check(value)).toEqual([]);
    expect(check("glass", 4)).toEqual([]);
    expect(check(null)).toEqual([]);
  });

  test("a finish with no material is named", () => {
    expect(check(undefined)[0]).toContain("menu.light.material is missing");
  });

  test("values outside the recipes are named", () => {
    expect(check("frosted")[0]).toContain('"frosted"');
    expect(check({ apple: { glass: "regular" } })[0]).toContain("not one of");
  });

  test("an elevation is a non-negative height in points", () => {
    expect(check("none", -1)[0]).toContain("menu.light.elevation");
    expect(check("none", "6")[0]).toContain("menu.light.elevation");
    expect(check("none", Number.NaN)[0]).toContain("menu.light.elevation");
  });
});

describe("checkMaterialFill", () => {
  test("a material's fill stands in for it where the platform draws none", () => {
    expect(
      fallback({ background: "oklch(from {popover} l c h / 0.72)", material: "glass" }),
    ).toEqual([]);
    expect(
      fallback({ background: "oklch(from {popover} l c h / 0.4)", material: "glass" })[0],
    ).toContain("below its fallback's 0.72");
    expect(
      fallback({ background: "oklch(from {popover} l c h / 0.4)", material: "acrylic" })[0],
    ).toContain("0.85");
  });

  test("an opaque fill, or no material, asks nothing of the fallback", () => {
    expect(fallback({ background: "{popover}", material: "glass" })).toEqual([]);
    expect(fallback({ background: "transparent", material: "none" })).toEqual([]);
    expect(fallback({ background: "transparent", material: null })).toEqual([]);
  });
});

describe("recipeOf", () => {
  test("names the recipe, or null for none", () => {
    expect(recipeOf("glass")).toBe("glass");
    expect(recipeOf("acrylic")).toBe("acrylic");
    expect(recipeOf("none")).toBeNull();
    expect(recipeOf(null)).toBeNull();
    expect(recipeOf({ apple: {} })).toBeNull();
  });
});
