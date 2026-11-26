/**
 * The enumerated values a theme's style may name, read from the one list the spec states
 * (`docs/specs/theme-roles.md`, `<!-- theme-lint: enums -->`, `docs/specs/theme-contract-v2.md` §14).
 *
 * The doc is the list: the source-stage DTCG linter and the compiled `semantics.json` check both
 * take their allowed values from here, so a value name is stated in the spec and nowhere else. A
 * row the doc adds is a value a theme may then take; a row it drops stops being legal.
 */
import fs from "node:fs";
import path from "node:path";

import { specEnums, type EnumRow } from "./spec";

const SPEC = path.resolve(import.meta.dir, "..", "..", "docs/specs/theme-roles.md");

/** The spec's enum table: every key a theme's style may enumerate, and the values it takes. */
export const enumRows: EnumRow[] = specEnums(fs.readFileSync(SPEC, "utf8"));

const row = (key: string): EnumRow => {
  const found = enumRows.find((entry) => entry.key === key);
  if (!found)
    throw new Error(
      `docs/specs/theme-roles.md: the enum table states no \`${key}\` row, which the theme contract needs`,
    );
  return found;
};

/** A row's values, numbers where the spec writes numbers: `typography.*.fontWeight` takes 400, not "400". */
const valuesOf = (key: string): readonly (string | number)[] =>
  row(key).values.map((value) => (/^\d+$/.test(value) ? Number(value) : value));

/** A row's values that are names, whatever they spell: the easing names, or a dimension's. */
const namesOf = (key: string): readonly string[] => row(key).values;

/** Every easing name a theme may name in a timing `motion.<role>`. */
export const easingNames: readonly string[] = namesOf("motion.*.timingFunction");

/** One theme's values that must come from a list: the path of the key, and the values it may take. */
export const whitelists: Record<string, readonly (string | number)[]> = Object.fromEntries(
  enumRows.map((entry) => [entry.key, valuesOf(entry.key)]),
);
