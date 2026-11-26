/**
 * Tests for the Theme v5 resolved semantics table (`docs/specs/semantics-values.md`).
 */
import { describe, expect, test } from "bun:test";

import {
  COLUMNS,
  MISSING,
  SECTIONS,
  colourCells,
  elevationCells,
  fold,
  format,
  meaning,
  readThemes,
  renderPage,
  rowCount,
  surfaceCells,
  walkCells,
  type Theme,
} from "./semantics-table";

type Json = Record<string, unknown>;

const themeFixture = (colours: Json = {}, specOverrides: Partial<Theme["spec"]> = {}): Theme => {
  const base = readThemes()[0]!;
  return {
    id: "fixture",
    label: "Fixture",
    colours,
    spec: { ...base.spec, ...specOverrides },
  };
};

const cells = (read: Map<string, string>) => Object.fromEntries(read);

describe("value formatting and folding", () => {
  test("numbers and booleans format verbatim, pipes escape cleanly", () => {
    expect(format(0)).toBe("0");
    expect(format(0.97)).toBe("0.97");
    expect(format(false)).toBe("false");
    expect(format("halo")).toBe("`halo`");
    expect(format("a|b")).toBe("`a\\|b`");
    expect(format(null)).toBe(MISSING);
    expect(format({ color: "primary", alpha: 0.15 })).toBe("`primary/15`");
    expect(format({ tint: "brand" })).toBe("`tint(brand)`");
    expect(format({ surface: "card" })).toBe("`surface(card)`");
  });

  test("two sides fold into one cell only when they differ", () => {
    expect(fold(1, 1)).toBe("1");
    expect(fold(1, 2)).toBe("1 / 2");
    expect(fold(null, "0 1px 0 red")).toBe("— / `0 1px 0 red`");
    expect(fold(0.5, undefined)).toBe("0.5");
    expect(fold(undefined, undefined)).toBe(MISSING);
  });
});

describe("tiered metrics, colours, surfaces, elevation", () => {
  test("walkCells folds pointer/touch tiers and preserves shared scalar values", () => {
    const read = walkCells(
      {
        hit: { pointer: 0, touch: 44 },
        height: { sm: { pointer: 24, touch: 32 } },
        stroke: { hairline: 1 },
      },
      "metrics",
    );
    expect(cells(read)).toEqual({
      "metrics.hit": "0 / 44",
      "metrics.height.sm": "24 / 32",
      "metrics.stroke.hairline": "1",
    });
  });

  test("colourCells folds light/dark roles and leaves non-colour vars out", () => {
    const read = colourCells(
      themeFixture({
        light: { background: "oklch(1 0 0)", ring: "var(--foreground)" },
        dark: { background: "oklch(0 0 0)", ring: "var(--foreground)" },
        theme: { scrim: "oklch(0 0 0 / 0.4)", radius: "8px" },
      }),
    );
    expect(cells(read)).toEqual({
      background: "`oklch(1 0 0)` / `oklch(0 0 0)`",
      ring: "`var(--foreground)`",
      scrim: "`oklch(0 0 0 / 0.4)`",
    });
  });

  test("surfaceCells resolves shared defaults with light/dark overrides before folding", () => {
    const t = themeFixture();
    const read = surfaceCells({
      ...t,
      spec: {
        ...t.spec,
        surfaces: {
          ...t.spec.surfaces,
          card: {
            background: "card",
            shadow: "md",
            elevation: null,
            light: { background: "surface" },
            dark: { background: "inset" },
          },
        },
      },
    });
    expect(read.get("surfaces.card.background")).toBe("`surface` / `inset`");
    expect(read.get("surfaces.card.shadow")).toBe("`md`");
    expect(read.get("surfaces.card.elevation")).toBe("—");
  });

  test("elevationCells folds light/dark scales", () => {
    const t = themeFixture();
    const read = elevationCells({
      ...t,
      spec: {
        ...t.spec,
        elevation: {
          light: { sm: "0 1px 0 red", md: null, lg: null, xl: null, inset: null },
          dark: { sm: "0 1px 0 black", md: null, lg: null, xl: null, inset: null },
        },
      },
    });
    expect(read.get("elevation.sm")).toBe("`0 1px 0 red` / `0 1px 0 black`");
    expect(read.get("elevation.md")).toBe(MISSING);
  });
});

describe("rendered page", () => {
  const page = renderPage();
  const rows = page.split("\n").filter((line) => line.startsWith("| `"));

  test("every field has a row, Chinese description, and valid table columns", () => {
    expect(rows.length).toBe(rowCount());
    expect(rows.length).toBeGreaterThan(COLUMNS.length * 25);
    const unset = rows.filter((line) =>
      line
        .split(" | ")
        .slice(2)
        .every((cell) => cell.replace(/ \|$/, "") === "—"),
    );
    expect(unset).toEqual([]);
    for (const row of rows) {
      const cellsOfRow = row.split(/(?<!\\)\|/).slice(1, -1);
      expect(cellsOfRow.length).toBe(COLUMNS.length + 2);
      const [field, described] = cellsOfRow;
      expect(field).toMatch(/^\s`[^`]+`\s$/);
      expect(described?.trim()).not.toBe("");
    }
  });

  test("sections match SECTIONS order and unknown paths throw", () => {
    const headings = page.split("\n").filter((line) => line.startsWith("## "));
    expect(headings.length).toBe(SECTIONS.length);
    expect(headings[0]).toBe("## 1 颜色角色（`theme.json`）");
    expect(headings.at(-1)).toBe(`## ${SECTIONS.length} controls`);
    expect(() => meaning("typography.body.fontWeight")).not.toThrow();
    expect(() => meaning("metrics.hit")).not.toThrow();
    expect(() => meaning("surfaces.nothing.background")).toThrow(/no description/);
  });
});
