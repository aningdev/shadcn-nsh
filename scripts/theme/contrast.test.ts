import { describe, expect, test } from "bun:test";

import {
  contrastRatio,
  exception,
  fillFloor,
  lightness,
  luminance,
  readFills,
  readResults,
  themeFills,
  themePairs,
} from "./contrast";
import { parseColor } from "./oklch";

const ratio = (a: string, b: string) => contrastRatio(parseColor(a), parseColor(b));

describe("contrastRatio", () => {
  test("the WCAG endpoints and known greys", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(ratio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(ratio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
    expect(ratio("#949494", "#ffffff")).toBeCloseTo(3.03, 2);
    expect(ratio("#ff0000", "#ffffff")).toBeCloseTo(3.998, 2);
    expect(ratio("#123456", "#123456")).toBe(1);
  });

  test("luminance is 0 for black and 1 for white", () => {
    expect(luminance(parseColor("#000000"))).toBe(0);
    expect(luminance(parseColor("#ffffff"))).toBe(1);
  });
});

describe("themePairs", () => {
  const theme = {
    cssVars: {
      theme: {
        background: "#ffffff",
        foreground: "#000000",
        primary: "#000000",
        "primary-foreground": "#ffffff",
      },
      light: {},
      dark: {},
    },
  };
  const semantics = {
    finishes: {
      shared: {
        overlay: { background: "#ffffff", foreground: "{foreground}" },
        knob: { background: "#ffffff", foreground: "#ffffff" },
      },
      light: {},
      dark: {},
    },
  };

  test("a pair resolves and passes", () => {
    const results = themePairs(theme, semantics, "fixture", "light");
    const pair = results.find(({ fg, bg }) => fg === "primary-foreground" && bg === "primary");
    expect(pair?.ratio).toBeCloseTo(21, 5);
    expect(pair?.pass).toBe(true);
  });

  test("a low-contrast role fails, with its ratio and threshold", () => {
    const low = {
      cssVars: {
        theme: { background: "#ffffff", foreground: "#949494" },
        light: {},
        dark: {},
      },
    };
    const pair = themePairs(low, {}, "fixture", "light").find(
      ({ fg, bg }) => fg === "foreground" && bg === "background",
    );
    expect(pair?.pass).toBe(false);
    expect(pair?.required).toBe(4.5);
    expect(pair?.ratio).toBeCloseTo(3.03, 2);
  });

  test("a finish is checked with its own ink, and the knob carries none", () => {
    const results = themePairs(theme, semantics, "fixture", "light");
    const overlay = results.find(({ bg }) => bg === "finish.overlay");
    expect(overlay?.fg).toBe("foreground");
    expect(overlay?.ratio).toBeCloseTo(21, 5);
    expect(results.some(({ bg }) => bg === "finish.knob")).toBe(false);
  });

  test("an accent's pressed pair is checked where a theme states one", () => {
    const pressed = {
      finishes: {
        shared: {
          accent: {
            background: "#000000",
            foreground: "#ffffff",
            "pressed-background": "#ffffff",
            "pressed-foreground": "#949494",
          },
        },
        light: {},
        dark: {},
      },
    };
    const pair = themePairs(theme, pressed, "fixture", "light").find(
      ({ bg }) => bg === "finish.accent.pressed-background",
    );
    expect(pair?.fg).toBe("finish.accent.pressed-foreground");
    expect(pair?.pass).toBe(false);
  });

  test("a finish's alpha fill is composited over the page", () => {
    const glass = {
      cssVars: {
        theme: {
          background: "#ffffff",
          foreground: "#000000",
          card: "#000000",
          "popover-foreground": "#000000",
        },
        light: {},
        dark: {},
      },
    };
    const finish = {
      finishes: {
        shared: {
          glass: {
            background: "oklch(from {card} l c h / 0.5)",
            foreground: "{popover-foreground}",
          },
        },
        light: {},
        dark: {},
      },
    };
    const pair = themePairs(glass, finish, "fixture", "light").find(
      ({ bg }) => bg === "finish.glass",
    );
    // Black at half alpha over white is #808080: 5.32:1 under black text.
    expect(pair?.ratio).toBeCloseTo(5.32, 1);
    expect(pair?.pass).toBe(true);
  });
});

describe("themeFills", () => {
  const theme = {
    cssVars: {
      theme: { background: "#f2f2f7", card: "#ffffff", popover: "#ffffff", sidebar: "#f2f2f7" },
      light: { accent: "rgba(118, 118, 128, 0.12)", "sidebar-accent": "var(--accent)" },
      dark: {},
    },
  };

  test("a translucent fill is composited over each ground it is painted on", () => {
    const fills = themeFills(theme, "fixture", "light");
    expect(fills.map(({ fill, ground }) => `${fill}/${ground}`)).toEqual([
      "accent/background",
      "accent/card",
      "accent/popover",
      "sidebar-accent/sidebar",
    ]);
    // Apple's tertiarySystemFill over the grouped page is #e3e3e6-ish: well below the page's
    // lightness, and farther still below a white card's.
    for (const fill of fills) {
      expect(fill.pass).toBe(true);
      expect(Math.abs(fill.deltaL)).toBeGreaterThanOrEqual(fillFloor);
    }
    const page = fills.find(({ ground }) => ground === "background")!;
    const card = fills.find(({ ground }) => ground === "card")!;
    expect(Math.abs(card.deltaL)).toBeGreaterThan(Math.abs(page.deltaL));
  });

  test("the fill Apple shipped before #349 is invisible on the grouped page", () => {
    const before = {
      cssVars: {
        theme: { background: "#f2f2f7", card: "#ffffff", popover: "#ffffff" },
        light: { accent: "#f4f4f5", "sidebar-accent": "var(--accent)", sidebar: "#f2f2f7" },
        dark: {},
      },
    };
    const failing = themeFills(before, "apple", "light").filter(({ pass }) => !pass);
    expect(failing.map(({ fill, ground }) => `${fill}/${ground}`)).toEqual([
      "accent/background",
      "sidebar-accent/sidebar",
    ]);
    expect(failing[0]!.deltaL).toBeCloseTo(0.005, 3);
  });

  test("the floor is shadcn's own sidebar gap, read to three decimals", () => {
    const shadcn = {
      cssVars: {
        theme: { sidebar: "oklch(0.985 0 0)" },
        light: { "sidebar-accent": "oklch(0.97 0 0)" },
        dark: {},
      },
    };
    const [fill] = themeFills(shadcn, "shadcn", "light");
    // The fill is darker than the sidebar: the gap is read as a distance.
    expect(Math.abs(fill!.deltaL)).toBe(fillFloor);
    expect(fill!.pass).toBe(true);
  });

  test("lightness reads the OKLCH L of an opaque colour", () => {
    expect(lightness(parseColor("#000000"))).toBeCloseTo(0, 5);
    expect(lightness(parseColor("#ffffff"))).toBeCloseTo(1, 5);
  });
});

describe("the shipped themes", () => {
  const fills = readFills();

  test("every fill separates", () => {
    const failing = fills.filter((fill) => !fill.pass);
    expect(
      failing.map(({ theme, mode, fill, ground }) => `${theme} ${mode} ${fill}/${ground}`),
    ).toEqual([]);
  });

  test("apple's selection fill reads on the page, cards, popovers and the sidebar", () => {
    const apple = fills.filter((fill) => fill.theme === "apple");
    expect(apple).toHaveLength(8);
    for (const fill of apple) expect(fill.pass).toBe(true);
  });

  const results = readResults();

  test("every pair passes or is a platform's own value", () => {
    const failing = results.filter((result) => !result.pass && !exception(result));
    expect(failing.map(({ theme, mode, fg, bg }) => `${theme} ${mode} ${fg}/${bg}`)).toEqual([]);
  });

  test("primary-foreground is read on primary, and disabled and chart inks are not checked", () => {
    const pairs = new Set(results.map(({ fg, bg }) => `${fg}/${bg}`));
    expect(pairs.has("primary-foreground/primary")).toBe(true);
    expect(pairs.has("primary-foreground/finish.accent")).toBe(true);
    expect([...pairs].some((pair) => /^(disabled|chart)-foreground\//.test(pair))).toBe(false);
    expect([...pairs].some((pair) => /\/finish\.(disabled|knob)$/.test(pair))).toBe(false);
  });

  test("an exception names its source", () => {
    expect(exception({ theme: "apple", fg: "muted-foreground", bg: "background" })).toContain(
      "secondaryLabel",
    );
    expect(exception({ theme: "nsh-gallery", fg: "muted-foreground", bg: "background" })).toBe(
      undefined,
    );
  });
});
