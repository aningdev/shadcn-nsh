import { describe, expect, test } from "bun:test";

import {
  css,
  mix,
  oklch,
  oklchColor,
  oklchText,
  over,
  parseColor,
  rgbToOklch,
  toOklchText,
  withAlpha,
} from "./oklch";

/** A color as sRGB writes it: what a converted value must land back on. */
const at = (value: string) => css(parseColor(value));

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

describe("oklchText()", () => {
  test("writes the themes' colors, as the greys shadcn names them", () => {
    expect(oklchText({ r: 0, g: 0, b: 0 })).toBe("oklch(0 0 0)");
    expect(oklchText({ r: 255, g: 255, b: 255 })).toBe("oklch(1 0 0)");
    expect(oklchText({ r: 23, g: 23, b: 23 })).toBe("oklch(0.20463 0 0)");
    expect(oklchText({ r: 255, g: 255, b: 255, a: 0.1 })).toBe("oklch(1 0 0 / 0.1)");
  });

  test("round-trips every sRGB color an 8-bit channel can hold", () => {
    const back = (color: { r: number; g: number; b: number }) =>
      expect(at(oklchText(color))).toBe(css(color));
    for (let value = 0; value < 256; value += 1) {
      back({ r: value, g: value, b: value });
      back({ r: value, g: 0, b: 255 - value });
    }
    // A sweep of the cube, every 3rd level: the whole of it was checked when the precision was
    // picked (16.7M colors, no channel of any moving), a slice keeps the test quick.
    for (let r = 0; r < 256; r += 3) {
      for (let g = 0; g < 256; g += 3) {
        for (let b = 0; b < 256; b += 3) back({ r, g, b });
      }
    }
  });

  test("keeps a color's alpha to a byte", () => {
    for (let value = 0; value < 256; value += 1) {
      const a = value / 255;
      expect(Math.round((parseColor(oklchText({ r: 1, g: 2, b: 3, a })).a ?? 1) * 255)).toBe(value);
    }
  });
});

describe("rgbToOklch()", () => {
  test("reads a grey as chromaless", () => {
    expect(rgbToOklch({ r: 128, g: 128, b: 128 }).c).toBeLessThan(1e-6);
    expect(rgbToOklch({ r: 128, g: 128, b: 128 }).h).toBe(0);
  });

  test("keeps a hue in the circle", () => {
    const { c, h } = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(c).toBeGreaterThan(0.2);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });
});

describe("parseColor()", () => {
  test("reads hex, in every length", () => {
    expect(parseColor("#171717")).toEqual({ r: 23, g: 23, b: 23 });
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor("#fff8")).toEqual({ r: 255, g: 255, b: 255, a: 136 / 255 });
    expect(parseColor("#171717cc")).toEqual({ r: 23, g: 23, b: 23, a: 204 / 255 });
  });

  test("reads rgb() and rgba(), comma or space separated", () => {
    expect(parseColor("rgba(255,255,255,0.15)")).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 0.15,
    });
    expect(parseColor("rgb(0 0 0 / 5%)")).toEqual({ r: 0, g: 0, b: 0, a: 0.05 });
    expect(parseColor("rgba(0,0,0,0.45)")).toEqual({ r: 0, g: 0, b: 0, a: 0.45 });
    expect(parseColor("rgb(50% 0% 0%)")).toEqual({ r: 128, g: 0, b: 0 });
  });

  test("reads oklch(), which is what the theme files hold", () => {
    expect(parseColor("oklch(0.145 0 0)")).toEqual({ r: 10, g: 10, b: 10 });
    expect(parseColor("oklch(1 0 0 / 15%)")).toEqual({ r: 255, g: 255, b: 255, a: 0.15 });
    expect(parseColor("oklch(62.3% 0 0)")).toEqual({ r: 135, g: 135, b: 135 });
  });

  test("reads the names a theme may write", () => {
    expect(parseColor("white")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor("transparent")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(() => parseColor("rebeccapurple")).toThrow();
  });

  test("refuses what is not a color", () => {
    expect(() => parseColor("var(--foreground)")).toThrow();
    expect(() => parseColor("none")).toThrow();
    expect(() => parseColor("#fffff")).toThrow();
  });
});

describe("toOklchText()", () => {
  test("converts a token, a gradient, a shadow and a color-mix()", () => {
    expect(toOklchText("#ffffff")).toBe("oklch(1 0 0)");
    expect(toOklchText("linear-gradient(180deg, #a2d33c 0%, #8fc21f 100%)")).toBe(
      "linear-gradient(180deg, oklch(0.80472 0.1815 126.061) 0%, oklch(0.75073 0.18465 126.794) 100%)",
    );
    expect(toOklchText("inset 0 1px 1px rgba(10,15,25,0.03)")).toBe(
      "inset 0 1px 1px oklch(0.1686 0.02256 263.693 / 0.03)",
    );
    expect(toOklchText("color-mix(in srgb, #000000 50%, transparent)")).toBe(
      "color-mix(in srgb, oklch(0 0 0) 50%, transparent)",
    );
  });

  test("leaves var(), transparent and what is no color alone", () => {
    for (const value of [
      "var(--foreground)",
      "color-mix(in srgb, var(--muted-foreground) 50%, var(--background))",
      "transparent",
      "none",
      "blur(20px)",
      "10px",
      "0 1px 0",
    ]) {
      expect(toOklchText(value)).toBe(value);
    }
  });

  test("normalizes an oklch() already written, keeping its numbers", () => {
    expect(toOklchText("oklch(0.577 0.245 27.325)")).toBe("oklch(0.577 0.245 27.325)");
    expect(toOklchText("oklch(1 0 0 / 10%)")).toBe("oklch(1 0 0 / 0.1)");
    expect(toOklchText(oklchColor(0.5, 0.1, 200))).toBe(oklchColor(0.5, 0.1, 200));
  });

  test("is what a theme file already holds (idempotent)", () => {
    const value = "linear-gradient(180deg, oklch(0.25145 0.01219 264.328) 0%, oklch(1 0 0) 100%)";
    expect(toOklchText(value)).toBe(value);
  });
});

describe("over()", () => {
  test("composites a translucent color on an opaque one", () => {
    // shadcn's `dark:bg-input/30`: 15% white over the card.
    expect(at(over("rgba(255,255,255,0.15)", "#171717"))).toBe("#3a3a3a");
    expect(at(over("rgba(255,255,255,0.1)", "#171717"))).toBe("#2e2e2e");
    expect(at(over("oklch(1 0 0 / 15%)", "oklch(0.205 0 0)"))).toBe("#3a3a3a");
  });
});

describe("mix()", () => {
  test("steps half way, rounded", () => {
    expect(at(mix("#f5f5f5", "#e5e5e5", 0.5))).toBe("#ededed");
    expect(at(mix("#262626", "#3a3a3a", 0.5))).toBe("#303030");
    expect(() => mix("rgba(0,0,0,0.5)", "#fff", 0.5)).toThrow();
  });
});

describe("withAlpha()", () => {
  test("takes a color to an alpha", () => {
    expect(withAlpha("#171717", 0.8)).toBe("oklch(0.20463 0 0 / 0.8)");
    expect(css(parseColor(withAlpha("white", 1)))).toBe("#ffffff");
  });
});
