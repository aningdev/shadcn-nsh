import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { M3_BASELINE_SEED, m3Roles, m3Scheme, m3ThemeFiles, type M3Palette } from "./m3";
import { css, parseColor, toOklchText, type Rgb } from "./oklch";
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

const expectedThemeColourKeys = Object.keys(defaultTheme.cssVars.theme)
  .filter((key) => !NON_COLOUR_THEME_KEYS.has(key))
  .sort();
const expectedLightKeys = Object.keys(defaultTheme.cssVars.light).sort();
const expectedDarkKeys = Object.keys(defaultTheme.cssVars.dark).sort();

/** Published Material 3 Expressive baseline hexes (`material-web` v34.0.21 / Compose tokens). */
const PUBLISHED_LIGHT: Partial<Record<keyof M3Palette, string>> = {
  primary: "#6750A4",
  onPrimary: "#FFFFFF",
  primaryContainer: "#EADDFF",
  onPrimaryContainer: "#4F378B", // Tone 30 (Expressive)
  secondary: "#625B71",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#E8DEF8",
  onSecondaryContainer: "#4A4458", // Tone 30 (Expressive)
  tertiary: "#7D5260",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFD8E4",
  onTertiaryContainer: "#633B48", // Tone 30 (Expressive)
  error: "#B3261E",
  onError: "#FFFFFF",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#8C1D18", // Tone 30 (Expressive)
  surface: "#FEF7FF",
  onSurface: "#1D1B20",
  surfaceVariant: "#E7E0EC",
  onSurfaceVariant: "#49454F",
  surfaceDim: "#DED8E1",
  surfaceBright: "#FEF7FF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F7F2FA",
  surfaceContainer: "#F3EDF7",
  surfaceContainerHigh: "#ECE6F0",
  surfaceContainerHighest: "#E6E0E9",
  outline: "#79747E",
  outlineVariant: "#CAC4D0",
  inverseSurface: "#322F35",
  inverseOnSurface: "#F5EFF7",
  inversePrimary: "#D0BCFF",
};

const PUBLISHED_DARK: Partial<Record<keyof M3Palette, string>> = {
  primary: "#D0BCFF",
  onPrimary: "#381E72",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",
  secondary: "#CCC2DC",
  onSecondary: "#332D41",
  secondaryContainer: "#4A4458",
  onSecondaryContainer: "#E8DEF8",
  tertiary: "#EFB8C8",
  onTertiary: "#492532",
  tertiaryContainer: "#633B48",
  onTertiaryContainer: "#FFD8E4",
  error: "#F2B8B5",
  onError: "#601410",
  errorContainer: "#8C1D18",
  onErrorContainer: "#F9DEDC",
  surface: "#141218",
  onSurface: "#E6E0E9",
  surfaceVariant: "#49454F",
  onSurfaceVariant: "#CAC4D0",
  surfaceDim: "#141218",
  surfaceBright: "#3B383E",
  surfaceContainerLowest: "#0F0D13",
  surfaceContainerLow: "#1D1B20",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",
  outline: "#938F99",
  outlineVariant: "#49454F",
  inverseSurface: "#E6E0E9",
  inverseOnSurface: "#322F35",
  inversePrimary: "#6750A4",
};

function resolveToken(
  token: string,
  section: Record<string, string>,
  fallbackSection?: Record<string, string>,
  depth = 0,
): string {
  if (depth > 8) throw new Error(`Alias cycle at ${token}`);
  const value = section[token] ?? fallbackSection?.[token];
  if (value === undefined) throw new Error(`Missing token ${token}`);
  const alias = /^var\(--([a-z0-9-]+)\)$/i.exec(value.trim());
  if (!alias) return value;
  return resolveToken(alias[1]!, section, fallbackSection, depth + 1);
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const [R, G, B] = [r, g, b].map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe("m3Scheme", () => {
  test("default baseline reproduces published M3 Expressive hexes (>= 20 roles per appearance, including light on*Container Tone 30)", () => {
    const scheme = m3Scheme();
    expect(scheme.seed).toBe(M3_BASELINE_SEED);
    expect(scheme.source).toBe("baseline");

    const lightEntries = Object.entries(PUBLISHED_LIGHT) as [keyof M3Palette, string][];
    const darkEntries = Object.entries(PUBLISHED_DARK) as [keyof M3Palette, string][];
    expect(lightEntries.length).toBeGreaterThanOrEqual(20);
    expect(darkEntries.length).toBeGreaterThanOrEqual(20);

    for (const [role, expectedHex] of lightEntries) {
      expect(scheme.light[role], `light.${role}`).toBe(expectedHex);
    }
    for (const [role, expectedHex] of darkEntries) {
      expect(scheme.dark[role], `dark.${role}`).toBe(expectedHex);
    }
  });

  test("explicit baseline seed matches default", () => {
    expect(m3Scheme("#6750a4")).toEqual(m3Scheme());
  });

  test("second seed (#006A6A) generates a complete distinct MCU scheme", () => {
    const teal = m3Scheme("#006A6A");
    const baseline = m3Scheme();

    expect(teal.seed).toBe("#006A6A");
    expect(teal.source).toBe("mcu");
    expect(Object.keys(teal.light).sort()).toEqual(Object.keys(baseline.light).sort());
    expect(Object.keys(teal.dark).sort()).toEqual(Object.keys(baseline.dark).sort());

    for (const appearance of ["light", "dark"] as const) {
      for (const [role, value] of Object.entries(teal[appearance])) {
        expect(value, `${appearance}.${role}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }

    expect(teal.light.primary).toBe("#006A6A");
    expect(teal.light.onPrimaryContainer).toBe("#004F4F"); // Tone 30
    expect(teal.light.primary).not.toBe(baseline.light.primary);
    expect(teal.dark.primary).not.toBe(baseline.dark.primary);
  });
});

describe("m3Roles", () => {
  const baselineRoles = m3Roles(m3Scheme());
  const tealRoles = m3Roles(m3Scheme("#006A6A"));

  test("produces every colour key of packages/theme/theme.json and no extra key", () => {
    for (const roles of [baselineRoles, tealRoles]) {
      expect(Object.keys(roles.theme).sort()).toEqual(expectedThemeColourKeys);
      expect(Object.keys(roles.light).sort()).toEqual(expectedLightKeys);
      expect(Object.keys(roles.dark).sort()).toEqual(expectedDarkKeys);
    }
  });

  test("every value is canonical oklch(), a var(--x) alias, or color-mix() with canonical oklch()", () => {
    for (const roles of [baselineRoles, tealRoles]) {
      for (const sectionName of ["theme", "light", "dark"] as const) {
        const section = roles[sectionName];
        for (const [key, value] of Object.entries(section)) {
          expect(value.length, `${sectionName}.${key}`).toBeGreaterThan(0);
          expect(toOklchText(value), `${sectionName}.${key}: ${value}`).toBe(value);
          expect(value, `${sectionName}.${key}`).not.toMatch(/#[0-9a-f]{3,8}\b/i);
          expect(value, `${sectionName}.${key}`).not.toMatch(/\b(?:rgba?|hsla?|oklab|lab|lch)\(/i);
          expect(
            value.startsWith("oklch(") ||
              value.startsWith("var(--") ||
              value.startsWith("color-mix("),
            `${sectionName}.${key}: ${value}`,
          ).toBe(true);
        }
      }
    }
  });

  test("default role values round-trip to M3 baseline hexes and preserve RESEARCH var(--x) aliases", () => {
    expect(baselineRoles.theme["brand-fill"]).toBe("var(--primary)");
    expect(baselineRoles.theme["on-brand"]).toBe("var(--primary-foreground)");
    expect(baselineRoles.light["card-foreground"]).toBe("var(--foreground)");
    expect(baselineRoles.light["popover-foreground"]).toBe("var(--foreground)");
    expect(baselineRoles.light["sidebar-foreground"]).toBe("var(--foreground)");
    expect(baselineRoles.light["sidebar-primary"]).toBe("var(--primary)");
    expect(baselineRoles.light["sidebar-primary-foreground"]).toBe("var(--primary-foreground)");
    expect(baselineRoles.light["sidebar-ring"]).toBe("var(--ring)");
    expect(baselineRoles.light.brand).toBe("var(--primary)");
    expect(baselineRoles.light.code).toBe("var(--foreground)");
    expect(baselineRoles.light.down).toBe("var(--destructive)");

    expect(css(parseColor(baselineRoles.light.background)).toUpperCase()).toBe("#FEF7FF");
    expect(css(parseColor(baselineRoles.light.primary)).toUpperCase()).toBe("#6750A4");
    expect(css(parseColor(baselineRoles.light["secondary-foreground"])).toUpperCase()).toBe(
      "#4A4458",
    );
    expect(css(parseColor(baselineRoles.light["on-brand-tint"])).toUpperCase()).toBe("#4A4458");
    expect(css(parseColor(baselineRoles.light.inverse)).toUpperCase()).toBe("#322F35");
    expect(css(parseColor(baselineRoles.light["inverse-foreground"])).toUpperCase()).toBe(
      "#F5EFF7",
    );
    expect(css(parseColor(baselineRoles.light["inverse-brand"])).toUpperCase()).toBe("#D0BCFF");
    expect(css(parseColor(baselineRoles.dark.background)).toUpperCase()).toBe("#141218");
    expect(css(parseColor(baselineRoles.dark.primary)).toUpperCase()).toBe("#D0BCFF");
    expect(css(parseColor(baselineRoles.dark["on-brand-tint"])).toUpperCase()).toBe("#E8DEF8");
    expect(css(parseColor(baselineRoles.dark.inverse)).toUpperCase()).toBe("#E6E0E9");
    expect(css(parseColor(baselineRoles.dark["inverse-foreground"])).toUpperCase()).toBe("#322F35");
    expect(css(parseColor(baselineRoles.dark["inverse-brand"])).toUpperCase()).toBe("#6750A4");
  });

  test("foreground/background pairs meet WCAG AA contrast (>= 4.5) for default seed", () => {
    const pairs: [string, string][] = [
      ["foreground", "background"],
      ["card-foreground", "card"],
      ["popover-foreground", "popover"],
      ["primary-foreground", "primary"],
      ["secondary-foreground", "secondary"],
      ["muted-foreground", "muted"],
      ["muted-foreground", "background"],
      ["accent-foreground", "accent"],
      ["sidebar-foreground", "sidebar"],
      ["sidebar-primary-foreground", "sidebar-primary"],
      ["sidebar-accent-foreground", "sidebar-accent"],
      ["on-brand", "brand-fill"],
      ["on-brand-tint", "brand-tint"],
      ["inverse-foreground", "inverse"],
      ["inverse-brand", "inverse"],
      ["destructive", "destructive-tint"],
    ];

    for (const appearance of ["light", "dark"] as const) {
      const section = baselineRoles[appearance];
      for (const [fgKey, bgKey] of pairs) {
        const fg = parseColor(resolveToken(fgKey, baselineRoles.theme, section));
        const bg = parseColor(resolveToken(bgKey, baselineRoles.theme, section));
        const ratio = contrastRatio(fg, bg);
        expect(
          ratio,
          `${appearance}: ${fgKey} on ${bgKey} (${ratio.toFixed(2)})`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }

    const onMedia = parseColor(baselineRoles.theme["on-media"]!);
    const media = parseColor(baselineRoles.theme.media!);
    expect(contrastRatio(onMedia, media)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("m3ThemeFiles", () => {
  test("produces valid theme.json and semantics.json matching default keys and style schema", () => {
    const files = m3ThemeFiles({
      theme: defaultTheme.cssVars.theme,
      light: defaultTheme.cssVars.light,
      dark: defaultTheme.cssVars.dark,
      lightFinishes: mergeFinishes(defaultSemantics.finishes, "light"),
      darkFinishes: mergeFinishes(defaultSemantics.finishes, "dark"),
    });
    expect(files.theme.name).toBe("Material");
    expect(Object.keys(files.theme.cssVars.theme)).toEqual(Object.keys(defaultTheme.cssVars.theme));
    expect(Object.keys(files.theme.cssVars.light)).toEqual(Object.keys(defaultTheme.cssVars.light));
    expect(Object.keys(files.theme.cssVars.dark)).toEqual(Object.keys(defaultTheme.cssVars.dark));

    const kinds = tokenKinds(files.theme.cssVars);
    expect(
      checkStyle(
        "packages/theme/themes/material/semantics.json",
        files.semantics,
        defaultSemantics,
        kinds,
      ),
    ).toEqual([]);
  });
});
