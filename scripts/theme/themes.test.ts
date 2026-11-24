import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { toOklchText } from "./oklch";
import { mergeFinishes, type SplitFinishes } from "./tokens";

const theme = join(import.meta.dir, "../../packages/theme");
const read = (file: string) => JSON.parse(readFileSync(join(theme, file), "utf8")) as unknown;

type Vars = Record<string, string>;
type ThemeFile = { cssVars: { theme: Vars; light: Vars; dark: Vars } };
type Finish = { [key: string]: unknown; shadow?: string };
type SemanticsFile = {
  state: { "press-scale": number };
  finishes: SplitFinishes<Finish>;
};

const root = read("theme.json") as ThemeFile;
const rootSemantics = read("semantics.json") as SemanticsFile;
const rootMerged = {
  light: mergeFinishes(rootSemantics.finishes, "light"),
  dark: mergeFinishes(rootSemantics.finishes, "dark"),
};

/** The alternative themes: a directory each, holding the two files of the same shape. */
const alternatives = readdirSync(join(theme, "themes"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "native")
  .map((entry) => entry.name);

const sorted = (value: object) => Object.keys(value).sort();
/** Every token a theme declares: the sets are equal: no token is optional. */
const requiredThemeKeys = (vars: Vars) => Object.keys(vars).sort();

/** Every string a theme file holds, at any depth (a gradient's stops and a shadow's colors are in one). */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** The two files of every theme, and the names they are reported under. */
const themeFiles = [
  ...["theme.json", "semantics.json"].map((name) => ({ name, value: read(name) })),
  ...alternatives.flatMap((name) =>
    ["theme.json", "semantics.json"].map((file) => ({
      name: `themes/${name}/${file}`,
      value: read(`themes/${name}/${file}`),
    })),
  ),
];

describe("themes/", () => {
  test("there is one to check", () => {
    expect(alternatives.length).toBeGreaterThan(0);
  });

  for (const name of alternatives) {
    describe(name, () => {
      const themeFile = read(`themes/${name}/theme.json`) as ThemeFile;
      const semantics = read(`themes/${name}/semantics.json`) as SemanticsFile;

      test("declares the build-time theme's keys, and no others", () => {
        expect(requiredThemeKeys(themeFile.cssVars.theme), "theme").toEqual(
          requiredThemeKeys(root.cssVars.theme),
        );
        for (const section of ["light", "dark"] as const) {
          expect(sorted(themeFile.cssVars[section]), section).toEqual(
            sorted(root.cssVars[section]),
          );
        }
      });

      test("resolves to the build-time finishes' roles and field sets after merging", () => {
        // A flat theme leaves out the gradient, a theme of no platform material the material,
        // an opaque one the backdropFilter, only the platform's own layers an elevation, only a theme
        // that paints its own pressed accent the pressed fill and ink, and only a knob the checked
        // state it states: every other field of a role is the set the build-time theme states.
        const optional = new Set([
          "gradient",
          "material",
          "elevation",
          "backdropFilter",
          "pressed-background",
          "pressed-foreground",
          "checked-background",
          "checked-border-color",
          "checked-gradient",
        ]);
        const requiredFields = (finish: Record<string, unknown>) =>
          sorted(Object.keys(finish).filter((field) => !optional.has(field)));
        for (const appearance of ["light", "dark"] as const) {
          const merged = mergeFinishes(semantics.finishes, appearance);
          expect(sorted(merged), appearance).toEqual(sorted(rootMerged[appearance]));
          for (const [role, finish] of Object.entries(merged)) {
            expect(requiredFields(finish), `${appearance}.${role}`).toEqual(
              requiredFields(rootMerged[appearance][role]!),
            );
          }
        }
      });

      test("says how far a press sinks, in both appearances", () => {
        expect(typeof semantics.state["press-scale"]).toBe("number");
        expect(semantics.state["press-scale"]).toBeGreaterThan(0);
        expect(semantics.state["press-scale"]).toBeLessThanOrEqual(1);
      });

      test("gives every token and every merged finish a value", () => {
        for (const section of ["theme", "light", "dark"] as const) {
          for (const [key, value] of Object.entries(themeFile.cssVars[section])) {
            expect(typeof value, `${section}.${key}`).toBe("string");
            expect(value.length, `${section}.${key}`).toBeGreaterThan(0);
          }
        }
        for (const appearance of ["light", "dark"] as const) {
          for (const [role, finish] of Object.entries(
            mergeFinishes(semantics.finishes, appearance),
          )) {
            expect(typeof finish, `${appearance}.${role}`).toBe("object");
            expect(typeof finish.shadow, `${appearance}.${role}.shadow`).toBe("string");
          }
        }
      });
    });
  }
});

describe("the NSH Gallery theme", () => {
  test("says how far a press sinks, and says it as the scale a control lands on", () => {
    expect(rootSemantics.state["press-scale"]).toBe(0.97);
  });

  test("its files under themes/nsh-gallery/ are the build-time ones, byte for byte", () => {
    for (const name of ["theme.json", "semantics.json", "light.tokens.json", "dark.tokens.json"]) {
      expect(readFileSync(join(theme, `themes/nsh-gallery/${name}`), "utf8"), name).toBe(
        readFileSync(join(theme, name), "utf8"),
      );
    }
  });
});

describe("colors", () => {
  for (const { name, value } of themeFiles) {
    test(`${name}: every color is oklch()`, () => {
      const colors = strings(value).filter((text) => /oklch\(/.test(text));
      expect(colors.length, "a theme writes colors").toBeGreaterThan(0);
      for (const text of strings(value)) {
        expect(toOklchText(text), `${name}: ${text}`).toBe(text);
        expect(text, name).not.toMatch(/#[0-9a-f]{3,8}\b/i);
        expect(text, name).not.toMatch(/\b(?:rgba?|hsla?|oklab|lab|lch|color)\(/i);
      }
    });
  }
});
