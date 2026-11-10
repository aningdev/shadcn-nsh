import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

/**
 * Guards over the component sources. Every color a component draws comes from the theme
 * (`colors.*`, `finish`, `alpha()`, `mix()`), so the appearance follows light and dark and a
 * theme change reaches every control. A color written out, or a token's value spliced into a
 * class string, would not. `"transparent"` is not a color (R5 allows it as a layout literal).
 *
 * `scripts/recipes-allowlist.json` is the one list of components still exempt from a rule. It
 * only shrinks: an entry whose file no longer breaks the rule fails, so it gets removed.
 */

const root = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

const allowlist = JSON.parse(read("scripts/recipes-allowlist.json")) as Record<string, string[]>;

/** The sources the guards read: the components and the theme's helpers. */
const sources = [
  ...readdirSync(new URL("packages/ui/", root))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => `packages/ui/${file}`),
  "packages/theme/theme.ts",
];

/** A source with its comments removed, so prose about a color is not a color. */
const code = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1");

const rules: Record<string, RegExp[]> = {
  "colour-literals": [
    /#[0-9a-fA-F]{3,8}\b/,
    /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/,
    /"(?:white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)"/,
    /color-mix\([^)]*\b(?:black|white)\b/,
  ],
};

const breaks = (path: string, patterns: RegExp[]) => patterns.some((p) => p.test(code(path)));

describe("component sources", () => {
  for (const [rule, patterns] of Object.entries(rules)) {
    const exempt = allowlist[rule] ?? [];

    test(`${rule}: no source breaks it unless it is on the allowlist`, () => {
      const offenders = sources.filter((path) => breaks(path, patterns));
      const unexpected = offenders.filter((path) => !exempt.some((name) => path.endsWith(name)));
      expect(unexpected, `${rule} in ${unexpected.join(", ")}`).toEqual([]);
    });

    test(`${rule}: every allowlist entry still breaks it`, () => {
      const stale = exempt.filter((name) =>
        sources.every((path) => !path.endsWith(name) || !breaks(path, patterns)),
      );
      expect(stale, `remove from the allowlist: ${stale.join(", ")}`).toEqual([]);
    });
  }

  test("the guard catches a color literal", () => {
    const sample = 'const style = { backgroundColor: "#ffffff", color: "rgba(0, 0, 0, 0.5)" };';
    expect(rules["colour-literals"].some((p) => p.test(sample))).toBe(true);
    expect(rules["colour-literals"].some((p) => p.test('{ backgroundColor: "transparent" }'))).toBe(
      false,
    );
  });
});
