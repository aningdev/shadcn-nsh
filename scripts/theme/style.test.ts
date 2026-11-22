import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkStyle,
  easingNames,
  leaves,
  scaledRadii,
  semanticsWithStyle,
  styleOf,
  whitelists,
} from "./style";
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
    delete file.transition;
    const problems = check(file);
    expect(
      problems
        .map((p) => p.match(/`([A-Za-z.]+)`/)?.[1])
        .sort((a, b) => String(a).localeCompare(String(b))),
    ).toEqual(["transition.enter.duration", "transition.enter.timingFunction"]);
  });

  test("names a key the default theme does not state", () => {
    const file = copy();
    file.state.glow = 1;
    expect(check(file).join("\n")).toContain("state.glow");
  });

  test("names an enum outside its list", () => {
    const file = copy();
    file.shape.curve = "squircle";
    file.typography.body.fontWeight = 450;
    file.controls = "cupertin";
    const problems = check(file).join("\n");
    expect(problems).toContain('shape.curve` is "squircle"');
    expect(problems).toContain("typography.body.fontWeight` is 450");
    expect(problems).toContain('controls` is "cupertin"');
  });

  test("holds every whitelist to the value the default theme states", () => {
    const file = copy();
    const have = leaves(styleOf(file));
    for (const [pattern, allowed] of Object.entries(whitelists)) {
      const keys = [...have.keys()].filter((key) =>
        new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]+")}$`).test(key),
      );
      expect(keys.length, pattern).toBeGreaterThan(0);
      for (const key of keys)
        expect(allowed, key).toContain(have.get(key) as string | number | null);
    }
  });

  test("names a leaf of another type, a negative size, and press-scale outside (0, 1]", () => {
    const file = copy();
    file.dimension.focus.width = "3";
    file.dimension.stroke.hairline = -1;
    file.state["press-scale"] = 1.2;
    const problems = check(file).join("\n");
    expect(problems).toContain("dimension.focus.width");
    expect(problems).toContain("dimension.stroke.hairline");
    expect(problems).toContain("state.press-scale");
  });

  test("rejects literal numbers or wrong-kind tokens on shape radii", () => {
    const file = copy();
    file.dimension.shape.container = 16;
    file.dimension.shape.control = "{primary}";
    file.dimension.shape.modal = "{radius-missing}";
    const problems = check(file);
    expect(problems).toHaveLength(3);
    expect(problems.join("\n")).toContain("dimension.shape.container");
    expect(problems.join("\n")).toContain("not a dimension");
    expect(problems.join("\n")).toContain("radius-missing");
  });

  test("accepts null or a fontFamily `{token}` on typography.fontFamily, rejects literals and wrong kinds", () => {
    const withSans = new Map(kinds);
    withSans.set("font-sans", "fontFamily");

    const ok = copy();
    ok.typography.fontFamily = "{font-sans}";
    expect(check(ok, withSans)).toEqual([]);

    const literal = copy();
    literal.typography.fontFamily = "sans";
    expect(check(literal, withSans)[0]).toContain("typography.fontFamily");

    const wrongKind = copy();
    wrongKind.typography.fontFamily = "{radius-container}";
    expect(check(wrongKind, withSans)[0]).toContain("not a fontFamily");

    const unknown = copy();
    unknown.typography.fontFamily = "{font-display}";
    expect(check(unknown, withSans)[0]).toContain("font-display");
  });

  test("accepts double focus style and timing motion roles, rejecting invalid shapes and timingFunctions", () => {
    const ok = copy();
    ok.dimension.focus.style = "double";
    ok.motion.press = { duration: 150, timingFunction: "emphasized-decelerate" };
    ok.motion.control = { duration: 167, timingFunction: "decelerate" };
    ok.transition.enter = { duration: 250, timingFunction: "point-to-point" };
    expect(check(ok)).toEqual([]);

    for (const timingFunction of easingNames) {
      const withEasing = copy();
      withEasing.motion.move = { duration: 200, timingFunction };
      withEasing.transition.enter.timingFunction = timingFunction;
      expect(check(withEasing), timingFunction).toEqual([]);
    }

    const mixed = copy();
    mixed.motion.press = { stiffness: 300, duration: 150 };
    expect(check(mixed).join("\n")).toContain("mixes spring keys");

    const badTiming = copy();
    badTiming.motion.press = { duration: -10, timingFunction: "unknown-curve" };
    const timingProblems = check(badTiming).join("\n");
    expect(timingProblems).toContain("motion.press.duration");
    expect(timingProblems).toContain("motion.press.timingFunction");

    const missingTimingField = copy();
    missingTimingField.motion.settle = { duration: 200 };
    expect(check(missingTimingField).join("\n")).toContain("motion.settle.timingFunction");
  });

  test("semanticsWithStyle preserves default style and updates press-scale", () => {
    const file = semanticsWithStyle(
      { "press-scale": 1, finishes: { shared: {}, light: {}, dark: {} } },
      reference,
    );
    expect(check(file)).toEqual([]);
    expect((file.state as Record<string, unknown>)["press-scale"]).toBe(1);
    expect(((file.dimension as Record<string, any>).shape as Record<string, unknown>).modal).toBe(
      "{radius-modal}",
    );
  });
});

describe("scaledRadii", () => {
  test("emits the four radius tokens for control, container, modal, and A-layer radius", () => {
    expect(scaledRadii({ control: 8, container: 12, modal: 14 })).toEqual({
      radius: "8px",
      "radius-control": "8px",
      "radius-container": "12px",
      "radius-modal": "14px",
    });
  });

  test("refuses a negative radius", () => {
    expect(() => scaledRadii({ control: -1, container: 12, modal: 14 })).toThrow();
  });
});
