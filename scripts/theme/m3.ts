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
    sidebar: c(p.surface),
    "sidebar-foreground": "var(--foreground)",
    "sidebar-primary": "var(--primary)",
    "sidebar-primary-foreground": "var(--primary-foreground)",
    "sidebar-accent": c(p.secondaryContainer),
    "sidebar-accent-foreground": c(p.onSecondaryContainer),
    "sidebar-border": c(p.outlineVariant),
    "sidebar-ring": "var(--ring)",
    inset: c(p.surfaceContainer),
    raised: c(p.surfaceContainerLow),
    "glass-edge": c(p.outlineVariant),
    "scrollbar-thumb": "color-mix(in srgb, var(--muted-foreground) 50%, var(--background))",
    "scrollbar-thumb-hover": "color-mix(in srgb, var(--muted-foreground) 80%, var(--background))",
    field: c(p.surfaceContainerHighest),
    line: c(p.outlineVariant),
    hover: "color-mix(in srgb, var(--foreground) 8%, transparent)",
    "ring-halo": "color-mix(in srgb, var(--ring) 20%, transparent)",
    faint: c(p.outline),
    brand: "var(--primary)",
    "brand-edge": c(p.outlineVariant),
    track: c(p.surfaceContainerHighest),
    knob: c(p.outline),
    code: "var(--foreground)",
    info: c(p.primary),
    warn: toOklchText(NSH_EXTENSIONS.warn[appearance]),
    up: toOklchText(NSH_EXTENSIONS.up[appearance]),
    down: "var(--destructive)",
    // M3 paints selected chips/tiles/buttons with opaque SecondaryContainer; `on-brand-tint` uses
    // the matching OnSecondaryContainer ink per RESEARCH §2.2 & §5.1.
    "brand-tint": c(p.secondaryContainer),
    "on-brand-tint": c(p.onSecondaryContainer),
    inverse: c(p.inverseSurface),
    "inverse-foreground": c(p.inverseOnSurface),
    "inverse-brand": c(p.inversePrimary),
    "info-tint": tintMix("info"),
    "warn-tint": tintMix("warn"),
    "destructive-tint": c(p.errorContainer),
    "up-tint": tintMix("up"),
    "down-tint": tintMix("down"),
    violet: c(p.tertiary),
    "window-control-off": c(p.outlineVariant),
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
      "brand-fill": "var(--primary)",
      "on-brand": "var(--primary-foreground)",
      scrim: oklchColor(0, 0, 0, 0.32),
      media: toOklchText(NSH_EXTENSIONS.media),
      "on-media": toOklchText("#FFFFFF"),
      "chart-foreground": toOklchText(scheme.light.onSurface),
      "window-close": toOklchText(scheme.light.error),
      "window-minimize": toOklchText(NSH_EXTENSIONS.warn.light),
      "window-zoom": toOklchText(NSH_EXTENSIONS.up.light),
      "window-control-ink": `color-mix(in srgb, ${oklchColor(0, 0, 0)} 50%, transparent)`,
      "window-control-edge": `color-mix(in srgb, ${oklchColor(0, 0, 0)} 12%, transparent)`,
    },
    light: appearanceRoles(scheme.light, "light"),
    dark: appearanceRoles(scheme.dark, "dark"),
  };
}
