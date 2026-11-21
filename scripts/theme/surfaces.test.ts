import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { orderedFinish } from "./order";
import { specBlock, specRows } from "./spec";
import { checkStyle } from "./style";
import { withSurfaces } from "./surfaces";

const root = join(import.meta.dir, "../..");
const readJson = (file: string) => JSON.parse(readFileSync(join(root, file), "utf8"));
const spec = readFileSync(join(root, "docs/specs/theme-roles.md"), "utf8");

const finishes = readJson("packages/theme/finishes.json") as Record<string, any>;
const tokens = readJson("packages/theme/theme.json").cssVars as Record<
  string,
  Record<string, string>
>;

const surfaces = ["dialog", "tooltip", "inverse"];
const roles = ["inverse", "inverse-foreground", "inverse-brand", "on-brand-tint"];

describe("the colour roles and finishes a theme states for its surfaces", () => {
  test("the default theme states them in both appearances", () => {
    for (const appearance of ["light", "dark"]) {
      for (const role of roles) expect(tokens[appearance][role], role).toBeString();
      for (const finish of surfaces) expect(finishes[appearance][finish], finish).toBeObject();
    }
  });

  test("the spec lists every finish and every colour role, in its table", () => {
    const finishRows = specRows(specBlock(spec, "finishes")).map((row) => row[0]);
    for (const finish of surfaces) expect(finishRows.join(" "), finish).toContain(finish);
    for (const role of roles) expect(spec, role).toContain(`\`${role}\``);
  });

  test("withSurfaces derives the three finishes from the menu, after it", () => {
    const menu = finishes.light.menu;
    const out = withSurfaces({ card: finishes.light.card, menu, flat: finishes.light.flat });
    expect(Object.keys(out)).toEqual(["card", "menu", "dialog", "tooltip", "inverse", "flat"]);
    expect(out.dialog.boxShadow).toBe(menu.boxShadow);
    expect(out.tooltip.boxShadow).toBe("none");
    expect(String(out.inverse.backgroundColor)).toContain("var(--inverse)");
  });

  test("withSurfaces refuses a theme with no menu", () => {
    expect(() => withSurfaces({ card: finishes.light.card })).toThrow("no menu");
  });

  test("a finish that leaves a key out, or adds one, is an error", () => {
    const { backgroundColor: _omitted, ...short } = finishes.light.dialog;
    expect(() => orderedFinish(finishes.light.dialog, short)).toThrow("no backgroundColor");
    expect(() =>
      orderedFinish(finishes.light.dialog, { ...finishes.light.dialog, glow: 1 }),
    ).toThrow("glow");
  });
});

describe("the indicator keys", () => {
  const check = (file: Record<string, unknown>) =>
    checkStyle("fixture/finishes.json", file, finishes, tokens.theme);

  test("a theme that leaves one out is an error naming it", () => {
    for (const [group, key] of [
      ["indicator", "tabs"],
      ["indicator", "nav"],
      ["indicator", "field"],
    ]) {
      const file = structuredClone(finishes);
      delete file[group][key];
      const problems = check(file);
      expect(problems.join("\n"), `${group}.${key}`).toContain(`${group}.${key}`);
    }
    const file = structuredClone(finishes);
    delete file.shape.corners.field;
    expect(check(file).join("\n")).toContain("shape.corners.field");
  });

  test("a value outside the list is an error", () => {
    for (const [path, value] of [
      ["indicator.tabs", "box"],
      ["indicator.nav", "pill"],
      ["indicator.field", "line"],
    ]) {
      const file = structuredClone(finishes);
      const [group, key] = path.split(".");
      file[group][key] = value;
      expect(check(file).join("\n"), path).toContain(path);
    }
    const file = structuredClone(finishes);
    file.shape.corners.field = "bottom";
    expect(check(file).join("\n")).toContain("shape.corners.field");
  });
});
