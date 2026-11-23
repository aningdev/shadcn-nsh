import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { css, parseColor, toOklchText } from "./oklch";
import { checkStyle } from "./style";
import { tokenKinds, type SplitFinishes, type ThemeCssVars } from "./tokens";
import { compositeWinui, WINUI, winuiAccent, winuiRoles, type Appearance } from "./winui";

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

/** `accentPressed`'s fill and ink: `AccentFillColorTertiary` and `TextOnAccentFillColorSecondary` composited. */
const pressedPair = {
  light: { fill: "oklch(0.5773 0.13223 250.006)", ink: "oklch(0.87245 0.03754 247.003)" },
  dark: { fill: "oklch(0.70029 0.10192 230.522)", ink: "oklch(0.42706 0.05878 229.834)" },
};

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
 * Verified WinUI 3 `2.7.0` composited hexes over `SolidBackgroundFillColorBase` (and
 * `ControlStrokeColorOnAccentSecondary` over `AccentFillColorDefault` for `brand-edge`).
 */
const PUBLISHED_ROLES: Record<Appearance, readonly [string, string][]> = {
  light: [
    ["background", "#f3f3f3"],
    ["foreground", "#1a1a1a"],
    ["card", "#fbfbfb"],
    ["popover", "#f9f9f9"],
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
    ["inset", "#ededed"],
    ["glass-edge", "#e5e5e5"],
    ["hover", "#f6f6f6"],
    ["faint", "#868686"],
    ["brand", "#003e92"],
    ["brand-edge", "#00396e"],
    ["info", "#0078d4"],
    ["info-tint", "#f5f5f5"],
    ["warn-tint", "#fff4ce"],
    ["destructive-tint", "#fde7e9"],
    ["up-tint", "#dff6dd"],
    ["inverse", "#f9f9f9"],
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
    ["inset", "#1d1d1d"],
    ["glass-edge", "#1a1a1a"],
    ["hover", "#323232"],
    ["faint", "#969696"],
    ["brand", "#99ebff"],
    ["brand-edge", "#53b1dc"],
    ["info", "#60cdff"],
    ["info-tint", "#272727"],
    ["warn-tint", "#433519"],
    ["destructive-tint", "#442726"],
    ["up-tint", "#393d1b"],
    ["inverse", "#282828"],
  ],
};

describe("WinUI resource compositing", () => {
  for (const appearance of ["light", "dark"] as const) {
    test(`${appearance}: compositing produces the verified hex for all ${PUBLISHED_ROLES[appearance].length} rows`, () => {
      const roles = winuiRoles()[appearance];
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
    expect(hexOf(compositeWinui(WINUI.light.SurfaceStrokeColorDefault, "#F3F3F3"))).toBe("#c1c1c1");
    expect(hexOf(compositeWinui(WINUI.dark.SurfaceStrokeColorDefault, "#202020"))).toBe("#424242");
  });
});

describe("winuiRoles() key coverage and format", () => {
  const roles = winuiRoles();
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

  test("sidebar slots are aliases to the A/B roles with the same value", () => {
    for (const appearance of ["light", "dark"] as const) {
      const roles = winuiRoles()[appearance];
      expect(roles["sidebar-border"]).toBe("var(--line)");
      expect(roles["sidebar"]).toBe("var(--background)");
      expect(roles["sidebar-ring"]).toBe("var(--ring)");
    }
  });

  test("every value is a canonical oklch() string or var(--*) alias, and only overlays/washes keep alpha", () => {
    const allowedAlpha = new Set(["scrim"]);
    const themeAliases = new Set<string>();
    const appearanceAliases = new Set([
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ]);
    for (const [sectionName, section] of [
      ["theme", roles.theme],
      ["light", roles.light],
      ["dark", roles.dark],
    ] as const) {
      for (const [key, value] of Object.entries(section)) {
        if (sectionName === "theme" && themeAliases.has(key)) continue;
        if (sectionName !== "theme" && appearanceAliases.has(key)) {
          expect(value, `${sectionName}.${key} alias`).toMatch(/^var\(--[a-z0-9-]+\)$/);
          continue;
        }
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

describe("winuiAccent()", () => {
  test("default accent (#0078D4) lands on #005FB8/#003E92 light and #60CDFF/#99EBFF dark", () => {
    const tiers = winuiAccent();
    expect(hexOf(tiers.base)).toBe("#0078d4");
    expect(hexOf(tiers.dark1)).toBe("#005fb8");
    expect(hexOf(tiers.dark2)).toBe("#003e92");
    expect(hexOf(tiers.light2)).toBe("#60cdff");
    expect(hexOf(tiers.light3)).toBe("#99ebff");
    const roles = winuiRoles();
    expect(hexOf(roles.light.primary)).toBe("#005fb8");
    expect(hexOf(roles.dark.primary)).toBe("#60cdff");
    expect(hexOf(roles.light.brand)).toBe("#003e92");
    expect(hexOf(roles.dark.brand)).toBe("#99ebff");
    expect(hexOf(roles.light.info)).toBe("#0078d4");
    expect(hexOf(roles.dark.info)).toBe("#60cdff");
  });

  test("custom accent (#C239B3) produces a complete, ordered set", () => {
    const tiers = winuiAccent("#C239B3");
    expect(hexOf(tiers.base)).toBe("#c239b3");
    for (const tier of Object.values(tiers)) {
      expect(tier).toMatch(/^oklch\(/);
      expect(toOklchText(tier)).toBe(tier);
    }

    const custom = winuiRoles("#C239B3");
    const defaults = winuiRoles();
    expect(Object.keys(custom.theme).sort()).toEqual(Object.keys(defaults.theme).sort());
    expect(Object.keys(custom.light).sort()).toEqual(Object.keys(defaults.light).sort());
    expect(Object.keys(custom.dark).sort()).toEqual(Object.keys(defaults.dark).sort());

    expect(custom.light.primary).not.toBe(defaults.light.primary);
    expect(custom.dark.primary).not.toBe(defaults.dark.primary);
    expect(custom.light.brand).not.toBe(defaults.light.brand);
    expect(custom.dark.brand).not.toBe(defaults.dark.brand);
    expect(custom.light["brand-edge"]).not.toBe(defaults.light["brand-edge"]);
    expect(custom.dark["brand-edge"]).not.toBe(defaults.dark["brand-edge"]);
    expect(custom.light["brand-tint"]).not.toBe(defaults.light["brand-tint"]);
    expect(custom.dark["brand-tint"]).not.toBe(defaults.dark["brand-tint"]);
  });
});

describe("WCAG contrast for default accent", () => {
  const roles = winuiRoles();

  test("shared theme pairs have contrast >= 4.5", () => {
    for (const s of [roles.light, roles.dark]) {
      expect(wcagContrast(s["primary-foreground"], s.primary)).toBeGreaterThanOrEqual(4.5);
    }
    expect(wcagContrast(roles.theme["on-media"], roles.theme.media)).toBeGreaterThanOrEqual(4.5);
    expect(wcagContrast(roles.light.foreground, roles.light.background)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  for (const appearance of ["light", "dark"] as const) {
    test(`${appearance}: all foreground/background pairs have contrast >= 4.5`, () => {
      const s = roles[appearance];
      const resolveAlias = (val: string): string => {
        const m = /^var\(--([a-z0-9-]+)\)$/.exec(val);
        if (!m) return val;
        const name = m[1]!;
        if (name in s) return resolveAlias(s[name as keyof typeof s]);
        return resolveAlias(roles.theme[name as keyof typeof roles.theme]);
      };
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
        ["inverse-foreground/popover (tooltip)", s["inverse-foreground"], s.popover],
        ["inverse-brand/primary", s["inverse-brand"], s.primary],
        ["foreground/inset", s.foreground, s.inset],
        ["foreground/muted", s.foreground, s.muted],
        ["brand/background", s.brand, s.background],
        ["brand/card", s.brand, s.card],
        ["warn/warn-tint", s.warn, s["warn-tint"]],
        ["up/up-tint", s.up, s["up-tint"]],
        ["destructive/destructive-tint", s.destructive, s["destructive-tint"]],
      ];
      for (const [label, fg, bg] of pairs) {
        expect(
          wcagContrast(resolveAlias(fg), resolveAlias(bg)),
          `${appearance} ${label}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      // `TextOnAccentFillColorSecondary` (0.7 white light / 0.5 black dark) on `AccentFillColorTertiary`
      // is WinUI 3's genuine subtle pressed ink state (~2.95–3.10 contrast). Both are the
      // `accentPressed` finish's fill and ink, which no token holds: they are WinUI's own composites.
      const pressed = pressedPair[appearance];
      expect(
        wcagContrast(pressed.ink, pressed.fill),
        `${appearance} accentPressed ink/fill`,
      ).toBeGreaterThanOrEqual(2.8);
    });
  }
});

const shipped = {
  theme: JSON.parse(
    readFileSync(join(import.meta.dir, "../../packages/theme/themes/winui/theme.json"), "utf8"),
  ) as { name: string; cssVars: ThemeCssVars },
  semantics: JSON.parse(
    readFileSync(join(import.meta.dir, "../../packages/theme/themes/winui/semantics.json"), "utf8"),
  ),
};

describe("compiled winui theme files", () => {
  test("match the default keys, the style schema and the WinUI 3 values", () => {
    const files = shipped;
    expect(files.theme.name).toBe("WinUI 3");
    expect(files.theme.cssVars.theme["font-mono"]).toBe("Consolas, monospace");
    expect(Object.keys(files.theme.cssVars.theme)).toEqual(Object.keys(defaultTheme.cssVars.theme));
    expect(files.theme.cssVars.theme["font-sans"]).toBe("Segoe UI Variable, Segoe UI, sans-serif");
    expect(Object.keys(files.theme.cssVars.light)).toEqual(Object.keys(defaultTheme.cssVars.light));
    expect(Object.keys(files.theme.cssVars.dark)).toEqual(Object.keys(defaultTheme.cssVars.dark));

    expect(files.semantics.motion.fast).toEqual({ duration: 83, timingFunction: "decelerate" });
    expect(files.semantics.dimension.size.height.pointer).toEqual({ sm: 24, md: 32, lg: 40 });
    expect(files.semantics.finishes.shared.tooltip).toMatchObject({
      background: "{popover}",
      "border-color": "{glass-edge}",
      material: { windows: { backdrop: "blur" } },
    });
    expect(files.semantics.finishes.light.glass).toMatchObject({
      background: "oklch(from {popover} l c h / 0.85)",
    });
    expect(files.semantics.finishes.dark.glass).toMatchObject({
      background: "oklch(from {popover} l c h / 0.96)",
    });
    expect(files.semantics.finishes.light.menu?.shadow).toContain("0 16px 32px");
    expect(files.semantics.finishes.light.modal?.shadow).toContain("0 64px 128px");
    expect(hexOf(String(files.semantics.finishes.light.modal?.["border-color"]))).toBe("#c1c1c1");
    expect(hexOf(String(files.semantics.finishes.dark.modal?.["border-color"]))).toBe("#424242");
    expect(files.semantics.finishes.shared.raised).toMatchObject({
      "border-color": "{border}",
      shadow: "none",
    });
    expect(files.semantics.finishes.light.raised).toMatchObject({
      "border-top-color": "{border}",
      "border-bottom-color": "oklch(0.84522 0 0)",
    });
    expect(files.semantics.finishes.dark.raised).toMatchObject({
      "border-top-color": "oklch(0.32897 0 0)",
      "border-bottom-color": "{border}",
    });
    expect(files.semantics.finishes.shared.accent).toMatchObject({
      "border-bottom-color": "{brand-edge}",
      shadow: "none",
    });
    expect(files.semantics.finishes.light.accent).toMatchObject({
      "border-color": "oklch(0.52768 0.14982 252.341)",
      "border-top-color": "oklch(0.52768 0.14982 252.341)",
    });
    expect(files.semantics.finishes.dark.accent).toMatchObject({
      "border-color": "oklch(0.81732 0.11439 230)",
      "border-top-color": "oklch(0.81732 0.11439 230)",
    });
    expect(files.semantics.finishes.shared.on).toMatchObject({
      background: "{primary}",
      "border-bottom-color": "{brand-edge}",
      foreground: "{primary-foreground}",
    });
    expect(files.semantics.finishes.light.card).toMatchObject({
      "border-color": "oklch(0.92191 0 0)",
    });
    expect(files.semantics.finishes.dark.card).toMatchObject({
      "border-color": "oklch(0.23075 0 0)",
    });
    expect(files.semantics.finishes.shared.accentPressed).toMatchObject({
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "none",
    });
    for (const appearance of ["light", "dark"] as const) {
      expect(files.semantics.finishes[appearance].accentPressed).toMatchObject({
        background: pressedPair[appearance].fill,
        foreground: pressedPair[appearance].ink,
      });
    }
    expect(files.semantics.finishes.shared.disabled).toMatchObject({
      "border-color": "{border}",
    });
    expect(files.semantics.finishes.light.disabled).toMatchObject({
      background: "oklch(0.97015 0 0)",
      foreground: "oklch(0.68949 0 0)",
    });
    expect(files.semantics.finishes.dark.disabled).toMatchObject({
      background: "oklch(0.28502 0 0)",
      foreground: "oklch(0.54863 0 0)",
    });

    const kinds = tokenKinds(files.theme.cssVars);
    expect(
      checkStyle(
        "packages/theme/themes/winui/semantics.json",
        files.semantics,
        defaultSemantics,
        kinds,
      ),
    ).toEqual([]);
  });
});
