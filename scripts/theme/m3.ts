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
import { finishes, shadows } from "./finishes/material";
import { oklchColor, toOklchText } from "./oklch";
import { reduceColours, type ColourOrigin, type ColourScheme } from "./sources";

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

/**
 * The slots M3 states for its own controls (`docs/specs/theme-slots.md`): an underlined field, an
 * outlined choice, a tinted groove, and a switch that grows its knob rather than fading its track.
 */
const m3Field = {
  "field.edge.sides": false,
  "field.edge.bottom": "color:mutedForeground",
  "field.corner.bottom": 0,
  "field.focus.line": true,
  // M3's focus indicator: 2dp over the field's own 1dp line (_md-comp-filled-text-field.scss).
  "field.focus.width": 2,
} as const;

const m3Choice = {
  "choice.size": { pointer: 20, touch: 20 },
  // M3's checkbox container is 18dp whatever the platform (SliderTokens/CheckboxTokens).
  "choice.box": { pointer: 18, touch: 18 },
  "choice.corner": { pointer: 2, touch: 2 },
  "choice.face": "none",
  "choice.shade": "none",
  // M3 fills a checked box with Primary, edge and all (CheckboxTokens.SelectedContainerColor).
  "choice.checked.face": "color:primary",
  "choice.edge.width": 2,
  "choice.mark.size": { pointer: 10, touch: 10 },
  "choice.edge.colour": "color:mutedForeground",
  // M3 outlines a box the same way whether it can be used or not: only the mark fades.
  "choice.edge.disabled": "color:mutedForeground",
  // M3 states 40dp (CheckboxTokens.StateLayerSize); 32 keeps the hover halo from crowding the row.
  "choice.halo": 32,
} as const;

/** M3's switch: a 40×24 track whose knob grows in place (the library's circle is M3's handle). */
const m3Switch = {
  "switch.width": { pointer: 40, touch: 52 },
  "switch.height": { pointer: 24, touch: 32 },
  // M3 publishes one switch size: its small one states the same numbers.
  "switch.small.width": { pointer: 40, touch: 52 },
  "switch.small.height": { pointer: 24, touch: 32 },
  "switch.small.knob.width": { pointer: 16, touch: 16 },
  "switch.small.knob.height": { pointer: 16, touch: 16 },
  "switch.edge.off": { pointer: 1, touch: 2 },
  "switch.edge.on": 0,
  "switch.knob.width": { pointer: 16, touch: 16 },
  "switch.knob.height": { pointer: 16, touch: 16 },
  "switch.knob.on.width": { pointer: 20, touch: 24 },
  "switch.knob.on.height": { pointer: 20, touch: 24 },
  "switch.knob.hover": { pointer: 16, touch: 16 },
  "switch.knob.pressed.width": { pointer: 22, touch: 28 },
  "switch.knob.pressed.height": { pointer: 22, touch: 28 },
  "switch.feedback": "expand",
} as const;

/** M3's groove: a tinted bar with no edge, and no spinner ring around it. */
const m3Track = {
  // The inactive run is SecondaryContainer, not a wash of Primary: SliderTokens.InactiveTrackColor.
  "slider.face": "color:secondary",
  "slider.knob.face": "color:primary",
  "slider.shade": "none",
  "slider.edge.colour": "none",
  "slider.edge.width": 0,
  "progress.height": 4,
  "progress.line": 0,
  "progress.face": "color:secondary",
  "progress.shade": "none",
  "progress.edge.colour": "none",
  "progress.edge.width": 0,
  "spinner.opacity": 0,
} as const;

const tintMix = (token: string) => `color-mix(in srgb, var(--${token}) 12%, transparent)`;

/** The choices the derived keys make (ADR 0007 §4): the hairline is M3's weak outline, a field's edge the strong one. */
const colourScheme: ColourScheme = {
  tint: 12,
  ring: "primary",
  field: "muted",
  knob: ["border", "border"],
  secondaryIsRaised: false,
  raised: "card",
  strongBorder: true,
  inverse: ["foreground", "background"],
  chart: ["primary", "up", "warn", "destructive", "muted-foreground"],
};

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
    field: c(p.surfaceContainerHighest),
    line: c(p.outlineVariant),
    hover: "color-mix(in srgb, var(--foreground) 8%, transparent)",
    faint: c(p.outline),
    brand: "var(--primary)",
    "brand-edge": c(p.outlineVariant),
    // M3 draws no second ring: the line inside the focus ring is the surface M3 pairs with it.
    "focus-inner": "var(--card)",
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
  };
}

/** Where each colour the theme states comes from (ADR 0012 §4): its M3 system colour. */
const origin: ColourOrigin = {
  spec: "Material 3 sys.color",
  names: {
    border: "outline",
    accent: "secondaryContainer",
    inset: "surfaceContainer",
    track: "surfaceContainerHighest",
    popover: "surfaceContainer",
    field: "surfaceContainerHighest",
    raised: "surfaceContainerLow",
    knob: "outline",
    input: "outline",
    ring: "secondary",
    "brand-edge": "outlineVariant",
    "focus-inner": "surface (the ring's inner line is the surface)",
    "inverse-brand": "inversePrimary",
    inverse: "inverseSurface",
    "inverse-foreground": "inverseOnSurface",
    "chart-1": "primary",
    "chart-2": "tertiary",
    "chart-3": "secondary",
    "chart-4": "outline",
    "chart-5": "outlineVariant",
    "secondary-foreground": "onSecondaryContainer",
    "accent-foreground": "onSecondaryContainer",
    "brand-tint": "secondaryContainer",
    "destructive-tint": "errorContainer",
    hover: "onSurface at 8% over transparent",
  },
};

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

/**
 * Shared theme-level tokens (`cssVars.theme`) for Material 3 Expressive: M3 Compose tokens at
 * `ac364f3c` (`CornerExtraSmall` 4dp, `CornerLarge` / medium container 12dp, `CornerExtraLarge`
 * 28dp; capsule buttons use `shape.corners.button: "full"`), and M3 colour
 * tokens from `m3Roles`.
 */
function themeLevel(roles: M3Roles): Record<string, string> {
  return {
    radius: "4px",
    "radius-control": "4px",
    "radius-container": "12px",
    "radius-modal": "28px",
    ...roles.theme,
  };
}

/** Material 3 Expressive style groups (`semantics.json`); verified values in `docs/specs/native-themes.md` §3.2. */
export const m3Style = {
  typography: {
    caption: {
      fontWeight: 500,
      letterSpacing: 0.5,
    },
    detail: {
      fontWeight: 400,
      letterSpacing: 0.4,
    },
    body: {
      fontWeight: 400,
      letterSpacing: 0.25,
    },
    label: {
      fontWeight: 500,
      letterSpacing: 0.1,
    },
    title: {
      fontWeight: 500,
      letterSpacing: 0.15,
    },
    headline: {
      fontWeight: 400,
      letterSpacing: 0,
    },
    display: {
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
      hit: { pointer: 0, touch: 48 },
      density: {
        pointer: { pad: 16, gap: 12 },
        touch: { pad: 16, gap: 12 },
      },
      // M3 menus: the row's fill spans the menu (no horizontal inset), its text 12dp in.
      item: {
        pointer: { inset: 0, pad: 12 },
        touch: { inset: 0, pad: 12 },
      },
      control: {
        // M3 spacing steps: 8 inside a control, 12 beside it; a radio's dot is 10dp.
        pointer: { padding: 8, gap: 8, dot: 10, switch: "regular" },
        touch: { padding: 8, gap: 8, dot: 10, switch: "regular" },
      },
      // Desktop runs a step below the touch scale; M3's own numbers stay on touch
      // (docs/decisions/0003-material-desktop-tier.md).
      height: { pointer: { sm: 24, md: 32, lg: 40 }, touch: { sm: 32, md: 40, lg: 56 } },
    },
    stroke: { hairline: 1, control: 1 },
    focus: { style: "outline", width: 3, offset: 2 },
    icon: {
      // A desktop's glyphs keep the base scale (12/16/20); M3's own 16/20/24 stay on touch.
      pointer: { sm: 12, md: 16, lg: 20 },
      touch: { sm: 16, md: 20, lg: 24 },
    },
  },
  slots: {
    // M3's own controls (docs/specs/theme-contract-v2.md §11, docs/specs/theme-slots.md):
    // an underlined text field, outlined radios and checkboxes, a tinted track and groove, a
    // switch that only grows its knob, and a disabled control that turns over to the disabled
    // finish instead of fading (M3's 4×44 bar was a stray line in the app, #367).
    ...m3Field,
    ...m3Choice,
    ...m3Switch,
    ...m3Track,
    // A popup keeps ExtraSmall corners (4dp) inside a shape scale whose container is 12dp.
    "popup.corner": "control",
    // A segmented strip draws its own outline on the surface: its track has no ground of its own.
    "tabs.track.face": "none",
    // M3 containers are edge-free: a sunk well is its ground, not a line.
    "well.edge": "none",
    // Every M3 button is a capsule, whatever its size.
    "button.corner.sm": "full",
    "button.corner.md": "full",
    "button.corner.lg": "full",
    "state.disabled.face": "finish:disabled",
    "state.disabled.ink": "finish:disabled:foreground",
    "state.disabled.edge": "finish:disabled:border-color",
  },
  shape: {
    curve: "circular",
    corners: {
      button: "full" as const,
    },
  },
  state: {
    // M3 presses with a state layer, not by sinking.
    "press-scale": 1,
    overlay: { hover: 0.08, focus: 0.1, pressed: 0.1, dragged: 0.16 },
    "pressed-opacity": 1,
    "rest-opacity": 0.38,
    disabled: { content: 0.38 },
  },
  transition: {
    enter: { duration: 500, timingFunction: "emphasized-decelerate" },
  },
  motion: {
    // M3 duration and easing tokens, named by speed (`_md-sys-motion.scss`): Short3 (150) for
    // small components reacting, Medium1 (250) for a press or a thumb that moves, Medium4 (400)
    // for a panel that settles.
    fast: { duration: 150, timingFunction: "standard" },
    default: { duration: 250, timingFunction: "standard" },
    slow: { duration: 400, timingFunction: "emphasized-decelerate" },
    // M3 states fade with Short2 and the standard curve (`MotionTokens.DurationShort2`,
    // `Easing.StandardCubicBezier`; ExpressiveMotionTokens.kt).
    state: { duration: 100, timingFunction: "standard" },
  },
};

/** Material 3 Expressive theme data and DTCG descriptions ready for `emitDtcgTheme`. */
export function m3DtcgOutput(seed?: string): ThemeGeneratorOutput {
  const scheme = m3Scheme(seed);
  const roles = m3Roles(scheme);
  const reduced = {
    light: reduceColours(roles.light, origin, colourScheme, "light"),
    dark: reduceColours(roles.dark, origin, colourScheme, "dark"),
  };
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
    border:
      "Hairline container border color (M3 outline: one step stronger than outlineVariant, which reads too faint at 1dp).",
    input: "Input outline color (M3 outline).",
    ring: "Focus indicator ring color (M3 primary, the role M3 draws its focus indicator in).",
    "chart-1": "First chart series color (M3 primary).",
    "chart-2": "Second chart series color (the theme's positive `up` tone).",
    "chart-3": "Third chart series color (the theme's `warn` tone).",
    "chart-4": "Fourth chart series color (M3 error).",
    "chart-5": "Fifth chart series color (M3 onSurfaceVariant).",
    sidebar: "Sidebar canvas background (M3 surface).",
    "sidebar-accent": "Sidebar active item fill (M3 secondaryContainer).",
    "sidebar-accent-foreground":
      "Sidebar active item text ink (M3 Expressive onSecondaryContainer).",
    "sidebar-border": "Sidebar divider border (M3 outlineVariant).",
    inset: "Inset container surface (M3 surfaceContainer).",
    raised: "Raised control surface (M3 surfaceContainerLow).",
    field: "Filled text field background (M3 surfaceContainerHighest).",
    line: "Inset divider hairline (M3 outlineVariant).",
    hover: "M3 hover state-layer ink (8% foreground over transparent, StateTokens.kt).",
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
      "Material 3 Expressive desktop pointer input-tier overrides: control heights one step below the touch scale (24, 32, 40dp), glyphs 12, 16, 20dp, no hit padding (docs/decisions/0003-material-desktop-tier.md).",
    touchDescription:
      "Material 3 Expressive touch input-tier overrides (Compose InteractiveComponentSize 48dp hit target, ListTokens 56dp row).",
    radiusGroupDescription:
      'Material 3 Expressive corner scale (Compose tokens at `ac364f3c`: 4px CornerExtraSmall control, 12px CornerMedium/CornerLarge container, 28px CornerExtraLarge modal; capsule buttons via `shape.corners.button: "full"`).',
    style: m3Style,
    designMd: {
      overview:
        "Material 3 Expressive (`material-web` v34.0.21 / Compose Material 3 1.5.0) built from the `#6750A4` baseline with tonal surface containers, Expressive Tone 30 `on*Container` roles, state-layer overlays, and M3 duration and easing motion.",
      elevation:
        "Tonal surface stepping plus Material Web Level 1–3 shadows and `material.android.elevation` (1dp/3dp/6dp), no backdrop blur, and a line only where a well or a channel states one (`inset`, `channel`): every other finish draws no edge (`border-color: transparent`).",
      dos: [
        "Express interaction states via M3 state-layer ink overlays (`hover: 0.08`, `focus: 0.10`, `pressed: 0.10`, `dragged: 0.16`) with `state.press-scale: 1`.",
        'Use `shape.curve: "circular"` with top-rounded underlined fields and underlined tabs.',
        "Keep tonal and elevated containers edge-free through `border-color: transparent` in the finish, so depth comes from tonal steps and elevation; a well or channel keeps its hairline.",
      ],
      donts: [
        "Do not add backdrop blur (`backdropFilter`) or a surface edge (`border-color`) to M3 tonal surfaces.",
        "Do not replace `outline` focus rings (`3px` width, `2px` offset) with halo rings.",
      ],
    },
    colourSources: {
      light: reduced.light.provenance,
      dark: reduced.dark.provenance,
    },
    cssVars: {
      theme: themeLevel(roles),
      light: reduced.light.colours,
      dark: reduced.dark.colours,
    },
    finishes,
    shadows,
    descriptions: {
      sharedColors: {
        scrim: "Translucent backdrop scrim behind modals and sheets (M3 scrim at 32% opacity).",
      },
      lightColors: colorDescs,
      darkColors: colorDescs,
      style: {
        "dimension.size.item":
          "Material 3 menu rows: the fill spans the menu's width (inset 0; a DropdownMenuItem takes no horizontal margin) and the text sits 12dp in (DropdownMenuItemHorizontalPadding, androidx compose material3 Menu.kt).",
        typography: "Material 3 Expressive type weights; sizes follow the shared scale (ADR 0009).",
        "dimension.focus":
          "M3 focus indicator: 3px solid outline offset 2px (_md-sys-state-focus-indicator.scss).",
        "dimension.focus.offset": "2px outward focus indicator offset per M3.",
        slots:
          "M3 control slots: a text field that keeps only its bottom line (_md-comp-filled-text-field.scss), outlined selection controls, tinted tracks, and a box that fades its mark rather than its edge when disabled (docs/specs/theme-contract-v2.md §11).",
        shape: "M3 circular arc corners (ShapeTokens.kt).",
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking; M3 uses the state layer).",
        "state.overlay":
          "M3 state-layer ink opacities: hover 0.08, focus 0.10, pressed 0.10, dragged 0.16 (StateTokens.kt).",
        "state.pressed-opacity":
          "Content stays full opacity when pressed (1; the state layer shows press).",
        "state.disabled":
          "M3 disabled controls: 0.38 content opacity, the disabled finish as their face (10% onSurface container) and its foreground as their ink (_md-comp-button-filled.scss).",
        "transition.enter":
          "M3 DurationLong2 (500ms) with emphasized-decelerate curve (_md-sys-motion.scss).",
        "motion.fast":
          "M3 DurationShort3 (150ms) with the standard curve for control state (_md-sys-motion.scss).",
        "motion.default":
          "M3 DurationMedium1 (250ms) with the standard curve for presses and movement.",
        "motion.slow":
          "M3 DurationMedium4 (400ms) with the emphasized-decelerate curve for settling and panels.",
        "motion.state":
          "M3 DurationShort2 (100ms) with the standard curve (MotionTokens.DurationShort2, Easing.StandardCubicBezier; ExpressiveMotionTokens.kt).",
        "pointer.dimension.size.height":
          "Desktop control heights one step below the touch scale (24, 32, 40dp against M3's 32, 40, 56dp): the library's own desktop sizing, not an M3 density step (docs/decisions/0003-material-desktop-tier.md).",
      },
    },
  };
}
