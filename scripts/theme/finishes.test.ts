import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { specBlock, specRows } from "./spec";
import { mergeFinishes, splitFinishes, type ThemeCssVars } from "./tokens";

const root = join(import.meta.dir, "../..");
const readJson = (file: string) => JSON.parse(readFileSync(join(root, file), "utf8"));
const spec = readFileSync(join(root, "docs/specs/theme-roles.md"), "utf8");

const semantics = readJson("packages/theme/semantics.json") as Record<string, any>;
const cssVars = readJson("packages/theme/theme.json").cssVars as ThemeCssVars;
const mergedLight = mergeFinishes(semantics.finishes, "light");
const mergedDark = mergeFinishes(semantics.finishes, "dark");

/** The layers the contract names, in the order it names them. */
const layers = [
  "card",
  "inset",
  "channel",
  "raised",
  "plate",
  "overlay",
  "modal",
  "inverse",
  "glass",
  "accent",
  "knob",
  "hover",
  "pressed",
  "disabled",
];
const roles = ["inverse", "inverse-foreground", "inverse-brand"];

describe("the finishes a theme states, and the surfaces they paint", () => {
  test("the default theme states every layer in both appearances", () => {
    for (const appearance of ["light", "dark"] as const) {
      const merged = appearance === "light" ? mergedLight : mergedDark;
      for (const role of roles) expect(cssVars[appearance][role], role).toBeString();
      for (const layer of layers) expect(merged[layer], layer).toBeObject();
    }
  });

  test("a finish states a shadow and a foreground, the scale's parts carrying the shadow", () => {
    for (const appearance of ["light", "dark"] as const) {
      const merged = appearance === "light" ? mergedLight : mergedDark;
      for (const layer of layers) {
        expect(merged[layer].shadow, `${appearance} ${layer} shadow`).toBeString();
        expect(merged[layer].foreground, `${appearance} ${layer} foreground`).toBeString();
      }
    }
  });

  test("the spec lists every layer and every colour role, in its table", () => {
    const finishRows = specRows(specBlock(spec, "finishes")).map((row) => row[0]);
    expect(finishRows).toEqual(layers);
    for (const role of roles) expect(spec, role).toContain(`\`${role}\``);
  });

  test("splitFinishes + mergeFinishes round-trips full light/dark maps", () => {
    const split = splitFinishes(mergedLight, mergedDark);
    expect(mergeFinishes(split, "light")).toEqual(mergedLight);
    expect(mergeFinishes(split, "dark")).toEqual(mergedDark);
  });
});
