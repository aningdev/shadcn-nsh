/**
 * The values page: how a compiled value becomes a cell, and that every cell on the page is
 * described.
 *
 * `docs:semantics --check` proves the page matches what the generator would write; this proves the
 * generator reads the two shapes it meets — a value split by input tier and one split by appearance,
 * with finishes further split into `shared` plus sparse overrides — the way the page claims.
 */
import { describe, expect, test } from "bun:test";

import {
  COLUMNS,
  MISSING,
  SECTIONS,
  colourCells,
  elevationCells,
  finishCells,
  fold,
  format,
  meaning,
  renderPage,
  rowCount,
  styleCells,
  type Theme,
} from "./semantics-table";

type Json = Record<string, unknown>;

/** A theme built from the two objects the page reads, so a case states only what it is about. */
const theme = (colours: Json = {}, semantics: Json = {}): Theme => ({
  id: "fixture",
  label: "Fixture",
  colours,
  semantics,
});

const cells = (read: Map<string, string>) => Object.fromEntries(read);

describe("a value as a cell", () => {
  test("numbers and booleans are written as they are", () => {
    expect(format(0)).toBe("0");
    expect(format(0.97)).toBe("0.97");
    expect(format(false)).toBe("false");
  });

  test("a string sits in a code span, a pipe escaped so the cell survives", () => {
    expect(format("halo")).toBe("`halo`");
    expect(format("a|b")).toBe("`a\\|b`");
  });

  test("null reads as unset, an object as compact JSON", () => {
    expect(format(null)).toBe("—");
    expect(format({ a: 1, b: [2] })).toBe('`{"a":1,"b":[2]}`');
  });

  test("two sides fold into one cell only when they differ", () => {
    expect(fold(1, 1)).toBe("1");
    expect(fold(1, 2)).toBe("1 / 2");
    expect(fold(null, "0 1px 0 red")).toBe("— / `0 1px 0 red`");
    expect(fold(0.5, undefined)).toBe("0.5");
    expect(fold(undefined, undefined)).toBe(MISSING);
  });
});

describe("a value split by input tier", () => {
  test("pointer and touch share one row, a leaf under either one row per key", () => {
    const read = styleCells(
      "dimension",
      theme(
        {},
        {
          dimension: {
            size: { hit: { pointer: 0, touch: 44 }, height: { sm: { pointer: 24, touch: 32 } } },
          },
        },
      ),
    );
    expect(cells(read)).toEqual({
      "dimension.size.hit": "0 / 44",
      "dimension.size.height.sm": "24 / 32",
    });
  });

  test("a value both tiers agree on is written once", () => {
    const read = styleCells(
      "dimension",
      theme({}, { dimension: { focus: { width: { pointer: 3, touch: 3 } } } }),
    );
    expect(cells(read)).toEqual({ "dimension.focus.width": "3" });
  });

  test("a value with no tier is a row as it is", () => {
    const read = styleCells(
      "state",
      theme({}, { state: { "press-scale": 1, overlay: { hover: 0 } } }),
    );
    expect(cells(read)).toEqual({ "state.press-scale": "1", "state.overlay.hover": "0" });
  });
});

describe("the colour roles of theme.json", () => {
  test("light and dark fold, a shared colour reads once, a radius is not a role", () => {
    const read = colourCells(
      theme({
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
});

describe("finishes and elevation", () => {
  test("shared values are merged with each appearance before folding", () => {
    const read = finishCells(
      theme(
        {},
        {
          finishes: {
            shared: { card: { background: "{card}", shadow: "0 1px 0 red", elevation: null } },
            light: { card: { background: "{raised}" } },
            dark: { card: { background: "{inset}" } },
          },
        },
      ),
    );
    expect(cells(read)).toEqual({
      "finishes.card.background": "`{raised}` / `{inset}`",
      "finishes.card.shadow": "`0 1px 0 red`",
      "finishes.card.elevation": "—",
    });
  });

  test("an elevation level is one row, its two appearances folded", () => {
    const read = elevationCells(
      theme(
        {},
        {
          elevation: {
            light: {
              sm: "0 1px 0 red",
              inset: "inset 0 1px 0 white",
              edge: { surface: "0 0 0 1px red" },
            },
            dark: { sm: "0 1px 0 black", inset: "inset 0 1px 0 black" },
          },
        },
      ),
    );
    expect(cells(read)).toEqual({
      "elevation.sm": "`0 1px 0 red` / `0 1px 0 black`",
      "elevation.inset": "`inset 0 1px 0 white` / `inset 0 1px 0 black`",
      "elevation.edge.surface": "`0 0 0 1px red`",
    });
  });
});

describe("the page as the build writes it", () => {
  const page = renderPage();
  const rows = page.split("\n").filter((line) => line.startsWith("| `"));

  test("every field of the five themes has a row, described, with a cell per theme", () => {
    expect(rows.length).toBe(rowCount());
    expect(rows.length).toBeGreaterThan(COLUMNS.length * 35);
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

  test("each section is a table of its own, under its own heading", () => {
    const headings = page.split("\n").filter((line) => line.startsWith("## "));
    expect(headings.length).toBe(SECTIONS.length);
    expect(headings[0]).toBe("## 1 颜色角色（`theme.json`）");
    expect(headings.at(-1)).toBe(`## ${SECTIONS.length} elevation`);
  });

  test("a field no source describes is an error, not a blank cell", () => {
    expect(() => meaning("typography.body.fontWeight")).not.toThrow();
    expect(() => meaning("dimension.size.hit")).not.toThrow();
    expect(() => meaning("finishes.nothing.background")).toThrow(/no description/);
    expect(() => meaning("typography.unknown.fontWeight")).toThrow(/no description/);
  });
});
