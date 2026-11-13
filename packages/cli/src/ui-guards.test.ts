import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

/**
 * Guards over the component sources. Every color a component draws comes from the theme
 * (`colors.*`, `finish`, `alpha()`, `mix()`), so the appearance follows light and dark and a
 * theme change reaches every control. A color written out, or a token's value spliced into a
 * class string, would not. `"transparent"` is not a color (R5 allows it as a layout literal).
 *
 * No component is exempt: every one is on the reference look, so a rule broken by any source
 * fails.
 *
 */

const root = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

/** The sources the guards read: the components and the theme's helpers. */
const sources = readdirSync(new URL("packages/ui/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `packages/ui/${file}`);

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

const breaks = (path: string, patterns: RegExp[], read = code) =>
  patterns.some((p) => p.test(read(path)));

/** Strip `// @port …` … `// @port end` regions: colour there is upstream's, not the shell's. */
const shellCode = (path: string) =>
  code(path).replace(/\/\/ @port [^\n]*\n[\s\S]*?\/\/ @port end/g, "");

/** Ported components (one file each); lib helpers are vendor-only. */
const portedShells = readdirSync(new URL("packages/ui/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `packages/ui/${file}`);

describe("component sources", () => {
  for (const [rule, patterns] of Object.entries(rules)) {
    test(`${rule}: no source breaks it`, () => {
      const offenders = sources.filter(
        (path) =>
          !["packages/ui/avatar.tsx", "packages/ui/color-picker.tsx"].includes(path) &&
          breaks(path, patterns, shellCode),
      );
      expect(offenders, `${rule} in ${offenders.join(", ")}`).toEqual([]);
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

describe("ported shells (packages/ui)", () => {
  test("colour-literals: no shell outside a port region breaks it", () => {
    const offenders = portedShells.filter(
      (path) =>
        !["packages/ui/avatar.tsx", "packages/ui/color-picker.tsx"].includes(path) &&
        rules["colour-literals"].some((p) => p.test(shellCode(path))),
    );
    expect(offenders, `colour-literals in ${offenders.join(", ")}`).toEqual([]);
  });

  test("a demo draws no color of its own either", () => {
    // The demos are our pages too: their chrome is the theme's (through `ui()`), and a `ref.tsx`
    // is a page as well — only the *conversion* from `colors` to `ui()` is limited to the demos
    // (a reference page mirrors upstream's code). A color-picker demo is exempt for the reason its
    // component is: the swatches and the chosen colors are the user's content, not a look.
    const demos = readdirSync(new URL("apps/docs/demos/", root))
      .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
      .map((file) => `apps/docs/demos/${file}`)
      .filter(
        (path) => !path.endsWith("/color-picker.tsx") && !path.endsWith("/color-picker.ref.tsx"),
      );
    const offenders = demos.filter((path) =>
      rules["colour-literals"].some((p) => p.test(shellCode(path))),
    );
    expect(offenders, `colour-literals in ${offenders.join(", ")}`).toEqual([]);
  });

  test("the demo adapter draws no color of its own either", () => {
    // `stage.tsx` and `kit.tsx` are the demos' own chrome (not a component): a demo reads the
    // theme through them, so a color written out there would sit outside the theme as well.
    const adapter = ["apps/docs/demos/stage.tsx", "apps/docs/demos/kit.tsx"];
    const offenders = adapter.filter((path) =>
      rules["colour-literals"].some((p) => p.test(shellCode(path))),
    );
    expect(offenders, `colour-literals in ${offenders.join(", ")}`).toEqual([]);
  });

  test("the region strip leaves shell code for the guard to see", () => {
    const sample = `// @port look/x.ts\nconst a = "#fff";\n// @port end\nconst b = "#000";`;
    const stripped = sample.replace(/\/\/ @port [^\n]*\n[\s\S]*?\/\/ @port end/g, "");
    expect(rules["colour-literals"].some((p) => p.test(stripped))).toBe(true);
    expect(stripped.includes("#fff")).toBe(false);
  });
});
