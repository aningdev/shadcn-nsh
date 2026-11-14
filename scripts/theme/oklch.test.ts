import { describe, expect, test } from "bun:test";

import { mixHex, oklch, over, parseColor, rgba } from "./oklch";

describe("oklch()", () => {
  test("converts the ends", () => {
    expect(oklch("oklch(0 0 0)")).toBe("#000000");
    expect(oklch("oklch(1 0 0)")).toBe("#ffffff");
  });

  test("lands on Tailwind's greys, which shadcn's neutrals are", () => {
    expect(oklch("oklch(0.145 0 0)")).toBe("#0a0a0a"); // neutral-950
    expect(oklch("oklch(0.205 0 0)")).toBe("#171717"); // neutral-900
    expect(oklch("oklch(0.269 0 0)")).toBe("#262626"); // neutral-800
    expect(oklch("oklch(0.371 0 0)")).toBe("#404040"); // neutral-700
    expect(oklch("oklch(0.439 0 0)")).toBe("#525252"); // neutral-600
    expect(oklch("oklch(0.556 0 0)")).toBe("#737373"); // neutral-500
    expect(oklch("oklch(0.708 0 0)")).toBe("#a1a1a1"); // neutral-400
    expect(oklch("oklch(0.87 0 0)")).toBe("#d4d4d4"); // neutral-300
    expect(oklch("oklch(0.922 0 0)")).toBe("#e5e5e5"); // neutral-200
    expect(oklch("oklch(0.97 0 0)")).toBe("#f5f5f5"); // neutral-100
    expect(oklch("oklch(0.985 0 0)")).toBe("#fafafa"); // neutral-50
  });

  test("keeps a hue", () => {
    expect(oklch("oklch(0.577 0.245 27.325)")).toBe("#e7000b"); // red-600
    expect(oklch("oklch(0.704 0.191 22.216)")).toBe("#ff6467"); // red-400
  });

  test("writes a translucent color as rgba()", () => {
    expect(oklch("oklch(1 0 0 / 10%)")).toBe("rgba(255,255,255,0.1)");
    expect(oklch("oklch(1 0 0 / 15%)")).toBe("rgba(255,255,255,0.15)");
    expect(oklch("oklch(1 0 0 / 0.5)")).toBe("rgba(255,255,255,0.5)");
  });

  test("refuses what is not oklch()", () => {
    expect(() => oklch("#fff")).toThrow();
  });
});

describe("parseColor()", () => {
  test("reads hex and rgba", () => {
    expect(parseColor("#171717")).toEqual({ r: 23, g: 23, b: 23 });
    expect(parseColor("rgba(255,255,255,0.15)")).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 0.15,
    });
    expect(() => parseColor("red")).toThrow();
  });
});

describe("over()", () => {
  test("composites a translucent color on an opaque one", () => {
    // shadcn's `dark:bg-input/30`: 15% white over the card.
    expect(over("rgba(255,255,255,0.15)", "#171717")).toBe("#3a3a3a");
    expect(over("rgba(255,255,255,0.1)", "#171717")).toBe("#2e2e2e");
  });
});

describe("mixHex()", () => {
  test("steps half way, rounded", () => {
    expect(mixHex("#f5f5f5", "#e5e5e5", 0.5)).toBe("#ededed");
    expect(mixHex("#262626", "#3a3a3a", 0.5)).toBe("#303030");
    expect(() => mixHex("rgba(0,0,0,0.5)", "#fff", 0.5)).toThrow();
  });
});

describe("rgba()", () => {
  test("takes a hex color to an alpha", () => {
    expect(rgba("#171717", 0.8)).toBe("rgba(23,23,23,0.8)");
  });
});
