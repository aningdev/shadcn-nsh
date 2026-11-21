import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { checkStyle, leaves, scaledRadii, semanticsWithStyle, styleOf, whitelists } from "./style";
import { tokenKinds, type ThemeCssVars } from "./tokens";

const theme = join(import.meta.dir, "../../packages/theme");
const read = (file: string) => JSON.parse(readFileSync(join(theme, file), "utf8"));

const reference = read("semantics.json") as Record<string, unknown>;
const cssVars = read("theme.json").cssVars as ThemeCssVars;
const kinds = tokenKinds(cssVars);

/** A deep copy of the default theme's semantics, for a test to damage. */
const copy = () => structuredClone(reference) as Record<string, any>;
const check = (file: Record<string, unknown>, tokenMap = kinds) =>
  checkStyle("fixture/semantics.json", file, reference, tokenMap);

describe("checkStyle", () => {
  test("the default theme is clean", () => {
    expect(check(copy())).toEqual([]);
  });

  test("names a key that was deleted", () => {
    const file = copy();
    delete file.motion.press.damping;
    const problems = check(file);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("motion.press.damping");
    expect(problems[0]).toContain("missing");
  });

  test("names a whole group that was deleted, key by key", () => {
    const file = copy();
    delete file.indicator;
    const problems = check(file);
    expect(
      problems
        .map((p) => p.match(/`([a-z.]+)`/)?.[1])
        .sort((a, b) => String(a).localeCompare(String(b))),
    ).toEqual(["indicator.field", "indicator.nav", "indicator.tabs"]);
  });

  test("names a key the default theme does not state", () => {
    const file = copy();
    file.state.glow = 1;
    expect(check(file).join("\n")).toContain("state.glow");
  });

  test("names an enum outside its list", () => {
    const file = copy();
    file.indicator.tabs = "rail";
    file.type.body.weight = "450";
    const problems = check(file).join("\n");
    expect(problems).toContain('indicator.tabs` is "rail"');
    expect(problems).toContain('type.body.weight` is "450"');
  });

  test("holds every whitelist to the value the default theme states", () => {
    const file = copy();
    const have = leaves(styleOf(file));
    for (const [pattern, allowed] of Object.entries(whitelists)) {
      const keys = [...have.keys()].filter((key) =>
        new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]+")}$`).test(key),
      );
      expect(keys.length, pattern).toBeGreaterThan(0);
      for (const key of keys) expect(allowed, key).toContain(have.get(key) as string | null);
    }
  });

  test("names a leaf of another type, a negative size, and pressScale outside (0, 1]", () => {
    const file = copy();
    file.focus.width = "3";
    file.stroke.hairline = -1;
    file.state.pressScale = 1.2;
    const problems = check(file).join("\n");
    expect(problems).toContain("focus.width");
    expect(problems).toContain("stroke.hairline");
    expect(problems).toContain("state.pressScale");
  });

  test("rejects literal numbers or wrong-kind tokens on shape radii", () => {
    const file = copy();
    file.shape.card = 16;
    file.shape.control = "{primary}";
    file.shape.inset = "{radius-missing}";
    const problems = check(file);
    expect(problems).toHaveLength(3);
    expect(problems.join("\n")).toContain("shape.card");
    expect(problems.join("\n")).toContain("not a dimension");
    expect(problems.join("\n")).toContain("radius-missing");
  });

  test("accepts null or a fontFamily `{token}` on type.family, rejects literals and wrong kinds", () => {
    const withSans = new Map(kinds);
    withSans.set("font-sans", "fontFamily");

    const ok = copy();
    ok.type.family = "{font-sans}";
    expect(check(ok, withSans)).toEqual([]);

    const literal = copy();
    literal.type.family = "sans";
    expect(check(literal, withSans)[0]).toContain("type.family");

    const wrongKind = copy();
    wrongKind.type.family = "{radius-card}";
    expect(check(wrongKind, withSans)[0]).toContain("not a fontFamily");

    const unknown = copy();
    unknown.type.family = "{font-display}";
    expect(check(unknown, withSans)[0]).toContain("font-display");
  });

  test("semanticsWithStyle preserves default style and updates pressScale", () => {
    const file = semanticsWithStyle(
      { pressScale: 1, finishes: { shared: {}, light: {}, dark: {} } },
      reference,
    );
    expect(check(file)).toEqual([]);
    expect((file.state as Record<string, unknown>).pressScale).toBe(1);
    expect((file.shape as Record<string, unknown>).dialog).toBe("{radius-dialog}");
  });
});

describe("scaledRadii", () => {
  test("derives the 0.8x / 1.4x scale from a base radius", () => {
    expect(scaledRadii(10)).toEqual({
      radius: "10px",
      "radius-control": "8px",
      "radius-field": "8px",
      "radius-chip": "10px",
      "radius-card": "14px",
      "radius-overlay": "10px",
      "radius-dialog": "14px",
      "radius-sheet": "14px",
    });
  });

  test("refuses a negative radius", () => {
    expect(() => scaledRadii(-1)).toThrow();
  });
});
