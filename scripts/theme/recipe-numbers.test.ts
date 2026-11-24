import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { checkRecipeNumbers, collectNumbers, lookNumbers } from "./recipe-numbers";
import { specRecipes } from "./spec";
import { controlDimensionValues } from "./style";

const spec = readFileSync(join(import.meta.dir, "../../docs/specs/theme-roles.md"), "utf8");
const rows = specRecipes(spec);

/** The look's numbers for one dimension value. */
const numbersOf = (dimension: string, value: string): number[] => {
  const look = lookNumbers().find((l) => l.dimension === dimension && l.value === value);
  if (look === undefined) throw new Error(`no look for ${dimension} ${value}`);
  return [...look.numbers];
};

describe("the recipe table and the looks", () => {
  test("state the same numbers", () => {
    expect(checkRecipeNumbers(rows, lookNumbers())).toEqual([]);
  });

  test("every value of every dimension has a look", () => {
    for (const [dimension, values] of Object.entries(controlDimensionValues)) {
      for (const value of values) {
        expect(
          lookNumbers().some((look) => look.dimension === dimension && look.value === value),
        ).toBe(true);
      }
    }
  });
});

describe("checkRecipeNumbers", () => {
  test("fails when a look's number is changed", () => {
    const changed = lookNumbers().map((look) =>
      look.dimension === "track" && look.value === "tint"
        ? { ...look, numbers: look.numbers.map((number) => (number === 4 ? 5 : number)) }
        : look,
    );
    expect(checkRecipeNumbers(rows, changed)).toEqual([
      "docs/specs/theme-roles.md: `tint` states 4; packages/ui/lib/look.ts does not draw it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 5 for `tint`; the table does not state it",
    ]);
  });

  test("fails when a look draws a number the table does not state", () => {
    const changed = lookNumbers().map((look) =>
      look.dimension === "track" && look.value === "tint"
        ? { ...look, numbers: [...look.numbers, 19] }
        : look,
    );
    expect(checkRecipeNumbers(rows, changed)).toEqual([
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 19 for `tint`; the table does not state it",
    ]);
  });

  test("fails when a look draws a number and has no row at all", () => {
    const changed = lookNumbers().map((look) =>
      look.dimension === "choice" && look.value === "well" ? { ...look, numbers: [6] } : look,
    );
    const noWellRow = rows.filter((row) => !(row.dimension === "choice" && row.value === "well"));
    expect(checkRecipeNumbers(noWellRow, changed)).toEqual([
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 6 for `well`; the recipe table has no row for it",
    ]);
  });

  test("fails when a table row's number is changed", () => {
    const changed = rows.map((row) =>
      row.dimension === "track" && row.value === "tint"
        ? { ...row, numbers: row.numbers.replace("progress 4", "progress 5") }
        : row,
    );
    expect(checkRecipeNumbers(changed, lookNumbers())).toEqual([
      "docs/specs/theme-roles.md: `tint` states 5; packages/ui/lib/look.ts does not draw it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 4 for `tint`; the table does not state it",
    ]);
  });

  test("fails when the table states a number its look leaves out", () => {
    const changed = rows.map((row) =>
      row.dimension === "track" && row.value === "tint"
        ? { ...row, numbers: "色带：progress 4、slider 16、spinner 8" }
        : row,
    );
    expect(checkRecipeNumbers(changed, lookNumbers())).toEqual([
      "docs/specs/theme-roles.md: `tint` states 8; packages/ui/lib/look.ts does not draw it",
    ]);
  });

  test("fails when a look is missing", () => {
    // A look left out of `lookNumbers` stands for one dropped from `look.ts`: the table's row is
    // then unheld, and that is reported rather than skipped.
    const withoutTint = lookNumbers().filter(
      (look) => !(look.dimension === "track" && look.value === "tint"),
    );
    const problems = checkRecipeNumbers(rows, withoutTint);
    expect(problems).toEqual([
      "docs/specs/theme-roles.md: `track` takes `tint`; packages/ui/lib/look.ts draws no look for it",
    ]);
  });

  test("fails when a row states no number, and names what the look then states alone", () => {
    const problems = checkRecipeNumbers(
      rows.map((row) =>
        row.dimension === "choice" && row.value === "inset" ? { ...row, numbers: "一条边" } : row,
      ),
      lookNumbers(),
    );
    expect(problems).toEqual([
      "docs/specs/theme-roles.md: `inset`'s recipe row states no number; packages/ui/lib/look.ts cannot be held to it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 1 for `inset`; the table does not state it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 4 for `inset`; the table does not state it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 14 for `inset`; the table does not state it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 10 for `inset`; the table does not state it",
      "docs/specs/theme-roles.md: packages/ui/lib/look.ts draws 20 for `inset`; the table does not state it",
    ]);
  });
});

describe("collectNumbers", () => {
  test("finds every number, once each, wherever in the parts it sits", () => {
    expect(
      collectNumbers({ a: 1, b: [2, { c: 3 }], d: "4", e: true, f: null, g: { h: [3, 5] } }),
    ).toEqual([1, 2, 3, 5]);
  });

  test("reads a look's numbers", () => {
    expect(numbersOf("handle", "circle")).toEqual([6, 8, 20, 32, 14, 128, 144]);
    expect(numbersOf("choice", "well")).toEqual([5, 7, 16, 22]);
  });
});
