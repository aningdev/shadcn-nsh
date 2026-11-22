import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { specBlock, specRows } from "./spec";
import { withSurfaces } from "./surfaces";
import { mergeFinishes, splitFinishes, type ThemeCssVars } from "./tokens";

const root = join(import.meta.dir, "../..");
const readJson = (file: string) => JSON.parse(readFileSync(join(root, file), "utf8"));
const spec = readFileSync(join(root, "docs/specs/theme-roles.md"), "utf8");

const semantics = readJson("packages/theme/semantics.json") as Record<string, any>;
const cssVars = readJson("packages/theme/theme.json").cssVars as ThemeCssVars;
const mergedLight = mergeFinishes(semantics.finishes, "light");
const mergedDark = mergeFinishes(semantics.finishes, "dark");

const surfaces = ["dialog", "tooltip", "inverse"];
const roles = ["inverse", "inverse-foreground", "inverse-muted", "inverse-brand", "on-brand-tint"];

describe("the colour roles and finishes a theme states for its surfaces", () => {
  test("the default theme states them in both appearances", () => {
    for (const appearance of ["light", "dark"] as const) {
      const merged = appearance === "light" ? mergedLight : mergedDark;
      for (const role of roles) expect(cssVars[appearance][role], role).toBeString();
      for (const finish of surfaces) expect(merged[finish], finish).toBeObject();
    }
  });

  test("the spec lists every finish and every colour role, in its table", () => {
    const finishRows = specRows(specBlock(spec, "finishes")).map((row) => row[0]);
    for (const finish of surfaces) expect(finishRows.join(" "), finish).toContain(finish);
    for (const role of roles) expect(spec, role).toContain(`\`${role}\``);
  });

  test("withSurfaces derives the three finishes from the menu, after it", () => {
    const menu = mergedLight.menu;
    const out = withSurfaces({ card: mergedLight.card, menu, flat: mergedLight.flat });
    expect(Object.keys(out)).toEqual(["card", "menu", "dialog", "tooltip", "inverse", "flat"]);
    expect(out.dialog.shadow).toBe(menu.shadow);
    expect(out.tooltip.shadow).toBe("none");
    expect(String(out.inverse.background)).toContain("{inverse}");
  });

  test("withSurfaces refuses a theme with no menu", () => {
    expect(() => withSurfaces({ card: mergedLight.card })).toThrow("no menu");
  });

  test("splitFinishes + mergeFinishes round-trips full light/dark maps", () => {
    const split = splitFinishes(mergedLight, mergedDark);
    expect(mergeFinishes(split, "light")).toEqual(mergedLight);
    expect(mergeFinishes(split, "dark")).toEqual(mergedDark);
  });
});
