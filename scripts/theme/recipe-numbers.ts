/**
 * The recipe numbers, checked against the spec's table. `docs/specs/theme-roles.md`'s
 * "维度配方的数字" is the one list of a form's own numbers (`docs/specs/theme-contract-v2.md`
 * §11.3), and `packages/ui/lib/look.ts` is the one place they are drawn out: this module holds the two
 * together, both ways — every number the table states is one a look draws, and every number a look
 * draws is one the table states.
 *
 * A scale's number is neither's: the table names the scale, the look names the key, and neither
 * repeats the theme's value.
 *
 * Pure: no `node:fs`, so the lint and its unit test both read it.
 */
import {
  choiceLook,
  fieldLook,
  groupLook,
  handleLook,
  selectionLook,
  trackLook,
} from "../../packages/ui/lib/look";
import type { ControlDimension } from "../tokens/types";
import type { RecipeRow } from "./spec";
import { controlDimensionValues } from "./style";

/** The numbers one dimension value's look states, and the value it is. */
export interface LookNumbers {
  /** The dimension the value belongs to: `track`. */
  readonly dimension: ControlDimension;
  /** The value: `tint`. */
  readonly value: string;
  /** Every number the look states, once each. */
  readonly numbers: readonly number[];
}

/** Every number a look states, wherever it sits in the look's parts. */
export function collectNumbers(part: unknown): number[] {
  const found = new Set<number>();
  const walk = (at: unknown): void => {
    if (typeof at === "number") found.add(at);
    else if (Array.isArray(at)) for (const item of at) walk(item);
    else if (at !== null && typeof at === "object") {
      for (const item of Object.values(at)) walk(item);
    }
  };
  walk(part);
  return [...found];
}

/** Every look's numbers: each dimension, every value it takes. */
export function lookNumbers(): LookNumbers[] {
  return [
    ...numbersOf("selection", selectionLook, controlDimensionValues.selection),
    ...numbersOf("field", fieldLook, controlDimensionValues.field),
    ...numbersOf("choice", choiceLook, controlDimensionValues.choice),
    ...numbersOf("track", trackLook, controlDimensionValues.track),
    ...numbersOf("handle", handleLook, controlDimensionValues.handle),
    ...numbersOf("group", groupLook, controlDimensionValues.group),
  ];
}

/** Every number the table and the looks disagree on, in both directions. */
export function checkRecipeNumbers(
  rows: readonly RecipeRow[],
  looks: readonly LookNumbers[],
): string[] {
  const stated = new Map(looks.map((look) => [key(look), look.numbers]));
  const recorded = new Map(rows.map((row) => [key(row), row]));
  const problems: string[] = [];
  for (const row of rows) {
    const numbers = stated.get(key(row));
    if (numbers === undefined) {
      problems.push(
        `docs/specs/theme-roles.md: \`${row.dimension}\` takes \`${row.value}\`; packages/ui/lib/look.ts draws no look for it`,
      );
      continue;
    }
    const cell = numbersInCell(row.numbers);
    if (cell.length === 0) {
      problems.push(
        `docs/specs/theme-roles.md: \`${row.value}\`'s recipe row states no number; packages/ui/lib/look.ts cannot be held to it`,
      );
    }
    for (const number of cell) {
      if (!numbers.includes(number)) {
        problems.push(
          `docs/specs/theme-roles.md: \`${row.value}\` states ${number}; packages/ui/lib/look.ts does not draw it`,
        );
      }
    }
  }
  for (const look of looks) {
    const row = recorded.get(key(look));
    const cell = row === undefined ? [] : numbersInCell(row.numbers);
    for (const number of look.numbers) {
      if (cell.includes(number)) continue;
      problems.push(
        row === undefined
          ? `docs/specs/theme-roles.md: packages/ui/lib/look.ts draws ${number} for \`${look.value}\`; the recipe table has no row for it`
          : `docs/specs/theme-roles.md: packages/ui/lib/look.ts draws ${number} for \`${look.value}\`; the table does not state it`,
      );
    }
  }
  return problems;
}

/** A dimension and value, as a key both the table's rows and the looks have. */
function key(part: { readonly dimension: string; readonly value: string }): string {
  return `${part.dimension}.${part.value}`;
}

/** One dimension's looks, each over the values `controlDimensionValues` states for it. */
function numbersOf<V extends string, L>(
  dimension: ControlDimension,
  look: (value: V) => L,
  values: readonly string[],
): LookNumbers[] {
  return values.map((value) => ({
    dimension,
    value,
    // The values are the spec's own enum table (`controlDimensionValues`), which `theme-lint` holds
    // the themes to: each one is a value the look takes.
    numbers: collectNumbers(look(value as V)),
  }));
}

/** The numbers a recipe row's 数字 cell states, in order, once each. */
function numbersInCell(cell: string): number[] {
  return [...new Set((cell.match(/\d+(?:\.\d+)?/g) ?? []).map(Number))];
}
