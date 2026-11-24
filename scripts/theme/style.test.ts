import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkScales,
  checkStyle,
  checkTiers,
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
    delete file.motion.default.duration;
    const problems = check(file);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("motion.default.duration");
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
    const problems = check(file).join("\n");
    expect(problems).toContain('shape.curve` is "squircle"');
    expect(problems).toContain("typography.body.fontWeight` is 450");
  });

  test("names a control dimension outside its list", () => {
    const file = copy();
    file.dimension.control.field = "swatch";
    file.dimension.control.track = "row";
    const problems = check(file).join("\n");
    expect(problems).toContain('dimension.control.field` is "swatch"');
    expect(problems).toContain('dimension.control.track` is "row"');
  });

  test("holds every whitelist to the value the default theme states", () => {
    const file = copy();
    const have = leaves(styleOf(file));
    for (const [pattern, allowed] of Object.entries(whitelists)) {
      const keys = [...have.keys()].filter((key) =>
        new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]+")}$`).test(key),
      );
      expect(keys.length, pattern).toBeGreaterThan(0);
      for (const key of keys) {
        const value = have.get(key);
        if (typeof value === "string" || typeof value === "number")
          expect(allowed, key).toContain(value);
      }
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

  test("accepts double focus style and timing motion roles, rejecting invalid shapes and timingFunctions", () => {
    const ok = copy();
    ok.dimension.focus.style = "double";
    ok.motion.fast = { duration: 150, timingFunction: "emphasized-decelerate" };
    ok.motion.default = { duration: 167, timingFunction: "decelerate" };
    ok.transition.enter = { duration: 250, timingFunction: "point-to-point" };
    expect(check(ok)).toEqual([]);

    for (const timingFunction of easingNames) {
      const withEasing = copy();
      withEasing.motion.slow = { duration: 200, timingFunction };
      withEasing.transition.enter.timingFunction = timingFunction;
      expect(check(withEasing), timingFunction).toEqual([]);
    }

    const spring = copy();
    spring.motion.fast = { stiffness: 300, damping: 30, duration: 150, timingFunction: "standard" };
    expect(check(spring).join("\n")).toContain("motion.fast.stiffness");

    const badTiming = copy();
    badTiming.motion.fast = { duration: -10, timingFunction: "unknown-curve" };
    const timingProblems = check(badTiming).join("\n");
    expect(timingProblems).toContain("motion.fast.duration");
    expect(timingProblems).toContain("motion.fast.timingFunction");

    const missingTimingField = copy();
    missingTimingField.motion.default = { duration: 200 };
    expect(check(missingTimingField).join("\n")).toContain("motion.default.timingFunction");
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

describe("checkTiers", () => {
  test("the default theme states both tiers everywhere", () => {
    expect(checkTiers("semantics.json", copy())).toEqual([]);
  });

  test("names a size stated at one tier and not the other", () => {
    const file = copy();
    delete file.dimension.size.hit.pointer;
    expect(checkTiers("semantics.json", file)).toEqual([
      "semantics.json: `dimension.size.hit` states a touch size and no pointer one",
    ]);
  });

  test("names a key one tier has and the other does not", () => {
    const file = copy();
    delete file.dimension.size.control.touch.padding;
    expect(checkTiers("semantics.json", file)).toContain(
      "semantics.json: `dimension.size.control.pointer.padding` has no touch size",
    );
  });
});

describe("checkScales", () => {
  test("a touch target under 44 points fails unless the theme cites it", () => {
    const file = copy();
    file.dimension.size.hit = { pointer: 0, touch: 40 };
    expect(checkScales("semantics.json", file)).toContain(
      "semantics.json: `dimension.size.hit.touch` is 40, below the 44-point touch target",
    );
    const cited = { "dimension.size.hit.touch": "Windows touch target 40x40 epx" };
    expect(checkScales("semantics.json", file, cited)).toEqual([]);
  });
});
