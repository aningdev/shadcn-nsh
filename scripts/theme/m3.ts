/**
 * Material 3 Expressive colour core for the `material` theme (#224, batch 1).
 *
 * Pinned primary sources (audited 2026-11-21):
 * - Material 3 Design Token Compiler (`material-components/material-web`):
 *   Google Material 3 `v34.0.21` (`tokens/versions/latest/sass/_md-ref-palette.scss`,
 *   `_md-sys-color.scss`, `_md-sys-color__dark.scss`), commit
 *   `a0bab1d9448bbcecab053e6085b8ec621e4cae3e` (latest tagged release `v2.5.0`).
 * - AndroidX Jetpack Compose Material 3 (`androidx/androidx`):
 *   Compose Material 3 `1.5.0` / `1.6.0-alpha01` (`PaletteTokens.kt`, `ColorLightTokens.kt`,
 *   `ColorDarkTokens.kt`, `ColorScheme.kt` `expressiveLightColorScheme()`), commit
 *   `ac364f3c7f575c0e10f089b254a8eedb5b7d705a`.
 * - Material Color Utilities (`material-foundation/material-color-utilities`):
 *   npm `@material/material-color-utilities@0.4.0` (Dynamic Color Spec `2021` / `2025` / `2026`,
 *   upstream commit `dca2d34221e4a56f90e05ef3223481183ebd1d5d`).
 *
 * Why the default baseline is pinned separately from MCU:
 * MCU's algorithmic `TonalPalette` (`Variant.TONAL_SPOT`, `specVersion: "2021"`) produces slight
 * HCT chroma-clamping differences against Google's hand-tuned static `#6750A4` baseline (e.g.
 * `#65558F` vs `#6750A4` for `primary`, `#BA1A1A` vs `#B3261E` for `error`, `#FDF7FF` vs
 * `#FEF7FF` for `surface`). `m3Scheme()` therefore returns the exact published M3 Expressive
 * static baseline (including light `on*Container` Tone 30) when called with no seed or `#6750A4`,
 * and delegates any other seed to MCU `DynamicScheme` (`Variant.TONAL_SPOT`, `specVersion: "2021"`),
 * which preserves the same tone table (including light `on*Container` Tone 30).
 */
import {
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  Variant,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

import type { ThemeGeneratorOutput } from "./dtcg";
import { oklchColor, toOklchText } from "./oklch";

export const M3_BASELINE_SEED = "#6750A4";

export type Appearance = "light" | "dark";

export interface M3Palette {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  background: string;
  onBackground: string;
  scrim: string;
  shadow: string;
  surfaceTint: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  onSecondaryFixedVariant: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixed: string;
  onTertiaryFixedVariant: string;
}

export interface M3Scheme {
  seed: string;
  source: "baseline" | "mcu";
  light: M3Palette;
  dark: M3Palette;
}

export interface M3Roles {
  theme: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

const FIXED_BASELINE = {
  primaryFixed: "#EADDFF",
  primaryFixedDim: "#D0BCFF",
  onPrimaryFixed: "#21005D",
  onPrimaryFixedVariant: "#4F378B",
  secondaryFixed: "#E8DEF8",
  secondaryFixedDim: "#CCC2DC",
  onSecondaryFixed: "#1D192B",
  onSecondaryFixedVariant: "#4A4458",
  tertiaryFixed: "#FFD8E4",
  tertiaryFixedDim: "#EFB8C8",
  onTertiaryFixed: "#31111D",
  onTertiaryFixedVariant: "#633B48",
} as const;

/**
 * Official Material 3 Expressive static baseline (`#6750A4`), combining `material-web`
 * `v34.0.21` (`_md-sys-color.scss` / `_md-sys-color__dark.scss` + `_md-ref-palette.scss`) and
 * Compose `expressiveLightColorScheme()` / `ColorDarkTokens.kt` (light `on*Container` = Tone 30).
 */
const BASELINE_SCHEME: M3Scheme = {
  seed: M3_BASELINE_SEED,
  source: "baseline",
  light: {
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EADDFF",
    onPrimaryContainer: "#4F378B",
    secondary: "#625B71",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E8DEF8",
    onSecondaryContainer: "#4A4458",
    tertiary: "#7D5260",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFD8E4",
    onTertiaryContainer: "#633B48",
    error: "#B3261E",
    onError: "#FFFFFF",
    errorContainer: "#F9DEDC",
    onErrorContainer: "#8C1D18",
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
    background: "#FEF7FF",
    onBackground: "#1D1B20",
    scrim: "#000000",
    shadow: "#000000",
    surfaceTint: "#6750A4",
    ...FIXED_BASELINE,
  },
  dark: {
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
    background: "#141218",
    onBackground: "#E6E0E9",
    scrim: "#000000",
    shadow: "#000000",
    surfaceTint: "#D0BCFF",
    ...FIXED_BASELINE,
  },
};

const M3_ROLE_KEYS = Object.keys(BASELINE_SCHEME.light) as (keyof M3Palette)[];

const mdc = new MaterialDynamicColors();

/** Normalizes `#RGB` or `#RRGGBB` to uppercase `#RRGGBB`. */
function normalizeHexSeed(seed: string): string {
  const trimmed = seed.trim();
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
  if (!match) throw new Error(`Invalid M3 hex seed: ${seed}`);
  const digits = match[1]!;
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : digits;
  return `#${full.toUpperCase()}`;
}

function buildMcuPalette(sourceColorHct: Hct, isDark: boolean): M3Palette {
  const scheme = new DynamicScheme({
    sourceColorHct,
    variant: Variant.TONAL_SPOT,
    isDark,
    contrastLevel: 0,
    specVersion: "2021",
  });
  return Object.fromEntries(
    M3_ROLE_KEYS.map((role) => [role, hexFromArgb(mdc[role]().getArgb(scheme)).toUpperCase()]),
  ) as unknown as M3Palette;
}

/**
 * Generates Material 3 Expressive light and dark palettes.
 *
 * With no seed (or the baseline `#6750A4`), returns the exact published M3 static baseline
 * (`material-web` `v34.0.21` / Compose `expressiveLightColorScheme`). For any other hex seed,
 * generates both appearances with MCU (`Variant.TONAL_SPOT`, `specVersion: "2021"`).
 */
export function m3Scheme(seed?: string): M3Scheme {
  if (seed === undefined) return BASELINE_SCHEME;
  const normalized = normalizeHexSeed(seed);
  if (normalized === M3_BASELINE_SEED) return BASELINE_SCHEME;

  const sourceColorHct = Hct.fromInt(argbFromHex(normalized));
  return {
    seed: normalized,
    source: "mcu",
    light: buildMcuPalette(sourceColorHct, false),
    dark: buildMcuPalette(sourceColorHct, true),
  };
}

/** Non-M3 NSH semantic tokens carried over from RESEARCH §2.1 & §2.2. */
const NSH_EXTENSIONS = {
  media: "oklch(0.1869 0.0151 266.766)",
  warn: {
    light: "oklch(0.5909 0.13245 65.117)",
    dark: "oklch(0.82449 0.14865 73.346)",
  },
  up: {
    light: "oklch(0.56078 0.1232 159.355)",
    dark: "oklch(0.77932 0.14805 162.141)",
  },
} as const;

const tintMix = (token: string) => `color-mix(in srgb, var(--${token}) 12%, transparent)`;

function appearanceRoles(p: M3Palette, appearance: Appearance): Record<string, string> {
  const c = (hex: string) => toOklchText(hex);
  return {
    background: c(p.surface),
    foreground: c(p.onSurface),
    card: c(p.surfaceContainerLow),
    "card-foreground": "var(--foreground)",
    popover: c(p.surfaceContainer),
    "popover-foreground": "var(--foreground)",
    primary: c(p.primary),
    "primary-foreground": c(p.onPrimary),
    secondary: c(p.secondaryContainer),
    "secondary-foreground": c(p.onSecondaryContainer),
    muted: c(p.surfaceContainerHighest),
    "muted-foreground": c(p.onSurfaceVariant),
    accent: c(p.secondaryContainer),
    "accent-foreground": c(p.onSecondaryContainer),
    destructive: c(p.error),
    border: c(p.outlineVariant),
    input: c(p.outline),
    ring: c(p.secondary),
    "chart-1": c(p.primary),
    "chart-2": c(p.tertiary),
    "chart-3": c(p.secondary),
    "chart-4": c(p.outline),
    "chart-5": c(p.outlineVariant),
    sidebar: "var(--background)",
    "sidebar-foreground": "var(--foreground)",
    "sidebar-primary": "var(--primary)",
    "sidebar-primary-foreground": "var(--primary-foreground)",
    "sidebar-accent": "var(--accent)",
    "sidebar-accent-foreground": "var(--accent-foreground)",
    "sidebar-border": "var(--border)",
    "sidebar-ring": "var(--ring)",
    inset: c(p.surfaceContainer),
    raised: c(p.surfaceContainerLow),
    "glass-edge": c(p.outlineVariant),
    field: c(p.surfaceContainerHighest),
    line: c(p.outlineVariant),
    hover: "color-mix(in srgb, var(--foreground) 8%, transparent)",
    "ring-halo": "color-mix(in srgb, var(--ring) 20%, transparent)",
    faint: c(p.outline),
    brand: "var(--primary)",
    "brand-edge": c(p.outlineVariant),
    track: c(p.surfaceContainerHighest),
    knob: c(p.outline),
    info: c(p.primary),
    warn: toOklchText(NSH_EXTENSIONS.warn[appearance]),
    up: toOklchText(NSH_EXTENSIONS.up[appearance]),
    // M3 paints selected chips/tiles/buttons with opaque SecondaryContainer.
    "brand-tint": c(p.secondaryContainer),
    inverse: c(p.inverseSurface),
    "inverse-foreground": c(p.inverseOnSurface),
    "inverse-brand": c(p.inversePrimary),
    "info-tint": tintMix("info"),
    "warn-tint": tintMix("warn"),
    "destructive-tint": c(p.errorContainer),
    "up-tint": tintMix("up"),
    "down-tint": tintMix("destructive"),
    violet: c(p.tertiary),
  };
}

/**
 * Maps an `M3Scheme` onto every colour key of `.handoff/theme.json` (`theme`, `light`, `dark`)
 * as canonical `oklch()` strings (keeping `var(--x)` aliases and `color-mix()` expressions where
 * RESEARCH §2 / §7.1 specifies them).
 */
export function m3Roles(scheme: M3Scheme): M3Roles {
  return {
    theme: {
      scrim: oklchColor(0, 0, 0, 0.32),
      media: toOklchText(NSH_EXTENSIONS.media),
      "on-media": toOklchText("#FFFFFF"),
    },
    light: appearanceRoles(scheme.light, "light"),
    dark: appearanceRoles(scheme.dark, "dark"),
  };
}

const alias = (token: string) => `{${token}}`;
const flat = (color: string) => `linear-gradient(180deg, ${color} 0%, ${color} 100%)`;

/** Material Web `_elevation.scss` key + ambient shadow levels in black ink. */
const LEVEL_1 = `0 1px 2px 0 ${oklchColor(0, 0, 0, 0.3)}, 0 1px 3px 1px ${oklchColor(0, 0, 0, 0.15)}`;
const LEVEL_2 = `0 1px 2px 0 ${oklchColor(0, 0, 0, 0.3)}, 0 2px 6px 2px ${oklchColor(0, 0, 0, 0.15)}`;
const LEVEL_3 = `0 1px 3px 0 ${oklchColor(0, 0, 0, 0.3)}, 0 4px 8px 3px ${oklchColor(0, 0, 0, 0.15)}`;

const surface = (
  color: string,
  {
    shadow = "none",
    "border-color": borderColor = "transparent",
    "border-top-color": borderTopColor,
    "border-bottom-color": borderBottomColor,
    foreground,
    material = null,
  }: {
    shadow?: string;
    "border-color"?: string;
    "border-top-color"?: string;
    "border-bottom-color"?: string;
    foreground?: string;
    material?: { android: { elevation: number } } | null;
  } = {},
) => ({
  background: color,
  gradient: flat(color),
  shadow,
  "border-color": borderColor,
  ...(borderTopColor !== undefined ? { "border-top-color": borderTopColor } : {}),
  ...(borderBottomColor !== undefined ? { "border-bottom-color": borderBottomColor } : {}),
  ...(foreground !== undefined ? { foreground } : {}),
  material,
});

/**
 * Shared theme-level tokens (`cssVars.theme`) for Material 3 Expressive: M3 Compose tokens at
 * `ac364f3c` (`CornerExtraSmall` 4dp, `CornerLarge` / medium container 12dp, `CornerExtraLarge`
 * 28dp; capsule buttons use `shape.corners.button: "full"`), system monospace font, and M3 colour
 * tokens from `m3Roles`.
 */
function themeLevel(roles: M3Roles): Record<string, string> {
  return {
    radius: "4px",
    "radius-control": "4px",
    "radius-container": "12px",
    "radius-modal": "28px",
    "font-mono": "monospace",
    ...roles.theme,
  };
}

/**
 * All 23 finish roles for Material 3 Expressive (`{token}` references; light/dark polarity comes
 * from `theme.json`). No frosted glass or blur; elevation maps onto Material Web Level 1–3
 * shadows and `material.android.elevation` (1 / 3 / 6 dp).
 */
function finishes(modalFill: string): Record<string, Record<string, unknown>> {
  const level1 = { android: { elevation: 1 } };
  const level2 = { android: { elevation: 3 } };
  const level3 = { android: { elevation: 6 } };
  return {
    card: {
      gradient: flat(alias("card")),
      shadow: LEVEL_1,
      "border-color": "transparent",
      material: level1,
    },
    section: {
      background: alias("card"),
      shadow: LEVEL_1,
      "border-color": "transparent",
      material: level1,
    },
    inset: { shadow: "none", material: null },
    field: { shadow: "none", material: null },
    raised: {
      ...surface(alias("raised"), {
        shadow: LEVEL_1,
        "border-top-color": "transparent",
        "border-bottom-color": "transparent",
        material: level1,
      }),
      backdropFilter: "none",
    },
    hover: {
      background: alias("raised"),
      gradient: flat(alias("hover")),
      shadow: LEVEL_1,
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      material: level1,
    },
    pressed: surface(alias("raised"), {
      shadow: LEVEL_1,
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      foreground: alias("foreground"),
      material: level1,
    }),
    // M3's disabled container: `onSurface` at 10 % over the surface under it, and its label at
    // 38 %.
    disabled: {
      ...surface("oklch(from {foreground} l c h / 0.1)", {
        foreground: "oklch(from {foreground} l c h / 0.38)",
      }),
      // One wash over the surface, so the gradient stays clear instead of stacking the alpha twice.
      gradient: "linear-gradient(180deg, transparent 0%, transparent 100%)",
    },
    light: surface(alias("primary"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    accent: surface(alias("primary"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    // A press is the theme's own state layer and ripple over the accent, not a fill of its own: the
    // accent's fill, undimmed (this theme dims no accent press).
    accentPressed: surface(alias("primary"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      foreground: alias("primary-foreground"),
    }),
    track: { shadow: "none", "border-color": alias("input"), material: null },
    fill: {
      background: "transparent",
      gradient: flat(alias("primary")),
      shadow: "none",
      "border-color": "transparent",
      material: null,
    },
    knob: surface(alias("knob")),
    knobOn: surface(alias("primary-foreground")),
    handle: surface(alias("primary")),
    pill: surface(alias("raised"), { shadow: LEVEL_1, material: level1 }),
    thumb: surface(alias("secondary")),
    on: surface(alias("secondary"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      foreground: alias("accent-foreground"),
    }),
    chip: surface(alias("background"), { "border-color": alias("border") }),
    glass: {
      background: alias("popover"),
      shadow: LEVEL_2,
      "border-color": "transparent",
      backdropFilter: "none",
      material: level2,
    },
    menu: {
      background: alias("popover"),
      shadow: LEVEL_2,
      "border-color": "transparent",
      backdropFilter: "none",
      material: level2,
    },
    modal: {
      background: modalFill,
      shadow: LEVEL_3,
      "border-color": "transparent",
      material: level3,
    },
    grabber: {
      background: "oklch(from {muted-foreground} l c h / 0.4)",
      shadow: "none",
      material: null,
    },
    tooltip: {
      background: alias("inverse"),
      shadow: "none",
      "border-color": "transparent",
      material: null,
    },
    inverse: {
      background: alias("inverse"),
      shadow: LEVEL_3,
      "border-color": "transparent",
      foreground: alias("inverse-foreground"),
      backdropFilter: "none",
      material: level3,
    },
    groove: { shadow: "none", material: null },
  };
}

/** Material 3 Expressive style groups (`semantics.json`); verified values in `docs/specs/native-themes.md` §3.2. */
export const m3Style = {
  typography: {
    fontFamily: null,
    caption: {
      fontSize: { pointer: 11, touch: 11 },
      lineHeight: { pointer: 16 / 11, touch: 16 / 11 },
      fontWeight: 500,
      letterSpacing: 0.5,
    },
    detail: {
      fontSize: { pointer: 12, touch: 12 },
      lineHeight: { pointer: 16 / 12, touch: 16 / 12 },
      fontWeight: 400,
      letterSpacing: 0.4,
    },
    body: {
      fontSize: { pointer: 14, touch: 14 },
      lineHeight: { pointer: 20 / 14, touch: 20 / 14 },
      fontWeight: 400,
      letterSpacing: 0.25,
    },
    label: {
      fontSize: { pointer: 14, touch: 14 },
      lineHeight: { pointer: 20 / 14, touch: 20 / 14 },
      fontWeight: 500,
      letterSpacing: 0.1,
    },
    title: {
      fontSize: { pointer: 16, touch: 16 },
      lineHeight: { pointer: 24 / 16, touch: 24 / 16 },
      fontWeight: 500,
      letterSpacing: 0.15,
    },
    headline: {
      fontSize: { pointer: 24, touch: 24 },
      lineHeight: { pointer: 32 / 24, touch: 32 / 24 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    display: {
      fontSize: { pointer: 36, touch: 36 },
      lineHeight: { pointer: 44 / 36, touch: 44 / 36 },
      fontWeight: 400,
      letterSpacing: 0,
    },
  },
  dimension: {
    shape: {
      control: "{radius-control}",
      container: "{radius-container}",
      modal: "{radius-modal}",
    },
    size: {
      hit: { pointer: 44, touch: 48 },
      density: {
        pointer: { row: 48, pad: 16, gap: 12, surface: 12 },
        touch: { row: 56, pad: 16, gap: 12, surface: 16 },
      },
      control: {
        pointer: {
          row: 48,
          padding: 8,
          gap: 12,
          control: 18,
          check: 18,
          dot: 10,
          tabs: 48,
          line: 48,
          clear: 20,
          switch: "regular",
        },
        touch: {
          row: 56,
          padding: 10,
          gap: 12,
          control: 18,
          check: 18,
          dot: 10,
          tabs: 48,
          line: 56,
          clear: 24,
          switch: "regular",
        },
      },
      height: { pointer: { sm: 32, md: 40, lg: 56 }, touch: { sm: 32, md: 40, lg: 56 } },
    },
    // M3 elevated/filled surfaces (ElevatedCard, Sheet, NavigationDrawer, Dialog, Menu, Snackbar)
    // have no outline (`surface: 0`); `hairline: 1` stays for dividers and outlined variants.
    stroke: { hairline: 1, surface: 0, control: 1 },
    focus: { style: "outline", width: 3, offset: 2 },
    icon: {
      pointer: { sm: 18, md: 20, lg: 24 },
      touch: { sm: 18, md: 20, lg: 24 },
    },
  },
  shape: {
    curve: "circular",
    corners: {
      button: "full" as const,
    },
  },
  state: {
    // M3 presses via state layer overlay and Android ripple rather than geometric scale.
    "press-scale": 1,
    overlay: { hover: 0.08, focus: 0.1, pressed: 0.1, dragged: 0.16 },
    ripple: true,
    "pressed-opacity": 1,
    "rest-opacity": 0.5,
    disabled: { content: 0.38, fill: true },
  },
  duration: { shake: 500 },
  transition: {
    enter: { duration: 500, timingFunction: "emphasized-decelerate" },
  },
  motion: {
    // ExpressiveMotionTokens: FastSpatial (k=800, z=0.6), DefaultSpatial (k=380, z=0.8),
    // DefaultEffects (k=1600, z=1.0), and DurationLong2 (500ms) with emphasized-decelerate.
    press: { stiffness: 800, damping: 33.94 },
    settle: { stiffness: 380, damping: 31.19 },
    control: { stiffness: 1600, damping: 80 },
    move: { stiffness: 380, damping: 31.19 },
  },
  controls: "material" as const,
};

/** Material 3 Expressive theme data and DTCG descriptions ready for `emitDtcgTheme`. */
export function m3DtcgOutput(seed?: string): ThemeGeneratorOutput {
  const scheme = m3Scheme(seed);
  const roles = m3Roles(scheme);
  const colorDescs = {
    background: "Primary page surface (M3 surface role, material-web v34.0.21).",
    foreground: "Default text and icon ink on surfaces (M3 onSurface).",
    card: "Elevated card container background (M3 surfaceContainerLow).",
    popover: "Floating popover and menu container background (M3 surfaceContainer).",
    primary: "Primary brand action fill (M3 primary).",
    "primary-foreground": "Text and icon ink on primary fills (M3 onPrimary).",
    secondary: "Secondary tonal container fill (M3 secondaryContainer).",
    "secondary-foreground":
      "Text and icon ink on secondary containers (M3 Expressive onSecondaryContainer, Tone 30 in light).",
    muted: "Muted/highest surface container fill (M3 surfaceContainerHighest).",
    "muted-foreground": "Secondary supporting text and icon ink (M3 onSurfaceVariant).",
    accent: "Tonal accent fill (M3 secondaryContainer).",
    "accent-foreground": "Text and icon ink on accent fills (M3 Expressive onSecondaryContainer).",
    destructive: "Error and destructive action color (M3 error).",
    border: "Hairline container border color (M3 outlineVariant).",
    input: "Input outline color (M3 outline).",
    ring: "Focus indicator ring color (M3 secondary).",
    "chart-1": "First chart series color (M3 primary).",
    "chart-2": "Second chart series color (M3 tertiary).",
    "chart-3": "Third chart series color (M3 secondary).",
    "chart-4": "Fourth chart series color (M3 outline).",
    "chart-5": "Fifth chart series color (M3 outlineVariant).",
    sidebar: "Sidebar canvas background (M3 surface).",
    "sidebar-accent": "Sidebar active item fill (M3 secondaryContainer).",
    "sidebar-accent-foreground":
      "Sidebar active item text ink (M3 Expressive onSecondaryContainer).",
    "sidebar-border": "Sidebar divider border (M3 outlineVariant).",
    inset: "Inset container surface (M3 surfaceContainer).",
    raised: "Raised control surface (M3 surfaceContainerLow).",
    "glass-edge": "Overlay outline edge (M3 outlineVariant).",
    field: "Filled text field background (M3 surfaceContainerHighest).",
    line: "Inset divider hairline (M3 outlineVariant).",
    hover: "M3 hover state-layer ink (8% foreground over transparent, StateTokens.kt).",
    "ring-halo": "Outer focus ring halo (20% ring color over transparent).",
    faint: "Quiet caption/placeholder ink (M3 outline).",
    brand: "Inline brand accent ink, aliased to {color.primary}.",
    "brand-edge": "Brand container outline (M3 outlineVariant).",
    track: "Switch and slider track fill (M3 surfaceContainerHighest).",
    knob: "Unchecked switch thumb fill (M3 outline).",
    info: "Informational semantic color matching M3 primary.",
    "brand-tint": "Opaque selected chip/tile fill (M3 secondaryContainer).",
    inverse: "Inverse surface for snackbars and tooltips (M3 inverseSurface).",
    "inverse-foreground": "Ink on inverse surfaces (M3 inverseOnSurface).",
    "inverse-brand": "Brand action ink on inverse surfaces (M3 inversePrimary).",
    "info-tint": "Translucent informational wash (12% info over transparent).",
    "warn-tint": "Translucent warning wash (12% warn over transparent).",
    "destructive-tint": "Tonal error container background (M3 errorContainer).",
    "up-tint": "Translucent positive wash (12% up over transparent).",
    "down-tint": "Translucent negative wash (12% down over transparent).",
    violet: "Tertiary accent color (M3 tertiary).",
  };

  return {
    id: "material",
    name: "Material",
    resolverDescription: "Material 3 Expressive theme (material-web v34.0.21 / Compose M3 1.5.0).",
    themeDescription: "Appearance-invariant base tokens and Material 3 Expressive style overrides.",
    finishesDescription:
      "Appearance-invariant surface finish recipes for Material 3 Expressive (Level 1-3 elevations, Android elevation metadata, no blur).",
    lightDescription:
      "Light appearance colors for Material 3 Expressive (#6750A4 baseline with Expressive Tone 30 on*Container).",
    darkDescription: "Dark appearance colors for Material 3 Expressive (#6750A4 baseline).",
    pointerDescription:
      "Material 3 Expressive desktop pointer input-tier overrides (M3 Desktop 44dp hit target, 48dp row).",
    touchDescription:
      "Material 3 Expressive touch input-tier overrides (Compose InteractiveComponentSize 48dp hit target, ListTokens 56dp row).",
    radiusGroupDescription:
      'Material 3 Expressive corner scale (Compose tokens at `ac364f3c`: 4px CornerExtraSmall control, 12px CornerMedium/CornerLarge container, 28px CornerExtraLarge modal; capsule buttons via `shape.corners.button: "full"`).',
    style: m3Style,
    designMd: {
      overview:
        "Material 3 Expressive (`material-web` v34.0.21 / Compose Material 3 1.5.0) built from the `#6750A4` baseline with tonal surface containers, Expressive Tone 30 `on*Container` roles, state-layer overlays, and Expressive spatial/effects springs.",
      elevation:
        "Tonal surface stepping plus Material Web Level 1–3 shadows and `material.android.elevation` (1dp/3dp/6dp), with `stroke.surface: 0px` and no backdrop blur.",
      dos: [
        "Express interaction states via M3 state-layer ink overlays (`hover: 0.08`, `focus: 0.10`, `pressed: 0.10`, `dragged: 0.16`) and Android press ripples (`state.ripple: true`) with `state.press-scale: 1`.",
        'Use `shape.curve: "circular"` and `controls: "material"` for top-rounded underlined fields and underlined tabs.',
        "Keep `stroke.surface: 0px` on tonal/elevated containers so depth comes from tonal steps and elevation.",
      ],
      donts: [
        "Do not add backdrop blur (`backdropFilter`) or surface borders (`stroke.surface > 0`) to M3 tonal surfaces.",
        "Do not replace `outline` focus rings (`3px` width, `2px` offset) with halo rings.",
      ],
    },
    cssVars: {
      theme: themeLevel(roles),
      light: roles.light,
      dark: roles.dark,
    },
    finishes: {
      light: finishes(toOklchText(scheme.light.surfaceContainerHigh)),
      dark: finishes(toOklchText(scheme.dark.surfaceContainerHigh)),
    },
    descriptions: {
      sharedColors: {
        scrim: "Translucent backdrop scrim behind modals and sheets (M3 scrim at 32% opacity).",
      },
      lightColors: colorDescs,
      darkColors: colorDescs,
      finishes: {
        card: "Elevated M3 card surface with Material Web Level 1 shadow and 1dp Android elevation.",
        section:
          "M3 ElevatedCard resting surface (Level 1 shadow and 1dp Android elevation, no border).",
        raised: "Raised surface with Level 1 shadow and 1dp Android elevation.",
        hover: "Hovered state surface over raised background with Level 1 shadow.",
        pressed: "Pressed surface at Level 1 elevation (M3 state layer + ripple handles press).",
        disabled: "M3 disabled filled/tonal button container (10% onSurface, flat with no shadow).",
        accentPressed: "M3 pressed accent surface (state layer + ripple handles press).",
        glass:
          "Floating surface using opaque M3 popover with Level 2 shadow and 3dp elevation (M3 uses no blur).",
        menu: "M3 menu/popover surface with Level 2 shadow and 3dp Android elevation.",
        modal:
          "M3 modal surface using SurfaceContainerHigh with Level 3 shadow and 6dp Android elevation.",
        grabber: "M3 bottom sheet drag handle (40% onSurfaceVariant).",
        tooltip: "M3 plain tooltip using inverse surface without shadow.",
        inverse: "M3 snackbar/inverse surface with Level 3 shadow and 6dp Android elevation.",
      },
      style: {
        typography:
          "Material 3 Expressive typography scale (TypeScaleTokens.kt / _md-sys-typescale.scss).",
        "dimension.stroke.surface":
          "0px surface outline (M3 elevated/filled surfaces rely on elevation rather than outlines).",
        "dimension.focus":
          "M3 focus indicator: 3px solid outline offset 2px (_md-sys-state-focus-indicator.scss).",
        "dimension.focus.offset": "2px outward focus indicator offset per M3.",
        shape: "M3 circular arc corners (ShapeTokens.kt).",
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking; M3 uses state layer + Android ripple).",
        "state.overlay":
          "M3 state-layer ink opacities: hover 0.08, focus 0.10, pressed 0.10, dragged 0.16 (StateTokens.kt).",
        "state.pressed-opacity":
          "Content stays full opacity when pressed (1; ripple/state layer shows press).",
        "state.disabled":
          "M3 disabled controls: 0.38 content opacity with fill: true (10% onSurface container, _md-comp-button-filled.scss).",
        "transition.enter":
          "M3 DurationLong2 (500ms) with emphasized-decelerate curve (_md-sys-motion.scss).",
        "motion.press":
          "M3 Expressive FastSpatial spring (stiffness 800, damping ratio 0.6; ExpressiveMotionTokens.kt).",
        "motion.settle": "M3 Expressive DefaultSpatial spring (stiffness 380, damping ratio 0.8).",
        "motion.control":
          "M3 Expressive DefaultEffects spring (stiffness 1600, damping ratio 1.0).",
        "motion.move": "M3 Expressive DefaultSpatial spring for layout and indicator movement.",
        controls: "Material 3 Expressive control geometry presets.",
      },
    },
  };
}
