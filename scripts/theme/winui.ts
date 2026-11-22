/**
 * WinUI 3 (Windows 11 / Fluent 2) colour core and style metrics for the `winui` theme (#240).
 *
 * Baseline sources:
 *   - Primary (wins): `microsoft/microsoft-ui-xaml` tag `winui3/release/2.7.0`
 *     (Windows App SDK v2.7.0, commit `1b5b1a0ccc05ce5c8b5931dc303666975b57f498`, 2026-11-17),
 *     `Common_themeresources_any.xaml`, `AcrylicBrush_themeresources.xaml`,
 *     `ContentDialog_themeresources.xaml`, `ToolTip_themeresources.xaml`,
 *     `TeachingTip_themeresources.xaml`, `ToggleSwitch_themeresources.xaml`,
 *     `CornerRadius_themeresources.xaml`, `TextBlock_themeresources.xaml`.
 *   - Official sample app: `microsoft/WinUI-Gallery` (`6de91fec`).
 *   - Windows Design Guidance: `MicrosoftDocs/windows-dev-docs` (`color.md`, `typography.md`,
 *     `geometry.md`, `layering.md`, `shadows.md`, `materials.md`, `motion.md`).
 *
 * WinUI stores colours as `#AARRGGBB` (often translucent). Each surface/text/stroke role is
 * composited opaque over the window base (`SolidBackgroundFillColorBase`: `#F3F3F3` light,
 * `#202020` dark) — except `brand-edge`, which composites `ControlStrokeColorOnAccentSecondary`
 * over the accent fill `primary` — and emitted as canonical `oklch()` (`oklch.ts`). Alpha is
 * retained only where the role is an overlay or wash (`scrim`, `window-control-ink`,
 * `window-control-edge`).
 *
 * WinUI XAML does not ship hex values for `SystemAccentColor*`; those come from the OS
 * `UISettings` at runtime. The default accent `#0078D4` uses Windows 11's default blue ramp
 * (`#005FB8` light Dark1, `#003E92` light Dark2, `#60CDFF` dark Light2, `#99EBFF` dark Light3).
 * Any other host-supplied accent derives its 6 tiers perceptually in OKLCH.
 */
import type { ThemeGeneratorOutput } from "./dtcg";
import {
  oklchColor,
  oklchText,
  over,
  parseColor,
  rgbToOklch,
  toOklchText,
  withAlpha,
} from "./oklch";

export type Appearance = "light" | "dark";

/** Windows' default `SystemAccentColor` (Windows 11 blue). */
export const WINUI_DEFAULT_ACCENT = "#0078D4";

/**
 * Published WinUI 3 resource values (`#AARRGGBB` / `#RRGGBB`) verbatim from
 * `Common_themeresources_any.xaml` and `AcrylicBrush_themeresources.xaml` at
 * `winui3/release/2.7.0` (`1b5b1a0ccc05ce5c8b5931dc303666975b57f498`).
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
  readonly SurfaceStrokeColorDefault: string;
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
  readonly AcrylicInAppFillColorDefaultFallback: string;
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
    SurfaceStrokeColorDefault: "#66757575",
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
    AcrylicInAppFillColorDefaultFallback: "#F9F9F9",
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
    SurfaceStrokeColorDefault: "#66757575",
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
    AcrylicInAppFillColorDefaultFallback: "#2C2C2C",
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
export interface WinuiAccent {
  base: string;
  light1: string;
  light2: string;
  light3: string;
  dark1: string;
  dark2: string;
  dark3: string;
}

/**
 * Windows 11's default blue (`#0078D4`) accent ramp from OS runtime `UISettings`
 * (not published as static hexes in `microsoft-ui-xaml`).
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

/** Composite a WinUI `#AARRGGBB` / `#RRGGBB` token over an opaque `#RRGGBB` or `oklch()` surface as canonical `oklch()`. */
export function compositeWinui(winuiHex: string, surface: string): string {
  return over(argbToCssHex(winuiHex), surface);
}

/**
 * Derive WinUI's seven `SystemAccentColor*` tiers (`base`, `light1`..`light3`, `dark1`..`dark3`)
 * from `accent` (defaulting to `#0078D4`).
 *
 * For `#0078D4`, returns Windows 11's default blue ramp (`dark1` = `#005FB8`, `dark2` = `#003E92`,
 * `light2` = `#60CDFF`, `light3` = `#99EBFF`). For any other host accent, steps lightness and
 * tapers chroma in OKLCH using the relative ratios of that ramp.
 */
export function winuiAccent(accent: string = WINUI_DEFAULT_ACCENT): WinuiAccent {
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
export type WinuiThemeRole =
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
export type WinuiAppearanceRole =
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

export interface WinuiRoles {
  theme: Record<WinuiThemeRole, string>;
  light: Record<WinuiAppearanceRole, string>;
  dark: Record<WinuiAppearanceRole, string>;
}

// Library-shared values with no WinUI counterpart (`violet` data series and `window-control-off`
// used by `title-bar.tsx` macOS traffic lights).
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
  tiers: WinuiAccent,
): Record<WinuiAppearanceRole, string> {
  const w = WINUI[appearance];
  const base = w.SolidBackgroundFillColorBase;
  const onBase = (hex: string) => compositeWinui(hex, base);

  const background = toOklchText(base);
  const foreground = onBase(w.TextFillColorPrimary);
  // WinUI `AccentFillColorDefault`: `SystemAccentColorDark1` in light, `SystemAccentColorLight2` in dark.
  const primary = appearance === "light" ? tiers.dark1 : tiers.light2;
  // WinUI `AccentTextFillColorPrimary`: `SystemAccentColorDark2` in light, `SystemAccentColorLight3` in dark
  // (`Common_themeresources_any.xaml:93,297`), used for `brand` (accent text, links, icons, lines).
  const brand = appearance === "light" ? tiers.dark2 : tiers.light3;
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
  // 10% accent wash composited opaque over the window base (no WinUI resource equivalent).
  const brandTint = over(withAlpha(primary, 0.1), background);

  return {
    background,
    foreground,
    card: onBase(w.CardBackgroundFillColorDefault),
    "card-foreground": foreground,
    // `AcrylicInAppFillColorDefaultBrush` fallback (`AcrylicBrush_themeresources.xaml:44,96`).
    popover: toOklchText(w.AcrylicInAppFillColorDefaultFallback),
    "popover-foreground": foreground,
    primary,
    "primary-foreground": primaryForeground,
    secondary,
    "secondary-foreground": foreground,
    // `SolidBackgroundFillColorSecondary` as recessed neutral surface (no WinUI "muted").
    muted: onBase(w.SolidBackgroundFillColorSecondary),
    "muted-foreground": mutedForeground,
    accent,
    "accent-foreground": foreground,
    destructive,
    border: onBase(w.ControlStrokeColorDefault),
    // `ControlStrongStrokeColorDefault` (CheckBox/Radio/Switch outline).
    input: onBase(w.ControlStrongStrokeColorDefault),
    ring,
    "chart-1": primary,
    "chart-2": up,
    "chart-3": warn,
    "chart-4": destructive,
    "chart-5": controlStrong,
    // `NavigationViewExpandedPaneBackground` is transparent over the window base.
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
    brand,
    // `ControlStrokeColorOnAccentSecondary` (bottom bevel of `AccentControlElevationBorderBrush`)
    // composited over the accent fill `primary`, not over the base background.
    "brand-edge": compositeWinui(w.ControlStrokeColorOnAccentSecondary, primary),
    track: inset,
    knob: mutedForeground,
    code: foreground,
    // `SystemFillColorAttentionBrush`: `SystemAccentColor` (`#0078D4`) in light, `SystemAccentColorLight2` in dark.
    info: appearance === "light" ? tiers.base : tiers.light2,
    warn,
    up,
    down: destructive,
    "brand-tint": brandTint,
    "on-brand-tint": foreground,
    // Non-transient `TeachingTipBackgroundBrush` (`SolidBackgroundFillColorTertiary`,
    // `TeachingTip_themeresources.xaml:9,31`); `tooltip` finish uses Acrylic `{popover}` instead.
    inverse: onBase(w.SolidBackgroundFillColorTertiary),
    "inverse-foreground": foreground,
    "inverse-muted": mutedForeground,
    // `Toast`'s action uses `buttonLook("default")` (`finish.accent` = `{primary}`).
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
 * `oklch()` strings for WinUI 3, with optional host-supplied `SystemAccentColor`.
 */
export function winuiRoles(accent: string = WINUI_DEFAULT_ACCENT): WinuiRoles {
  const tiers = winuiAccent(accent);
  const light = buildAppearance("light", tiers);
  const dark = buildAppearance("dark", tiers);

  return {
    theme: {
      // `brand-fill` / `on-brand` follow the appearance's primary pair (`AccentFillColorDefault` +
      // `TextOnAccentFillColorPrimary`): white on Dark1 in light, black on Light2 in dark.
      "brand-fill": "var(--primary)",
      "on-brand": "var(--primary-foreground)",
      // Overlay scrim retains alpha (`SmokeFillColorDefault` #4D000000, identical in light & dark).
      scrim: toOklchText(argbToCssHex(WINUI.light.SmokeFillColorDefault)),
      media: "oklch(0.1869 0.0151 266.766)",
      "on-media": toOklchText("#FFFFFF"),
      "chart-foreground": light.foreground,
      // `packages/ui/title-bar.tsx` draws macOS traffic lights from `windowControls` regardless of
      // theme, so the library-shared traffic-light tones stay (Class B gap under #235).
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

/**
 * Two-layer ambient + key CSS shadow derived from WinUI 3 layering depths (`layering.md`,
 * `shadows.md`: control 2, card 8, tooltip 16, flyout/menu/glass 32, dialog 128) using the
 * two-layer ambient + key formula (`depth <= 16`: ambient 2px at 0.12/0.24, key `depth/2` `depth`
 * at 0.14/0.28; `depth > 16`: ambient 8px at 0.2/0.4, key `depth/2` `depth` at 0.24/0.48).
 * Approximates WinUI's dynamic 3D `ThemeShadow` in CSS.
 */
const elevationShadow = (depth: 2 | 8 | 16 | 32 | 128, appearance: Appearance) => {
  const [ambientBlur, ambient, key] =
    depth <= 16
      ? appearance === "light"
        ? [2, 0.12, 0.14]
        : [2, 0.24, 0.28]
      : appearance === "light"
        ? [8, 0.2, 0.24]
        : [8, 0.4, 0.48];
  return `0 0 ${ambientBlur}px ${oklchColor(0, 0, 0, ambient)}, 0 ${depth / 2}px ${depth}px ${oklchColor(0, 0, 0, key)}`;
};

const surface = (
  color: string,
  {
    shadow = "none",
    "border-color": borderColor = "transparent",
    material = null,
  }: {
    shadow?: string;
    "border-color"?: string;
    material?: { windows: { backdrop: "blur" } } | null;
  } = {},
) => ({
  background: color,
  gradient: flat(color),
  shadow,
  "border-color": borderColor,
  material,
});

/**
 * Shared theme-level tokens (`cssVars.theme`) for WinUI 3: `ControlCornerRadius` (4 px) for
 * controls/fields/chips/in-page insets, `OverlayCornerRadius` (8 px) for cards/overlays/dialogs/sheets,
 * Segoe UI Variable + Consolas fonts, and WinUI 3 colour tokens from `winuiRoles`.
 */
function themeLevel(roles: WinuiRoles): Record<string, string> {
  return {
    radius: "4px",
    "radius-card": "8px",
    "radius-control": "4px",
    "radius-field": "4px",
    "radius-chip": "4px",
    "radius-overlay": "8px",
    "radius-dialog": "8px",
    "radius-sheet": "8px",
    "font-mono": "Consolas, monospace",
    ...roles.theme,
    "font-sans": "Segoe UI Variable, Segoe UI, sans-serif",
  };
}

/**
 * All 23 finish roles for WinUI 3 (`{token}` references; `glass`, `menu`, and `tooltip` ask
 * Windows for `{ windows: { backdrop: "blur" } }` as the Acrylic stand-in).
 */
function finishes(appearance: Appearance): Record<string, Record<string, unknown>> {
  const controlShadow = elevationShadow(2, appearance);
  const flyoutShadow = elevationShadow(32, appearance);
  const blurMaterial = { windows: { backdrop: "blur" as const } };
  // `ContentDialogBorderBrush` -> `SurfaceStrokeColorDefault` (`#66757575` composited on base;
  // flyouts keep `glass-edge` / `SurfaceStrokeColorFlyout`).
  const dialogBorder = compositeWinui(
    WINUI[appearance].SurfaceStrokeColorDefault,
    WINUI[appearance].SolidBackgroundFillColorBase,
  );
  // `AcrylicInAppFillColorDefaultBrush` `TintLuminosityOpacity`: 0.85 light / 0.96 dark.
  // Light TintColor `#FCFCFC` is approximated via `{popover}` (`#F9F9F9` fallback) so `glass` stays token-linked.
  const glassOpacity = appearance === "light" ? 0.85 : 0.96;
  return {
    card: {
      gradient: flat(alias("card")),
      shadow: elevationShadow(8, appearance),
      material: null,
    },
    inset: { shadow: "none", material: null },
    field: { shadow: "none", material: null },
    raised: surface(alias("raised"), { shadow: controlShadow, "border-color": alias("border") }),
    hover: surface(alias("hover"), { shadow: controlShadow, "border-color": alias("border") }),
    pressed: surface(alias("muted"), { shadow: "none", "border-color": alias("border") }),
    light: surface(alias("primary"), { shadow: "none", "border-color": alias("brand-edge") }),
    accent: surface(alias("primary"), { shadow: "none", "border-color": alias("brand-edge") }),
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
    handle: surface(alias("popover"), { shadow: controlShadow, "border-color": alias("border") }),
    pill: surface(alias("raised"), { shadow: "none", "border-color": alias("border") }),
    thumb: surface(alias("popover"), { shadow: controlShadow, "border-color": alias("border") }),
    on: surface(alias("brand-tint"), { shadow: "none", "border-color": alias("border") }),
    chip: surface(alias("raised"), { shadow: "none", "border-color": alias("border") }),
    glass: {
      background: `oklch(from {popover} l c h / ${glassOpacity})`,
      shadow: flyoutShadow,
      "border-color": alias("glass-edge"),
      backdropFilter: "blur(30px)",
      material: blurMaterial,
    },
    menu: {
      background: alias("popover"),
      shadow: flyoutShadow,
      "border-color": alias("glass-edge"),
      material: blurMaterial,
    },
    dialog: {
      background: alias("background"),
      shadow: elevationShadow(128, appearance),
      "border-color": dialogBorder,
      material: null,
    },
    tooltip: {
      background: alias("popover"),
      shadow: elevationShadow(16, appearance),
      "border-color": alias("glass-edge"),
      material: blurMaterial,
    },
    inverse: {
      background: alias("inverse"),
      shadow: flyoutShadow,
      "border-color": alias("glass-edge"),
      material: null,
    },
    groove: { shadow: "none", material: null },
  };
}

/** WinUI 3 style groups (`semantics.json`); verified values in `docs/specs/native-themes.md` §3.2. */
export const winuiStyle = {
  typography: {
    fontFamily: "{font-sans}",
    caption: {
      fontSize: { pointer: 12, touch: 12 },
      lineHeight: { pointer: 16 / 12, touch: 16 / 12 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    detail: {
      fontSize: { pointer: 12, touch: 12 },
      lineHeight: { pointer: 16 / 12, touch: 16 / 12 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    body: {
      fontSize: { pointer: 14, touch: 14 },
      lineHeight: { pointer: 20 / 14, touch: 20 / 14 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    label: {
      fontSize: { pointer: 14, touch: 14 },
      lineHeight: { pointer: 20 / 14, touch: 20 / 14 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    title: {
      fontSize: { pointer: 14, touch: 14 },
      lineHeight: { pointer: 20 / 14, touch: 20 / 14 },
      fontWeight: 600,
      letterSpacing: 0,
    },
    headline: {
      fontSize: { pointer: 20, touch: 20 },
      lineHeight: { pointer: 28 / 20, touch: 28 / 20 },
      fontWeight: 600,
      letterSpacing: 0,
    },
    display: {
      fontSize: { pointer: 28, touch: 28 },
      lineHeight: { pointer: 36 / 28, touch: 36 / 28 },
      fontWeight: 600,
      letterSpacing: 0,
    },
  },
  dimension: {
    shape: {
      control: "{radius-control}",
      field: "{radius-field}",
      chip: "{radius-chip}",
      card: "{radius-card}",
      overlay: "{radius-overlay}",
      dialog: "{radius-dialog}",
      sheet: "{radius-sheet}",
      inset: "{radius}",
    },
    size: {
      hit: { pointer: 0, touch: 40 },
      density: {
        // Standard WinUI `ListViewItemMinHeight` = 40 (`ListViewItem_themeresources.xaml:14`).
        pointer: { row: 40, pad: 16, gap: 8, surface: 4 },
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
    icon: {
      pointer: { sm: 12, md: 16, lg: 20 },
      touch: { sm: 16, md: 20, lg: 24 },
    },
  },
  shape: {
    curve: "circular",
    corners: { field: "all" },
  },
  state: {
    "press-scale": 1,
    overlay: { hover: 0, focus: 0, pressed: 0, dragged: 0 },
    ripple: false,
    "pressed-opacity": 1,
    // NSH cross-mode single-scalar compromise (WinUI uses per-brush disabled fills:
    // `ControlFillColorDisabled` 0.302 L / 0.043 D; `AccentFillColorDisabled` 0.216 L / 0.157 D;
    // `TitleBarDeactivatedOpacity` 0.5).
    disabled: { content: 0.36, container: 0.45 },
  },
  duration: { shake: 500 },
  transition: {
    enter: { duration: 250, timingFunction: "decelerate" },
  },
  motion: {
    // WinUI 3 timing durations and curves (`motion.md`, `Common_themeresources_any.xaml:602-606`,
    // `ToggleSwitch_themeresources.xaml:321`).
    press: { duration: 83, timingFunction: "decelerate" },
    settle: { duration: 250, timingFunction: "decelerate" },
    control: { duration: 167, timingFunction: "point-to-point" },
    move: { duration: 333, timingFunction: "point-to-point" },
  },
  indicator: { tabs: "underline", nav: "bar", field: "underline" },
};

/** WinUI 3 (Windows 11 / Fluent 2) theme data and DTCG descriptions ready for `emitDtcgTheme`. */
export function winuiDtcgOutput(accent: string = WINUI_DEFAULT_ACCENT): ThemeGeneratorOutput {
  const roles = winuiRoles(accent);
  const colorDescs = {
    background: "Window base surface (WinUI SolidBackgroundFillColorBase).",
    foreground: "Primary text and icon ink (WinUI TextFillColorPrimary composited over base).",
    card: "Elevated card background (WinUI CardBackgroundFillColorDefault composited over base).",
    "card-foreground": "Primary ink on card surfaces (WinUI TextFillColorPrimary).",
    popover:
      "Acrylic flyout/popover fallback surface (WinUI AcrylicInAppFillColorDefaultFallback).",
    "popover-foreground": "Primary ink on popover surfaces (WinUI TextFillColorPrimary).",
    primary:
      "Accent button fill (WinUI AccentFillColorDefault: Dark1 light / Light2 dark from SystemAccentColor).",
    "primary-foreground": "Ink on accent fills (WinUI TextOnAccentFillColorPrimary).",
    secondary: "Standard control fill (WinUI ControlFillColorDefault composited over base).",
    "secondary-foreground": "Ink on secondary controls (WinUI TextFillColorPrimary).",
    muted:
      "Recessed neutral surface (WinUI SolidBackgroundFillColorSecondary composited over base).",
    "muted-foreground": "Secondary label ink (WinUI TextFillColorSecondary composited over base).",
    accent: "Subtle list/menu hover fill (WinUI SubtleFillColorSecondary composited over base).",
    "accent-foreground": "Ink on subtle accent fills (WinUI TextFillColorPrimary).",
    destructive: "Critical/error status ink (WinUI SystemFillColorCritical).",
    border:
      "Standard control hairline border (WinUI ControlStrokeColorDefault composited over base).",
    input:
      "Input and check control outline (WinUI ControlStrongStrokeColorDefault composited over base).",
    ring: "Outer keyboard focus stroke (WinUI FocusStrokeColorOuter).",
    "chart-1": "First chart series color matching WinUI primary accent.",
    "chart-2": "Second chart series color (WinUI SystemFillColorSuccess).",
    "chart-3": "Third chart series color (WinUI SystemFillColorCaution).",
    "chart-4": "Fourth chart series color (WinUI SystemFillColorCritical).",
    "chart-5": "Fifth chart series color (WinUI ControlStrongFillColorDefault).",
    sidebar: "NavigationView expanded pane background matching window base.",
    "sidebar-foreground": "Sidebar primary ink (WinUI TextFillColorPrimary).",
    "sidebar-primary": "Sidebar primary accent matching AccentFillColorDefault.",
    "sidebar-primary-foreground": "Sidebar primary ink matching TextOnAccentFillColorPrimary.",
    "sidebar-accent": "Sidebar active item fill (WinUI SubtleFillColorSecondary).",
    "sidebar-accent-foreground": "Sidebar active item ink (WinUI TextFillColorPrimary).",
    "sidebar-border": "Sidebar separator stroke (WinUI DividerStrokeColorDefault).",
    "sidebar-ring": "Sidebar focus stroke (WinUI FocusStrokeColorOuter).",
    inset: "Inset well fill (WinUI ControlAltFillColorSecondary composited over base).",
    raised: "Raised control fill (WinUI ControlFillColorDefault composited over base).",
    "glass-edge":
      "Flyout and acrylic border (WinUI SurfaceStrokeColorFlyout composited over base).",
    "scrollbar-thumb": "Static scrollbar thumb color (WinUI ControlStrongFillColorDefault).",
    "scrollbar-thumb-hover": "Static scrollbar hover color (WinUI ControlStrongFillColorDefault).",
    field: "Text input surface (WinUI ControlFillColorDefault composited over base).",
    line: "Hairline divider stroke (WinUI DividerStrokeColorDefault).",
    hover: "Pointer hover fill (WinUI ControlFillColorSecondary composited over base).",
    "ring-halo": "Inner keyboard focus stroke (WinUI FocusStrokeColorInner composited over base).",
    faint: "Tertiary label ink (WinUI TextFillColorTertiary composited over base).",
    brand:
      "Accent text/link/icon ink (WinUI AccentTextFillColorPrimary: Dark2 light / Light3 dark).",
    "brand-edge":
      "Accent button bottom bevel stroke (WinUI ControlStrokeColorOnAccentSecondary composited over primary).",
    track: "Switch and slider track (WinUI ControlAltFillColorSecondary).",
    knob: "Unchecked switch thumb (WinUI TextFillColorSecondary).",
    code: "Inline code ink (WinUI TextFillColorPrimary).",
    info: "Informational semantic color (WinUI SystemFillColorAttentionBrush).",
    warn: "Caution semantic color (WinUI SystemFillColorCaution).",
    up: "Success semantic color (WinUI SystemFillColorSuccess).",
    down: "Negative trend color matching WinUI SystemFillColorCritical.",
    "brand-tint": "10% accent wash composited opaque over window base.",
    "on-brand-tint": "Ink on brand-tint surfaces (WinUI TextFillColorPrimary).",
    inverse:
      "TeachingTip/toast surface (WinUI SolidBackgroundFillColorTertiary composited over base).",
    "inverse-foreground": "Ink on inverse surface (WinUI TextFillColorPrimary).",
    "inverse-muted": "Secondary ink on inverse surface (WinUI TextFillColorSecondary).",
    "inverse-brand": "Action ink on inverse surface matching TextOnAccentFillColorPrimary.",
    "info-tint":
      "Informational wash (WinUI SystemFillColorAttentionBackground composited over base).",
    "warn-tint": "Caution wash (WinUI SystemFillColorCautionBackground composited over base).",
    "destructive-tint":
      "Critical wash (WinUI SystemFillColorCriticalBackground composited over base).",
    "up-tint": "Success wash (WinUI SystemFillColorSuccessBackground composited over base).",
    "down-tint":
      "Negative trend wash (WinUI SystemFillColorCriticalBackground composited over base).",
    violet: "Library-retained violet data-series hue (no WinUI equivalent).",
    "window-control-off":
      "Library-retained unfocused window traffic-light fill (no WinUI equivalent).",
  };

  return {
    id: "winui",
    name: "WinUI 3",
    resolverDescription: "WinUI 3 theme (Windows 11 / Fluent 2, winui3/release/2.7.0).",
    themeDescription:
      "Appearance-invariant base tokens and WinUI 3 style overrides (Segoe UI Variable, Consolas, double focus rings, timing motion).",
    finishesDescription:
      "Appearance-invariant surface finish recipes for WinUI 3 (Windows backdrop blur on glass/menu/tooltip).",
    lightDescription:
      "Light appearance colors and ThemeShadow/Acrylic finish overrides for WinUI 3 (composited over SolidBackgroundFillColorBase #F3F3F3).",
    darkDescription:
      "Dark appearance colors and ThemeShadow/Acrylic finish overrides for WinUI 3 (composited over SolidBackgroundFillColorBase #202020).",
    pointerDescription:
      "WinUI 3 desktop pointer input-tier overrides (Standard 40px ListViewItemMinHeight, 32px controls, 12/16/20px icons).",
    touchDescription:
      "WinUI 3 touch input-tier overrides (40px hit target and controls, 16/20/24px icons).",
    radiusGroupDescription:
      "WinUI 3 corner radius scale: ControlCornerRadius 4px (controls/fields/chips/insets) and OverlayCornerRadius 8px (cards/overlays/dialogs/sheets).",
    style: winuiStyle,
    designMd: {
      overview:
        "WinUI 3 / Fluent 2 (`winui3/release/2.7.0`): Windows 11 fill and stroke resources composited over `SolidBackgroundFillColorBase` (`#F3F3F3` light / `#202020` dark) with `#0078D4` accent, `Segoe UI Variable` + `Consolas`, double focus strokes, and deterministic timing curves.",
      elevation:
        "WinUI 3 ThemeShadow depths (2/8/16/32/128) paired with composited `ControlStrokeColorDefault` / `SurfaceStrokeColorDefault` borders and `material.windows` blur on `glass`, `menu`, and `tooltip` (`AcrylicInAppFillColorDefault` 0.85 light / 0.96 dark).",
      dos: [
        'Use `4px` `ControlCornerRadius` for controls/fields/chips/insets and `8px` `OverlayCornerRadius` for cards/overlays/dialogs/sheets with `shape.curve: "circular"`.',
        'Use `focus.style: "double"` (2px outer `FocusStrokeColorOuter` + 1px inner `FocusStrokeColorInner`) and WinUI timing motion (`decelerate` / `point-to-point`).',
        "Use `indicator` `underline` tabs/fields and leading `bar` navigation indicators with `Segoe UI Variable` (`{font.family.sans}`).",
      ],
      donts: [
        "Do not substitute continuous squircle corners or spring physics for WinUI 3's circular corners and timing curves.",
      ],
    },
    cssVars: {
      theme: themeLevel(roles),
      light: roles.light,
      dark: roles.dark,
    },
    finishes: {
      light: finishes("light"),
      dark: finishes("dark"),
    },
    descriptions: {
      sharedColors: {
        "brand-fill":
          "Primary brand action fill, aliased to {color.primary} (WinUI AccentFillColorDefault).",
        "on-brand":
          "Foreground text and icons on brand-fill surfaces, aliased to {color.primary-foreground} (WinUI TextOnAccentFillColorPrimary).",
        scrim:
          "Translucent backdrop scrim behind dialogs and overlays (WinUI SmokeFillColorDefault #4D000000).",
        "chart-foreground":
          "Dark ink on light chart tiles matching WinUI light TextFillColorPrimary.",
        "window-control-ink":
          "Glyph ink inside macOS window traffic-light buttons (50% black literal).",
        "window-control-edge":
          "Hairline border around macOS window traffic-light buttons (12% black literal).",
      },
      lightColors: colorDescs,
      darkColors: colorDescs,
      finishes: {
        card: "WinUI 3 card surface with layering depth-8 two-layer ThemeShadow approximation.",
        raised:
          "WinUI 3 standard control surface with depth-2 shadow and ControlStrokeColorDefault.",
        hover: "WinUI 3 hovered control surface with depth-2 shadow and ControlStrokeColorDefault.",
        pressed: "WinUI 3 pressed control surface with muted fill and no shadow.",
        handle: "WinUI 3 slider handle using popover fill, depth-2 shadow, and border.",
        thumb: "WinUI 3 segmented thumb using popover fill, depth-2 shadow, and border.",
        on: "WinUI 3 selected pill/tile using opaque brand-tint fill and border.",
        glass:
          "WinUI 3 AcrylicInApp surface with per-appearance TintLuminosityOpacity (0.85 light / 0.96 dark), depth-32 shadow, and Windows blur backdrop.",
        menu: "WinUI 3 Acrylic flyout/menu surface with depth-32 shadow and Windows blur backdrop.",
        dialog:
          "WinUI 3 ContentDialog surface with depth-128 shadow and composited SurfaceStrokeColorDefault border.",
        tooltip:
          "WinUI 3 ToolTip surface with depth-16 shadow, glass-edge border, and Windows blur backdrop.",
        inverse: "WinUI 3 TeachingTip/toast surface with depth-32 shadow and glass-edge border.",
      },
      style: {
        "font.family.mono": "WinUI 3 monospace font stack (Consolas, monospace).",
        "font.family.sans":
          "WinUI 3 primary UI font stack (Segoe UI Variable, Segoe UI, sans-serif; typography.md).",
        typography:
          "WinUI 3 typography scale mapped from TextBlock_themeresources.xaml (400 and 600 weights only).",
        "dimension.stroke.indicator": "3px active navigation/tab indicator width per WinUI 3.",
        "dimension.focus":
          "WinUI 3 double focus stroke (2px outer FocusStrokeColorOuter + 1px inner FocusStrokeColorInner, 0px offset).",
        "dimension.focus.width": "2px outer focus stroke width per WinUI 3.",
        shape: "Circular corner curve (WinUI 3 has no continuous squircle curve; geometry.md).",
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking; WinUI 3 swaps fill brushes instead).",
        "state.pressed-opacity":
          "Content stays full opacity when pressed (1; fill brush swap shows press).",
        "state.disabled":
          "WinUI 3 disabled opacities (0.36 TextFillColorDisabled content, 0.45 container compromise).",
        "transition.enter":
          "WinUI 3 250ms entrance transition with Direct Entrance decelerate curve (motion.md).",
        "motion.press":
          "WinUI 3 ToggleSwitch press timing (83ms decelerate, ToggleSwitch_themeresources.xaml:321).",
        "motion.settle": "WinUI 3 250ms settle timing with Direct Entrance decelerate curve.",
        "motion.control": "WinUI 3 167ms control timing with Point-to-Point curve.",
        "motion.move": "WinUI 3 333ms move timing with Point-to-Point curve.",
        indicator:
          "WinUI 3 underlined tabs, NavigationView leading bar, and bottom-underlined text fields.",
      },
    },
  };
}
