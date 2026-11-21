/**
 * Fluent 2 (Windows 11) colour core for the `fluent` theme (#225).
 *
 * Sources (pinned in `.handoff/RESEARCH.md` §1):
 *   - Primary (wins): `microsoft/microsoft-ui-xaml` tag `winui3/release/2.7.0`
 *     (Windows App SDK 2.7.0, commit `1b5b1a0ccc05ce5c8b5931dc303666975b57f498`, 2026-11-17),
 *     specifically `src/controls/dev/CommonStyles/Common_themeresources_any.xaml`,
 *     `TeachingTip_themeresources.xaml`, and `ToolTip_themeresources.xaml`.
 *   - Secondary (guidance): `MicrosoftDocs/windows-dev-docs` (`docs` branch, `color.md`,
 *     `layering.md`, `materials.md`), `@fluentui/tokens` `1.0.0-alpha.24`
 *     (`microsoft/fluentui` commit `f47ce10d3350bbe7c70c323b0009c3f53bbfcc64`).
 *
 * WinUI stores colours as `#AARRGGBB` (often translucent). Each surface/text/stroke role is
 * composited opaque over the window base (`SolidBackgroundFillColorBase`: `#F3F3F3` light,
 * `#202020` dark) and emitted as canonical `oklch()` (`oklch.ts`). Alpha is retained only where
 * the role is an overlay or wash (`scrim`, `window-control-ink`, `window-control-edge`).
 *
 * WinUI XAML does not ship hex values for `SystemAccentColor*`; those are OS-supplied. The
 * default accent `#0078D4` uses Windows 11's default blue ramp (`#005FB8` light Dark1, `#60CDFF`
 * dark Light2 — unverified against WinUI XAML). Any other host-supplied accent derives its 6
 * tiers perceptually in OKLCH.
 */
import {
  oklchColor,
  oklchText,
  over,
  parseColor,
  rgbToOklch,
  toOklchText,
  withAlpha,
} from "./oklch";
import { ordered, orderedSplitFinishes } from "./order";

export type Appearance = "light" | "dark";

/** Windows' default `SystemAccentColor` (Fluent blue). */
export const FLUENT_DEFAULT_ACCENT = "#0078D4";

/**
 * Published WinUI 3 resource values (`#AARRGGBB` / `#RRGGBB`) verbatim from
 * `Common_themeresources_any.xaml` at `winui3/release/2.7.0` (`1b5b1a0ccc05ce5c8b5931dc303666975b57f498`).
 */
export interface WinuiResources {
  readonly TextFillColorPrimary: string;
  readonly TextFillColorSecondary: string;
  readonly TextFillColorTertiary: string;
  readonly TextFillColorDisabled: string;
  readonly TextFillColorInverse: string;
  readonly TextOnAccentFillColorPrimary: string;
  readonly ControlFillColorDefault: string;
  readonly ControlFillColorSecondary: string;
  readonly ControlFillColorTertiary: string;
  readonly ControlFillColorDisabled: string;
  readonly ControlFillColorInputActive: string;
  readonly ControlStrongFillColorDefault: string;
  readonly ControlSolidFillColorDefault: string;
  readonly ControlAltFillColorSecondary: string;
  readonly SubtleFillColorSecondary: string;
  readonly SubtleFillColorTertiary: string;
  readonly ControlStrokeColorDefault: string;
  readonly ControlStrokeColorSecondary: string;
  readonly ControlStrongStrokeColorDefault: string;
  readonly CardStrokeColorDefault: string;
  readonly DividerStrokeColorDefault: string;
  readonly SurfaceStrokeColorFlyout: string;
  readonly FocusStrokeColorOuter: string;
  readonly FocusStrokeColorInner: string;
  readonly CardBackgroundFillColorDefault: string;
  readonly LayerFillColorDefault: string;
  readonly SmokeFillColorDefault: string;
  readonly SolidBackgroundFillColorBase: string;
  readonly SolidBackgroundFillColorSecondary: string;
  readonly SolidBackgroundFillColorTertiary: string;
  readonly SolidBackgroundFillColorQuarternary: string;
  readonly SolidBackgroundFillColorQuinary: string;
  readonly SolidBackgroundFillColorSenary: string;
  readonly SystemFillColorSuccess: string;
  readonly SystemFillColorCaution: string;
  readonly SystemFillColorCritical: string;
  readonly SystemFillColorSuccessBackground: string;
  readonly SystemFillColorCautionBackground: string;
  readonly SystemFillColorCriticalBackground: string;
  readonly SystemFillColorAttentionBackground: string;
  readonly AccentFillColorDisabled: string;
  readonly ControlStrokeColorOnAccentDefault: string;
  readonly ControlStrokeColorOnAccentSecondary: string;
}

export const WINUI: Record<Appearance, WinuiResources> = {
  light: {
    TextFillColorPrimary: "#E4000000",
    TextFillColorSecondary: "#9E000000",
    TextFillColorTertiary: "#72000000",
    TextFillColorDisabled: "#5C000000",
    TextFillColorInverse: "#FFFFFF",
    TextOnAccentFillColorPrimary: "#FFFFFF",
    ControlFillColorDefault: "#B3FFFFFF",
    ControlFillColorSecondary: "#80F9F9F9",
    ControlFillColorTertiary: "#4DF9F9F9",
    ControlFillColorDisabled: "#4DF9F9F9",
    ControlFillColorInputActive: "#FFFFFF",
    ControlStrongFillColorDefault: "#72000000",
    ControlSolidFillColorDefault: "#FFFFFF",
    ControlAltFillColorSecondary: "#06000000",
    SubtleFillColorSecondary: "#09000000",
    SubtleFillColorTertiary: "#06000000",
    ControlStrokeColorDefault: "#0F000000",
    ControlStrokeColorSecondary: "#29000000",
    ControlStrongStrokeColorDefault: "#72000000",
    CardStrokeColorDefault: "#0F000000",
    DividerStrokeColorDefault: "#0F000000",
    SurfaceStrokeColorFlyout: "#0F000000",
    FocusStrokeColorOuter: "#E4000000",
    FocusStrokeColorInner: "#B3FFFFFF",
    CardBackgroundFillColorDefault: "#B3FFFFFF",
    LayerFillColorDefault: "#80FFFFFF",
    SmokeFillColorDefault: "#4D000000",
    SolidBackgroundFillColorBase: "#F3F3F3",
    SolidBackgroundFillColorSecondary: "#EEEEEE",
    SolidBackgroundFillColorTertiary: "#F9F9F9",
    SolidBackgroundFillColorQuarternary: "#FFFFFF",
    SolidBackgroundFillColorQuinary: "#FDFDFD",
    SolidBackgroundFillColorSenary: "#FFFFFF",
    SystemFillColorSuccess: "#0F7B0F",
    SystemFillColorCaution: "#9D5D00",
    SystemFillColorCritical: "#C42B1C",
    SystemFillColorSuccessBackground: "#DFF6DD",
    SystemFillColorCautionBackground: "#FFF4CE",
    SystemFillColorCriticalBackground: "#FDE7E9",
    SystemFillColorAttentionBackground: "#80F6F6F6",
    AccentFillColorDisabled: "#37000000",
    ControlStrokeColorOnAccentDefault: "#14FFFFFF",
    ControlStrokeColorOnAccentSecondary: "#66000000",
  },
  dark: {
    TextFillColorPrimary: "#FFFFFF",
    TextFillColorSecondary: "#C5FFFFFF",
    TextFillColorTertiary: "#87FFFFFF",
    TextFillColorDisabled: "#5DFFFFFF",
    TextFillColorInverse: "#E4000000",
    TextOnAccentFillColorPrimary: "#000000",
    ControlFillColorDefault: "#0FFFFFFF",
    ControlFillColorSecondary: "#15FFFFFF",
    ControlFillColorTertiary: "#08FFFFFF",
    ControlFillColorDisabled: "#0BFFFFFF",
    ControlFillColorInputActive: "#B31E1E1E",
    ControlStrongFillColorDefault: "#8BFFFFFF",
    ControlSolidFillColorDefault: "#454545",
    ControlAltFillColorSecondary: "#19000000",
    SubtleFillColorSecondary: "#0FFFFFFF",
    SubtleFillColorTertiary: "#0AFFFFFF",
    ControlStrokeColorDefault: "#12FFFFFF",
    ControlStrokeColorSecondary: "#18FFFFFF",
    ControlStrongStrokeColorDefault: "#8BFFFFFF",
    CardStrokeColorDefault: "#19000000",
    DividerStrokeColorDefault: "#15FFFFFF",
    SurfaceStrokeColorFlyout: "#33000000",
    FocusStrokeColorOuter: "#FFFFFF",
    FocusStrokeColorInner: "#B3000000",
    CardBackgroundFillColorDefault: "#0DFFFFFF",
    LayerFillColorDefault: "#4C3A3A3A",
    SmokeFillColorDefault: "#4D000000",
    SolidBackgroundFillColorBase: "#202020",
    SolidBackgroundFillColorSecondary: "#1C1C1C",
    SolidBackgroundFillColorTertiary: "#282828",
    SolidBackgroundFillColorQuarternary: "#2C2C2C",
    SolidBackgroundFillColorQuinary: "#333333",
    SolidBackgroundFillColorSenary: "#373737",
    SystemFillColorSuccess: "#6CCB5F",
    SystemFillColorCaution: "#FCE100",
    SystemFillColorCritical: "#FF99A4",
    SystemFillColorSuccessBackground: "#393D1B",
    SystemFillColorCautionBackground: "#433519",
    SystemFillColorCriticalBackground: "#442726",
    SystemFillColorAttentionBackground: "#08FFFFFF",
    AccentFillColorDisabled: "#28FFFFFF",
    ControlStrokeColorOnAccentDefault: "#14FFFFFF",
    ControlStrokeColorOnAccentSecondary: "#23000000",
  },
} as const;

/** WinUI's seven `SystemAccentColor*` tiers as canonical `oklch()` strings. */
export interface FluentAccent {
  base: string;
  light1: string;
  light2: string;
  light3: string;
  dark1: string;
  dark2: string;
  dark3: string;
}

/**
 * Windows 11's curated default blue (`#0078D4`) accent palette (unverified against WinUI XAML,
 * which reads `SystemAccentColor*` from the OS at runtime; `#005FB8` light / `#60CDFF` dark
 * are the decided defaults).
 */
const DEFAULT_BLUE_RAMP = {
  base: "#0078D4",
  light1: "#4CC2FF",
  light2: "#60CDFF",
  light3: "#99EBFF",
  dark1: "#005FB8",
  dark2: "#003E92",
  dark3: "#001A68",
} as const;

/** Convert WinUI `#AARRGGBB` or `#RRGGBB` hex into CSS `#RRGGBB` / `#RRGGBBAA` for `oklch.ts`. */
export function argbToCssHex(hex: string): string {
  const match = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!match) throw new Error(`expected #RRGGBB or #AARRGGBB, got ${hex}`);
  const digits = match[1]!;
  if (digits.length === 6) return `#${digits}`;
  const aa = digits.slice(0, 2);
  const rrggbb = digits.slice(2);
  return aa.toLowerCase() === "ff" ? `#${rrggbb}` : `#${rrggbb}${aa}`;
}

/** Composite a WinUI `#AARRGGBB` / `#RRGGBB` token over an opaque `#RRGGBB` surface as canonical `oklch()`. */
export function compositeWinui(winuiHex: string, surfaceHex: string): string {
  return over(argbToCssHex(winuiHex), surfaceHex);
}

/**
 * Derive WinUI's seven `SystemAccentColor*` tiers (`base`, `light1`..`light3`, `dark1`..`dark3`)
 * from `accent` (defaulting to `#0078D4`).
 *
 * For `#0078D4`, returns Windows 11's curated default blue ramp (`dark1` = `#005FB8`, `light2` =
 * `#60CDFF`). For any other host accent, steps lightness and tapers chroma in OKLCH using the
 * relative ratios of that ramp so hue and contrast progression stay consistent across inputs.
 */
export function fluentAccent(accent: string = FLUENT_DEFAULT_ACCENT): FluentAccent {
  const rgb = parseColor(accent);
  if (rgb.r === 0 && rgb.g === 120 && rgb.b === 212) {
    return {
      base: toOklchText(DEFAULT_BLUE_RAMP.base),
      light1: toOklchText(DEFAULT_BLUE_RAMP.light1),
      light2: toOklchText(DEFAULT_BLUE_RAMP.light2),
      light3: toOklchText(DEFAULT_BLUE_RAMP.light3),
      dark1: toOklchText(DEFAULT_BLUE_RAMP.dark1),
      dark2: toOklchText(DEFAULT_BLUE_RAMP.dark2),
      dark3: toOklchText(DEFAULT_BLUE_RAMP.dark3),
    };
  }

  const { l, c, h } = rgbToOklch(rgb);
  const base = oklchText({ r: rgb.r, g: rgb.g, b: rgb.b });
  // Relative OKLCH shifts matched to Windows 11's default blue ramp (`#0078D4` -> `#005FB8` / `#60CDFF`).
  const step = (targetL: number, chromaScale: number) =>
    toOklchText(oklchColor(targetL, c * chromaScale, h));

  return {
    base,
    light1: step(l + (1 - l) * 0.475, 0.81),
    light2: step(l + (1 - l) * 0.547, 0.73),
    light3: step(l + (1 - l) * 0.755, 0.51),
    dark1: step(l * 0.866, 0.96),
    dark2: step(l * 0.681, 0.9),
    dark3: step(l * 0.474, 0.83),
  };
}

/** Colour keys of `cssVars.theme` in `packages/theme/theme.json` (excludes non-colour keys: radii, fonts). */
export type FluentThemeRole =
  | "brand-fill"
  | "on-brand"
  | "scrim"
  | "media"
  | "on-media"
  | "chart-foreground"
  | "window-close"
  | "window-minimize"
  | "window-zoom"
  | "window-control-ink"
  | "window-control-edge";

/** Colour keys of `cssVars.light` and `cssVars.dark` in `packages/theme/theme.json`. */
export type FluentAppearanceRole =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "border"
  | "input"
  | "ring"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "sidebar"
  | "sidebar-foreground"
  | "sidebar-primary"
  | "sidebar-primary-foreground"
  | "sidebar-accent"
  | "sidebar-accent-foreground"
  | "sidebar-border"
  | "sidebar-ring"
  | "inset"
  | "raised"
  | "glass-edge"
  | "scrollbar-thumb"
  | "scrollbar-thumb-hover"
  | "field"
  | "line"
  | "hover"
  | "ring-halo"
  | "faint"
  | "brand"
  | "brand-edge"
  | "track"
  | "knob"
  | "code"
  | "info"
  | "warn"
  | "up"
  | "down"
  | "brand-tint"
  | "on-brand-tint"
  | "inverse"
  | "inverse-foreground"
  | "inverse-muted"
  | "inverse-brand"
  | "info-tint"
  | "warn-tint"
  | "destructive-tint"
  | "up-tint"
  | "down-tint"
  | "violet"
  | "window-control-off";

export interface FluentRoles {
  theme: Record<FluentThemeRole, string>;
  light: Record<FluentAppearanceRole, string>;
  dark: Record<FluentAppearanceRole, string>;
}

// Judgement call: WinUI has no purple accent-independent data series or macOS window controls;
// keep the library's `theme.json` values for `violet` and `window-control-off` (RESEARCH §2.2).
const LIBRARY_KEPT = {
  light: {
    violet: "oklch(0.5339 0.1647 289.689)",
    windowControlOff: "oklch(0.89535 0.00406 286.317)",
  },
  dark: {
    violet: "oklch(0.76787 0.13219 294.446)",
    windowControlOff: "oklch(0.40108 0.01081 264.446)",
  },
} as const;

function buildAppearance(
  appearance: Appearance,
  tiers: FluentAccent,
): Record<FluentAppearanceRole, string> {
  const w = WINUI[appearance];
  const base = w.SolidBackgroundFillColorBase;
  const onBase = (hex: string) => compositeWinui(hex, base);

  const background = toOklchText(base);
  const foreground = onBase(w.TextFillColorPrimary);
  // WinUI `AccentFillColorDefault`: `SystemAccentColorDark1` in light, `SystemAccentColorLight2` in dark.
  const primary = appearance === "light" ? tiers.dark1 : tiers.light2;
  const primaryForeground = onBase(w.TextOnAccentFillColorPrimary);
  const secondary = onBase(w.ControlFillColorDefault);
  const mutedForeground = onBase(w.TextFillColorSecondary);
  const accent = onBase(w.SubtleFillColorSecondary);
  const destructive = onBase(w.SystemFillColorCritical);
  const ring = onBase(w.FocusStrokeColorOuter);
  const divider = onBase(w.DividerStrokeColorDefault);
  const inset = onBase(w.ControlAltFillColorSecondary);
  const controlStrong = onBase(w.ControlStrongFillColorDefault);
  const warn = onBase(w.SystemFillColorCaution);
  const up = onBase(w.SystemFillColorSuccess);
  const destructiveTint = onBase(w.SystemFillColorCriticalBackground);
  // Judgement call: 10% accent wash composited opaque over the window base (RESEARCH §2.2).
  const brandTint = over(withAlpha(primary, 0.1), background);

  return {
    background,
    foreground,
    // Judgement call: composite translucent `CardBackgroundFillColorDefault` over base (RESEARCH §2.2).
    card: onBase(w.CardBackgroundFillColorDefault),
    "card-foreground": foreground,
    // Judgement call: solid `SolidBackgroundFillColorQuarternary` stand-in for platform Acrylic flyouts.
    popover: onBase(w.SolidBackgroundFillColorQuarternary),
    "popover-foreground": foreground,
    primary,
    "primary-foreground": primaryForeground,
    secondary,
    "secondary-foreground": foreground,
    // Judgement call: `SolidBackgroundFillColorSecondary` as recessed neutral surface (no WinUI "muted").
    muted: onBase(w.SolidBackgroundFillColorSecondary),
    "muted-foreground": mutedForeground,
    accent,
    "accent-foreground": foreground,
    destructive,
    border: onBase(w.ControlStrokeColorDefault),
    // Judgement call: `ControlStrongStrokeColorDefault` (CheckBox/Radio/Switch outline).
    input: onBase(w.ControlStrongStrokeColorDefault),
    ring,
    // Judgement call: chart-1 uses accent; chart-2..4 reuse semantic status tones; chart-5 uses strong fill.
    "chart-1": primary,
    "chart-2": up,
    "chart-3": warn,
    "chart-4": destructive,
    "chart-5": controlStrong,
    // Judgement call: NavigationView pane is transparent over the Mica window base.
    sidebar: background,
    "sidebar-foreground": foreground,
    "sidebar-primary": primary,
    "sidebar-primary-foreground": primaryForeground,
    "sidebar-accent": accent,
    "sidebar-accent-foreground": foreground,
    "sidebar-border": divider,
    "sidebar-ring": ring,
    inset,
    raised: secondary,
    "glass-edge": onBase(w.SurfaceStrokeColorFlyout),
    "scrollbar-thumb": controlStrong,
    "scrollbar-thumb-hover": controlStrong,
    field: secondary,
    line: divider,
    hover: onBase(w.ControlFillColorSecondary),
    "ring-halo": onBase(w.FocusStrokeColorInner),
    faint: onBase(w.TextFillColorTertiary),
    brand: primary,
    // Judgement call: accent button bottom elevation stroke (`ControlStrokeColorOnAccentSecondary`).
    "brand-edge": onBase(w.ControlStrokeColorOnAccentSecondary),
    track: inset,
    knob: mutedForeground,
    // Judgement call: `code` is monospaced text inside inset wells (`theme-roles.md`), so it uses
    // `TextFillColorPrimary` (matching `apple.ts` / `shadcn.ts` / `solid-glass.ts`) rather than
    // RESEARCH §2.2's `#EEEEEE`/`#1C1C1C` which copied `muted` and would be illegible on `inset`.
    code: foreground,
    info: primary,
    warn,
    up,
    down: destructive,
    "brand-tint": brandTint,
    // Judgement call: `on-brand-tint` uses `TextFillColorPrimary` (`InfoBar` message/title text on
    // tinted backgrounds; guarantees >= 4.5 contrast across arbitrary host accents).
    "on-brand-tint": foreground,
    // Judgement call: WinUI ToolTip/TeachingTip keep the app's polarity; `TeachingTipBackgroundBrush`
    // publishes `SolidBackgroundFillColorTertiary` (`TeachingTip_themeresources.xaml`), distinct
    // from `popover` (`SolidBackgroundFillColorQuarternary`).
    inverse: onBase(w.SolidBackgroundFillColorTertiary),
    // Judgement call: both `ToolTipForegroundBrush` and `TeachingTipForegroundBrush` use
    // `TextFillColorPrimaryBrush`; secondary ink (`inverse-muted`) uses `TextFillColorSecondary`.
    "inverse-foreground": foreground,
    "inverse-muted": mutedForeground,
    // `Toast`'s action uses `buttonLook("default")` (`finish.accent` = `{primary}`), so its
    // label (`colors.inverseBrand`) uses `TextOnAccentFillColorPrimary` (matching `apple` / `default`).
    "inverse-brand": primaryForeground,
    "info-tint": onBase(w.SystemFillColorAttentionBackground),
    "warn-tint": onBase(w.SystemFillColorCautionBackground),
    "destructive-tint": destructiveTint,
    "up-tint": onBase(w.SystemFillColorSuccessBackground),
    "down-tint": destructiveTint,
    violet: LIBRARY_KEPT[appearance].violet,
    "window-control-off": LIBRARY_KEPT[appearance].windowControlOff,
  };
}

/**
 * Compute every colour role of `packages/theme/theme.json` (`theme`, `light`, `dark`) as canonical
 * `oklch()` strings for Fluent 2, with optional host-supplied `SystemAccentColor`.
 */
export function fluentRoles(accent: string = FLUENT_DEFAULT_ACCENT): FluentRoles {
  const tiers = fluentAccent(accent);
  const light = buildAppearance("light", tiers);
  const dark = buildAppearance("dark", tiers);

  return {
    theme: {
      // Judgement call: `cssVars.theme` is appearance-independent; `brand-fill` / `on-brand` use
      // light's primary pair (`AccentFillColorDefault` Dark1 + `TextOnAccentFillColorPrimary`),
      // matching `packages/theme/theme.json` where `brand-fill` matches light `primary`.
      "brand-fill": light.primary,
      "on-brand": light["primary-foreground"],
      // Overlay scrim retains alpha (`SmokeFillColorDefault` #4D000000, identical in light & dark).
      scrim: toOklchText(argbToCssHex(WINUI.light.SmokeFillColorDefault)),
      // Judgement call: library-shared media backdrop and ink (WinUI has no counterpart).
      media: "oklch(0.1869 0.0151 266.766)",
      "on-media": toOklchText("#FFFFFF"),
      // Judgement call: dark ink on light chart tiles uses light `foreground` (as `shadcn.ts` does).
      "chart-foreground": light.foreground,
      // Judgement call: macOS traffic lights kept from library `theme.json` (no WinUI counterpart).
      "window-close": toOklchText("#FF5F57"),
      "window-minimize": toOklchText("#FEBC2E"),
      "window-zoom": toOklchText("#28C840"),
      "window-control-ink": withAlpha("#000000", 0.5),
      "window-control-edge": withAlpha("#000000", 0.12),
    },
    light,
    dark,
  };
}

const alias = (token: string) => `{${token}}`;
const flat = (color: string) => `linear-gradient(180deg, ${color} 0%, ${color} 100%)`;

/** Fluent 2 / WinUI elevation shadows mapped onto Fluent Web ambient + key shadow levels in black ink. */
const shadow2 = (appearance: Appearance) => {
  const [ambient, key] = appearance === "light" ? [0.12, 0.14] : [0.24, 0.28];
  return `0 0 2px ${oklchColor(0, 0, 0, ambient)}, 0 1px 2px ${oklchColor(0, 0, 0, key)}`;
};
const shadow8 = (appearance: Appearance) => {
  const [ambient, key] = appearance === "light" ? [0.12, 0.14] : [0.24, 0.28];
  return `0 0 2px ${oklchColor(0, 0, 0, ambient)}, 0 4px 8px ${oklchColor(0, 0, 0, key)}`;
};
const shadow16 = (appearance: Appearance) => {
  const [ambient, key] = appearance === "light" ? [0.12, 0.14] : [0.24, 0.28];
  return `0 0 2px ${oklchColor(0, 0, 0, ambient)}, 0 8px 16px ${oklchColor(0, 0, 0, key)}`;
};
const shadow28 = (appearance: Appearance) => {
  const [ambient, key] = appearance === "light" ? [0.2, 0.24] : [0.4, 0.48];
  return `0 0 8px ${oklchColor(0, 0, 0, ambient)}, 0 14px 28px ${oklchColor(0, 0, 0, key)}`;
};
const shadow64 = (appearance: Appearance) => {
  const [ambient, key] = appearance === "light" ? [0.2, 0.24] : [0.4, 0.48];
  return `0 0 8px ${oklchColor(0, 0, 0, ambient)}, 0 32px 64px ${oklchColor(0, 0, 0, key)}`;
};

const surface = (
  color: string,
  {
    boxShadow = "none",
    borderColor = "transparent",
    material = null,
  }: {
    boxShadow?: string;
    borderColor?: string;
    material?: { windows: { backdrop: "blur" } } | null;
  } = {},
) => ({
  backgroundColor: color,
  backgroundImage: flat(color),
  boxShadow,
  borderColor,
  material,
});

/**
 * Shared theme-level tokens (`cssVars.theme`) for Fluent 2: WinUI `ControlCornerRadius` (4 px) for
 * controls/fields/chips/in-page insets, `OverlayCornerRadius` (8 px) for cards/overlays/dialogs/sheets,
 * Segoe UI Variable + Cascadia Mono fonts, and Fluent colour tokens from `fluentRoles`.
 */
function themeLevel(roles: FluentRoles): Record<string, string> {
  return {
    radius: "4px",
    "radius-card": "8px",
    "radius-control": "4px",
    "radius-field": "4px",
    "radius-chip": "4px",
    "radius-overlay": "8px",
    "radius-dialog": "8px",
    "radius-sheet": "8px",
    "font-mono": "Cascadia Mono, Consolas, monospace",
    ...roles.theme,
    "font-sans": "Segoe UI Variable, Segoe UI, sans-serif",
  };
}

/**
 * All 23 finish roles for Fluent 2 (`{token}` references; `glass` and `menu` ask Windows for
 * `{ windows: { backdrop: "blur" } }` as the Acrylic stand-in).
 */
function finishes(appearance: Appearance): Record<string, Record<string, unknown>> {
  const controlShadow = shadow2(appearance);
  const flyoutShadow = shadow28(appearance);
  const blurMaterial = { windows: { backdrop: "blur" as const } };
  return {
    card: {
      backgroundImage: flat(alias("card")),
      boxShadow: shadow8(appearance),
      material: null,
    },
    inset: { boxShadow: "none", material: null },
    field: { boxShadow: "none", material: null },
    raised: surface(alias("raised"), { boxShadow: controlShadow, borderColor: alias("border") }),
    hover: surface(alias("hover"), { boxShadow: controlShadow, borderColor: alias("border") }),
    pressed: surface(alias("muted"), { boxShadow: "none", borderColor: alias("border") }),
    light: surface(alias("primary"), { boxShadow: "none", borderColor: alias("brand-edge") }),
    accent: surface(alias("primary"), { boxShadow: "none", borderColor: alias("brand-edge") }),
    track: { boxShadow: "none", borderColor: alias("input"), material: null },
    fill: {
      backgroundColor: "transparent",
      backgroundImage: flat(alias("primary")),
      boxShadow: "none",
      borderColor: "transparent",
      material: null,
    },
    knob: surface(alias("knob")),
    knobOn: surface(alias("primary-foreground")),
    handle: surface(alias("popover"), { boxShadow: controlShadow, borderColor: alias("border") }),
    pill: surface(alias("raised"), { boxShadow: "none", borderColor: alias("border") }),
    thumb: surface(alias("popover"), { boxShadow: controlShadow, borderColor: alias("border") }),
    on: surface(alias("brand-tint"), { boxShadow: "none", borderColor: alias("border") }),
    chip: surface(alias("raised"), { boxShadow: "none", borderColor: alias("border") }),
    glass: {
      backgroundColor: "oklch(from {popover} l c h / 0.85)",
      boxShadow: flyoutShadow,
      borderColor: alias("glass-edge"),
      backdropFilter: "blur(30px)",
      material: blurMaterial,
    },
    menu: {
      backgroundColor: alias("popover"),
      boxShadow: flyoutShadow,
      borderColor: alias("glass-edge"),
      material: blurMaterial,
    },
    dialog: {
      backgroundColor: alias("background"),
      boxShadow: shadow64(appearance),
      borderColor: alias("glass-edge"),
      material: null,
    },
    tooltip: {
      backgroundColor: alias("inverse"),
      boxShadow: shadow16(appearance),
      borderColor: alias("glass-edge"),
      material: null,
    },
    inverse: {
      backgroundColor: alias("inverse"),
      boxShadow: flyoutShadow,
      borderColor: alias("glass-edge"),
      material: null,
    },
    groove: { boxShadow: "none", material: null },
  };
}

/** Fluent 2 / WinUI 3 style groups (`semantics.json`); verified values in `docs/specs/native-themes.md` §3.2. */
export const fluentStyle = {
  type: {
    family: "{font-sans}",
    caption: {
      size: { pointer: 12, touch: 12 },
      line: { pointer: 16, touch: 16 },
      weight: "400",
      tracking: 0,
    },
    detail: {
      size: { pointer: 12, touch: 12 },
      line: { pointer: 16, touch: 16 },
      weight: "400",
      tracking: 0,
    },
    body: {
      size: { pointer: 14, touch: 14 },
      line: { pointer: 20, touch: 20 },
      weight: "400",
      tracking: 0,
    },
    label: {
      size: { pointer: 14, touch: 14 },
      line: { pointer: 20, touch: 20 },
      weight: "400",
      tracking: 0,
    },
    title: {
      size: { pointer: 14, touch: 14 },
      line: { pointer: 20, touch: 20 },
      weight: "600",
      tracking: 0,
    },
    headline: {
      size: { pointer: 20, touch: 20 },
      line: { pointer: 28, touch: 28 },
      weight: "600",
      tracking: 0,
    },
    display: {
      size: { pointer: 28, touch: 28 },
      line: { pointer: 36, touch: 36 },
      weight: "600",
      tracking: 0,
    },
  },
  shape: {
    control: "{radius-control}",
    field: "{radius-field}",
    chip: "{radius-chip}",
    card: "{radius-card}",
    overlay: "{radius-overlay}",
    dialog: "{radius-dialog}",
    sheet: "{radius-sheet}",
    inset: "{radius}",
    curve: "circular",
    corners: { field: "all" },
  },
  size: {
    hit: { pointer: 0, touch: 40 },
    density: {
      pointer: { row: 32, pad: 16, gap: 8, surface: 4 },
      touch: { row: 40, pad: 16, gap: 8, surface: 8 },
    },
    control: {
      pointer: {
        row: 32,
        padding: 6,
        gap: 8,
        control: 20,
        corner: 4,
        check: 12,
        dot: 12,
        tabs: 32,
        line: 32,
        clear: 16,
        switch: "regular",
      },
      touch: {
        row: 40,
        padding: 8,
        gap: 8,
        control: 20,
        corner: 4,
        check: 12,
        dot: 12,
        tabs: 40,
        line: 40,
        clear: 20,
        switch: "regular",
      },
    },
    height: { pointer: { sm: 24, md: 32, lg: 40 }, touch: { sm: 32, md: 40, lg: 48 } },
  },
  stroke: { hairline: 1, surface: 1, control: 1, indicator: 3 },
  focus: { style: "double", width: 2, offset: 0 },
  state: {
    pressScale: 1,
    overlay: { hover: 0, focus: 0, pressed: 0, dragged: 0 },
    ripple: false,
    pressedOpacity: 1,
    disabled: { content: 0.36, container: 0.45 },
  },
  motion: {
    // WinUI 3 / Fluent 2 timing durations and curves (`motion.md`, `Common_themeresources_any.xaml`).
    press: { duration: 83, easing: "easy-ease" },
    settle: { duration: 250, easing: "decelerate" },
    control: { duration: 167, easing: "point-to-point" },
    move: { duration: 333, easing: "point-to-point" },
    enter: { duration: 250, easing: "decelerate" },
    shake: { duration: 500 },
  },
  icon: {
    size: {
      pointer: { sm: 12, md: 16, lg: 20 },
      touch: { sm: 16, md: 20, lg: 24 },
    },
  },
  indicator: { tabs: "underline", nav: "bar", field: "underline" },
};

/** Both theme files for Fluent 2, in the key order of the default ones. */
export function fluentThemeFiles(
  defaults: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
    lightFinishes: Record<string, Record<string, unknown>>;
    darkFinishes: Record<string, Record<string, unknown>>;
  },
  accent: string = FLUENT_DEFAULT_ACCENT,
) {
  const roles = fluentRoles(accent);
  return {
    theme: {
      name: "Fluent",
      cssVars: {
        theme: ordered(defaults.theme, themeLevel(roles)),
        light: ordered(defaults.light, roles.light),
        dark: ordered(defaults.dark, roles.dark),
      },
    },
    semantics: {
      ...fluentStyle,
      finishes: orderedSplitFinishes(
        defaults.lightFinishes,
        defaults.darkFinishes,
        finishes("light"),
        finishes("dark"),
      ),
    },
  };
}
