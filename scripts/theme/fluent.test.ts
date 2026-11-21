import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  compositeWinui,
  fluentAccent,
  fluentRoles,
  fluentThemeFiles,
  WINUI,
  type Appearance,
} from "./fluent";
import { css, parseColor, toOklchText } from "./oklch";
import { checkStyle } from "./style";
import { mergeFinishes, tokenKinds, type SplitFinishes, type ThemeCssVars } from "./tokens";

type DefaultThemeFile = {
  cssVars: ThemeCssVars;
};

type DefaultSemanticsFile = Record<string, unknown> & {
  finishes: SplitFinishes<Record<string, unknown>>;
};

const defaultTheme = JSON.parse(
  readFileSync(join(import.meta.dir, "../../packages/theme/theme.json"), "utf8"),
) as DefaultThemeFile;
const defaultSemantics = JSON.parse(
  readFileSync(join(import.meta.dir, "../../packages/theme/semantics.json"), "utf8"),
) as DefaultSemanticsFile;

const NON_COLOUR_THEME_KEYS = new Set(
  Object.keys(defaultTheme.cssVars.theme).filter(
    (key) => key === "radius" || key.startsWith("radius-") || key.startsWith("font-"),
  ),
);

const hexOf = (value: string) => css(parseColor(value)).toLowerCase();

function relativeLuminance(oklchValue: string): number {
  const { r, g, b, a } = parseColor(oklchValue);
  if (a !== undefined && a < 1) {
    throw new Error(`WCAG contrast requires opaque colour, got ${oklchValue}`);
  }
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function wcagContrast(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Published WinUI composited hexes from `.handoff/RESEARCH.md` §2.2 & §7.1
 * (26 roles per appearance, composited over `SolidBackgroundFillColorBase`).
 */
const PUBLISHED_ROLES: Record<Appearance, readonly [string, string][]> = {
  light: [
    ["background", "#f3f3f3"],
    ["foreground", "#1a1a1a"],
    ["card", "#fbfbfb"],
    ["popover", "#ffffff"],
    ["primary-foreground", "#ffffff"],
    ["secondary", "#fbfbfb"],
    ["muted", "#eeeeee"],
    ["muted-foreground", "#5c5c5c"],
    ["accent", "#eaeaea"],
    ["destructive", "#c42b1c"],
    ["border", "#e5e5e5"],
    ["input", "#868686"],
    ["ring", "#1a1a1a"],
    ["ring-halo", "#fbfbfb"],
    ["chart-2", "#0f7b0f"],
    ["chart-3", "#9d5d00"],
    ["chart-5", "#868686"],
    ["sidebar-border", "#e5e5e5"],
    ["inset", "#ededed"],
    ["glass-edge", "#e5e5e5"],
    ["hover", "#f6f6f6"],
    ["faint", "#868686"],
    ["brand-edge", "#929292"],
    ["info-tint", "#f5f5f5"],
    ["warn-tint", "#fff4ce"],
    ["destructive-tint", "#fde7e9"],
    ["up-tint", "#dff6dd"],
    ["inverse-muted", "#5c5c5c"],
  ],
  dark: [
    ["background", "#202020"],
    ["foreground", "#ffffff"],
    ["card", "#2b2b2b"],
    ["popover", "#2c2c2c"],
    ["primary-foreground", "#000000"],
    ["secondary", "#2d2d2d"],
    ["muted", "#1c1c1c"],
    ["muted-foreground", "#cccccc"],
    ["accent", "#2d2d2d"],
    ["destructive", "#ff99a4"],
    ["border", "#303030"],
    ["input", "#9a9a9a"],
    ["ring", "#ffffff"],
    ["ring-halo", "#0a0a0a"],
    ["chart-2", "#6ccb5f"],
    ["chart-3", "#fce100"],
    ["chart-5", "#9a9a9a"],
    ["sidebar-border", "#323232"],
    ["inset", "#1d1d1d"],
    ["glass-edge", "#1a1a1a"],
    ["hover", "#323232"],
    ["faint", "#969696"],
    ["brand-edge", "#1c1c1c"],
    ["info-tint", "#272727"],
    ["warn-tint", "#433519"],
    ["destructive-tint", "#442726"],
    ["up-tint", "#393d1b"],
    ["inverse-muted", "#cccccc"],
  ],
};

describe("WinUI resource compositing", () => {
  for (const appearance of ["light", "dark"] as const) {
    test(`${appearance}: compositing produces the published hex for all ${PUBLISHED_ROLES[appearance].length} RESEARCH rows`, () => {
      const roles = fluentRoles()[appearance];
      expect(PUBLISHED_ROLES[appearance].length).toBeGreaterThanOrEqual(20);
      for (const [role, expectedHex] of PUBLISHED_ROLES[appearance]) {
        expect(hexOf(roles[role as keyof typeof roles]), `${appearance}.${role}`).toBe(expectedHex);
      }
    });
  }

  test("raw WinUI tokens composite over base to expected hexes", () => {
    expect(hexOf(compositeWinui(WINUI.light.ControlFillColorTertiary, "#F3F3F3"))).toBe("#f5f5f5");
    expect(hexOf(compositeWinui(WINUI.dark.ControlFillColorTertiary, "#202020"))).toBe("#272727");
    expect(hexOf(compositeWinui(WINUI.light.SolidBackgroundFillColorTertiary, "#F3F3F3"))).toBe(
      "#f9f9f9",
    );
    expect(hexOf(compositeWinui(WINUI.dark.SolidBackgroundFillColorTertiary, "#202020"))).toBe(
      "#282828",
    );
  });
});

describe("fluentRoles() key coverage and format", () => {
  const roles = fluentRoles();
  const expectedThemeKeys = Object.keys(defaultTheme.cssVars.theme)
    .filter((key) => !NON_COLOUR_THEME_KEYS.has(key))
    .sort();
  const expectedLightKeys = Object.keys(defaultTheme.cssVars.light).sort();
  const expectedDarkKeys = Object.keys(defaultTheme.cssVars.dark).sort();

  test("produces every colour key of packages/theme/theme.json and no extra key", () => {
    expect(Object.keys(roles.theme).sort()).toEqual(expectedThemeKeys);
    expect(Object.keys(roles.light).sort()).toEqual(expectedLightKeys);
    expect(Object.keys(roles.dark).sort()).toEqual(expectedDarkKeys);
  });

  test("every value is a canonical oklch() string, and only overlays/washes keep alpha", () => {
    const allowedAlpha = new Set(["scrim", "window-control-ink", "window-control-edge"]);
    for (const [sectionName, section] of [
      ["theme", roles.theme],
      ["light", roles.light],
      ["dark", roles.dark],
    ] as const) {
      for (const [key, value] of Object.entries(section)) {
        expect(value, `${sectionName}.${key}`).toMatch(/^oklch\(/);
        expect(toOklchText(value), `${sectionName}.${key} canonical`).toBe(value);
        const parsed = parseColor(value);
        if (sectionName === "theme" && allowedAlpha.has(key)) {
          expect(parsed.a, `${sectionName}.${key} keeps alpha`).toBeLessThan(1);
        } else {
          expect(parsed.a, `${sectionName}.${key} is opaque`).toBeUndefined();
        }
      }
    }
  });
});

describe("fluentAccent()", () => {
  test("default accent (#0078D4) lands on #005FB8 light and #60CDFF dark", () => {
    const tiers = fluentAccent();
    expect(hexOf(tiers.base)).toBe("#0078d4");
    expect(hexOf(tiers.dark1)).toBe("#005fb8");
    expect(hexOf(tiers.light2)).toBe("#60cdff");
    const roles = fluentRoles();
    expect(hexOf(roles.light.primary)).toBe("#005fb8");
    expect(hexOf(roles.dark.primary)).toBe("#60cdff");
    expect(hexOf(roles.theme["brand-fill"])).toBe("#005fb8");
  });

  test("custom accent (#C239B3) produces a complete, ordered set", () => {
    const tiers = fluentAccent("#C239B3");
    expect(hexOf(tiers.base)).toBe("#c239b3");
    for (const tier of Object.values(tiers)) {
      expect(tier).toMatch(/^oklch\(/);
      expect(toOklchText(tier)).toBe(tier);
    }

    const custom = fluentRoles("#C239B3");
    const defaults = fluentRoles();
    expect(Object.keys(custom.theme).sort()).toEqual(Object.keys(defaults.theme).sort());
    expect(Object.keys(custom.light).sort()).toEqual(Object.keys(defaults.light).sort());
    expect(Object.keys(custom.dark).sort()).toEqual(Object.keys(defaults.dark).sort());

    expect(custom.light.primary).not.toBe(defaults.light.primary);
    expect(custom.dark.primary).not.toBe(defaults.dark.primary);
    expect(custom.light["brand-tint"]).not.toBe(defaults.light["brand-tint"]);
    expect(custom.dark["brand-tint"]).not.toBe(defaults.dark["brand-tint"]);
    expect(custom.theme["brand-fill"]).not.toBe(defaults.theme["brand-fill"]);
  });
});

describe("WCAG contrast for default accent", () => {
  const roles = fluentRoles();

  test("shared theme pairs have contrast >= 4.5", () => {
    expect(wcagContrast(roles.theme["on-brand"], roles.theme["brand-fill"])).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(wcagContrast(roles.theme["on-media"], roles.theme.media)).toBeGreaterThanOrEqual(4.5);
    expect(
      wcagContrast(roles.theme["chart-foreground"], roles.light.background),
    ).toBeGreaterThanOrEqual(4.5);
  });

  for (const appearance of ["light", "dark"] as const) {
    test(`${appearance}: all foreground/background pairs have contrast >= 4.5`, () => {
      const s = roles[appearance];
      const pairs: [string, string, string][] = [
        ["foreground/background", s.foreground, s.background],
        ["card-foreground/card", s["card-foreground"], s.card],
        ["popover-foreground/popover", s["popover-foreground"], s.popover],
        ["primary-foreground/primary", s["primary-foreground"], s.primary],
        ["secondary-foreground/secondary", s["secondary-foreground"], s.secondary],
        ["muted-foreground/muted", s["muted-foreground"], s.muted],
        ["accent-foreground/accent", s["accent-foreground"], s.accent],
        ["sidebar-foreground/sidebar", s["sidebar-foreground"], s.sidebar],
        [
          "sidebar-primary-foreground/sidebar-primary",
          s["sidebar-primary-foreground"],
          s["sidebar-primary"],
        ],
        [
          "sidebar-accent-foreground/sidebar-accent",
          s["sidebar-accent-foreground"],
          s["sidebar-accent"],
        ],
        ["inverse-foreground/inverse", s["inverse-foreground"], s.inverse],
        ["inverse-muted/inverse", s["inverse-muted"], s.inverse],
        ["inverse-brand/primary", s["inverse-brand"], s.primary],
        ["on-brand-tint/brand-tint", s["on-brand-tint"], s["brand-tint"]],
        ["code/inset", s.code, s.inset],
        ["code/muted", s.code, s.muted],
        ["brand/background", s.brand, s.background],
        ["brand/card", s.brand, s.card],
        ["warn/warn-tint", s.warn, s["warn-tint"]],
        ["up/up-tint", s.up, s["up-tint"]],
        ["destructive/destructive-tint", s.destructive, s["destructive-tint"]],
        ["down/down-tint", s.down, s["down-tint"]],
      ];
      for (const [label, fg, bg] of pairs) {
        expect(wcagContrast(fg, bg), `${appearance} ${label}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

describe("fluentThemeFiles", () => {
  test("produces valid theme.json and semantics.json matching default keys and style schema", () => {
    const files = fluentThemeFiles({
      theme: defaultTheme.cssVars.theme,
      light: defaultTheme.cssVars.light,
      dark: defaultTheme.cssVars.dark,
      lightFinishes: mergeFinishes(defaultSemantics.finishes, "light"),
      darkFinishes: mergeFinishes(defaultSemantics.finishes, "dark"),
    });
    expect(files.theme.name).toBe("Fluent");
    expect(Object.keys(files.theme.cssVars.theme)).toEqual([
      ...Object.keys(defaultTheme.cssVars.theme),
      "font-sans",
    ]);
    expect(Object.keys(files.theme.cssVars.light)).toEqual(Object.keys(defaultTheme.cssVars.light));
    expect(Object.keys(files.theme.cssVars.dark)).toEqual(Object.keys(defaultTheme.cssVars.dark));

    const kinds = tokenKinds(files.theme.cssVars);
    expect(
      checkStyle(
        "packages/theme/themes/fluent/semantics.json",
        files.semantics,
        defaultSemantics,
        kinds,
      ),
    ).toEqual([]);
  });
});
