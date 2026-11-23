import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { specControlDimensions, specEnums, specRecipes } from "./spec";
import { controlDimensionValues, whitelists } from "./style";

const theme = join(import.meta.dir, "../../packages/theme");
const read = (file: string) => JSON.parse(readFileSync(join(theme, file), "utf8")) as any;
const spec = readFileSync(join(import.meta.dir, "../../docs/specs/theme-roles.md"), "utf8");

/** The themes that state a style: every folder under `themes/`, `native` being a chooser. */
const themes = readdirSync(join(theme, "themes"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "native")
  .map((entry) => entry.name)
  .sort();

const semantics = (name: string) => read(`themes/${name}/semantics.json`);
const shared = ["default", "shadcn", "solid-glass", "apple"];

describe("the spec's control dimensions", () => {
  test("states one row per dimension, with values the enums allow", () => {
    const rows = specControlDimensions(spec);
    expect(rows.map((row) => row.dimension).sort()).toEqual(
      Object.keys(controlDimensionValues).sort(),
    );
    for (const row of rows)
      for (const column of row.columns) {
        expect(column.themes.length, `${row.dimension}: a column names no theme`).toBeGreaterThan(
          0,
        );
        expect(
          controlDimensionValues[row.dimension as keyof typeof controlDimensionValues],
          `${row.dimension}: ${column.value}`,
        ).toContain(column.value as never);
      }
  });

  test("names every theme in a column, and matches what it compiles to", () => {
    const rows = specControlDimensions(spec);
    for (const name of themes) {
      const named = rows.some((row) => row.columns.some((c) => c.themes.includes(name)));
      expect(named, `${name} is in no column of the control table`).toBe(true);
    }
    for (const row of rows) {
      for (const name of themes) {
        const column = row.columns.find((c) => c.themes.includes(name));
        expect(column, `${name} is in no column for ${row.dimension}`).toBeDefined();
        expect(semantics(name).dimension.control[row.dimension], `${name}.${row.dimension}`).toBe(
          column!.value,
        );
      }
    }
  });

  test("is read from semantics.json, never from theme.json", () => {
    for (const name of themes) {
      const file = name === "default" ? read("theme.json") : read(`themes/${name}/theme.json`);
      expect(JSON.stringify(file)).not.toContain("dimension.control");
      expect(semantics(name).dimension.control).toBeDefined();
    }
  });

  test("takes a base default and only the platform themes depart from it", () => {
    const base = semantics("default").dimension.control;
    expect(base).toEqual({
      selection: "pill",
      field: "box",
      choice: "well",
      track: "sunk",
      handle: "circle",
      group: "track",
    });
    for (const name of shared) expect(semantics(name).dimension.control).toEqual(base);
    expect(semantics("material").dimension.control.group).toBe("cells");
    expect(semantics("winui").dimension.control.group).toBe("track");
  });
});

describe("the spec's enum table", () => {
  test("is where the whitelists come from", () => {
    const enums = specEnums(spec);
    expect(enums.map((row) => row.key).sort()).toEqual(Object.keys(whitelists).sort());
    // A whole-number row reads back as numbers, since that is what a token path holds.
    expect(whitelists["typography.*.fontWeight"]).toEqual([400, 500, 600, 700]);
    expect(whitelists["transition.enter.timingFunction"]).toEqual([
      "out-cubic",
      "in-cubic",
      "in-out-cubic",
      "standard",
      "emphasized-decelerate",
      "emphasized-accelerate",
      "decelerate",
      "accelerate",
      "point-to-point",
    ]);
  });
});

describe("the spec's recipe numbers", () => {
  test("name only values their dimension takes", () => {
    for (const row of specRecipes(spec))
      expect(
        controlDimensionValues[row.dimension as keyof typeof controlDimensionValues],
        row.value,
      ).toContain(row.value as never);
  });
});

describe("motion.state", () => {
  test("is timed on every theme, at the platform's own duration", () => {
    const durations: Record<string, [number, string]> = {
      default: [120, "out-cubic"],
      shadcn: [120, "out-cubic"],
      "solid-glass": [120, "out-cubic"],
      apple: [120, "out-cubic"],
      material: [100, "standard"],
      winui: [83, "decelerate"],
    };
    for (const name of themes) {
      const state = semantics(name).motion.state;
      expect([state.duration, state.timingFunction], name).toEqual(durations[name]);
    }
  });

  test("the default theme keeps the other three roles' springs", () => {
    const { motion } = semantics("default");
    expect(motion.fast).toEqual({ stiffness: 1218, damping: 70 });
    expect(motion.default).toEqual({ stiffness: 520, damping: 34 });
    expect(motion.slow).toEqual({ stiffness: 320, damping: 30 });
  });
});
