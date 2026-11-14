import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const theme = join(import.meta.dir, "../../packages/theme");
const read = (file: string) => JSON.parse(readFileSync(join(theme, file), "utf8")) as unknown;

type Vars = Record<string, string>;
type ThemeFile = { cssVars: { theme: Vars; light: Vars; dark: Vars } };
type Finish = { boxShadow?: string };
type FinishesFile = { light: Record<string, Finish>; dark: Record<string, Finish> };

const defaults = read("theme.json") as ThemeFile;
const defaultFinishes = read("finishes.json") as FinishesFile;

/** The alternative themes: a directory each, holding the two files of the same shape. */
const alternatives = readdirSync(join(theme, "themes"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const sorted = (value: object) => Object.keys(value).sort();

describe("themes/", () => {
  test("there is one to check", () => {
    expect(alternatives.length).toBeGreaterThan(0);
  });

  for (const name of alternatives) {
    describe(name, () => {
      const themeFile = read(`themes/${name}/theme.json`) as ThemeFile;
      const finishes = read(`themes/${name}/finishes.json`) as FinishesFile;

      test("declares the default theme's keys, and no others", () => {
        for (const section of ["theme", "light", "dark"] as const) {
          expect(sorted(themeFile.cssVars[section]), section).toEqual(
            sorted(defaults.cssVars[section]),
          );
        }
      });

      test("declares the default finishes' roles, and no others", () => {
        for (const appearance of ["light", "dark"] as const) {
          expect(sorted(finishes[appearance]), appearance).toEqual(
            sorted(defaultFinishes[appearance]),
          );
        }
      });

      test("gives every token and every finish a value", () => {
        for (const section of ["theme", "light", "dark"] as const) {
          for (const [key, value] of Object.entries(themeFile.cssVars[section])) {
            expect(typeof value, `${section}.${key}`).toBe("string");
            expect(value.length, `${section}.${key}`).toBeGreaterThan(0);
          }
        }
        for (const appearance of ["light", "dark"] as const) {
          for (const [role, finish] of Object.entries(finishes[appearance])) {
            expect(typeof finish, `${appearance}.${role}`).toBe("object");
            expect(typeof finish.boxShadow, `${appearance}.${role}.boxShadow`).toBe("string");
          }
        }
      });
    });
  }
});
