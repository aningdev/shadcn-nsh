/**
 * apple: what each of the twelve layer finishes paints, and the shadow scale, per appearance.
 *
 * Field values use the generator vocabulary: `{role}` names a colour role of this theme's palette,
 * `oklch(from {role} l c h / a)` the role at an alpha, `{shadow.part}` a part of the scale below,
 * `"none"` and `"transparent"` their CSS keywords. `material` is the finish's platform material
 * (see the theme's README).
 */
import type { ThemeFinishes, ThemeShadowScale } from "../dtcg";

export const finishes: ThemeFinishes = {
  shared: {
    card: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.md}",
      foreground: "{foreground}",
      material: null,
    },
    inset: { shadow: "{shadow.inset}", foreground: "{foreground}", material: null },
    raised: {
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: { apple: { glass: "regular", tint: null } },
    },
    overlay: {
      "border-color": "transparent",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: { apple: { glass: "regular", tint: null }, ios: { backdrop: "regular" } },
    },
    modal: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
      material: null,
    },
    inverse: {
      "border-color": "transparent",
      shadow: "{shadow.lg}",
      foreground: "{muted-foreground}",
      backdropFilter: "blur(30px)",
      material: { apple: { glass: "regular", tint: null }, ios: { backdrop: "regular" } },
    },
    glass: {
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: { apple: { glass: "regular", tint: null }, ios: { backdrop: "thin" } },
    },
    accent: {
      background: "{primary}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      material: null,
    },
    knob: {
      background: "{knob}",
      "border-color": "transparent",
      shadow: "{shadow.sm}",
      foreground: "{foreground}",
      material: null,
    },
    hover: {
      background: "{hover}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: null,
    },
    pressed: {
      background: "{muted}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
      material: null,
    },
    disabled: {
      background: "{raised}",
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: null,
    },
  },
  light: {
    raised: { background: "oklch(from {raised} l c h / 0.72)" },
    overlay: { background: "oklch(from {popover} l c h / 0.72)" },
    inverse: { background: "oklch(from {inverse} l c h / 0.72)" },
    glass: { background: "oklch(from {popover} l c h / 0.4)" },
  },
  dark: {
    raised: { background: "oklch(from {raised} l c h / 0.72)" },
    overlay: { background: "oklch(from {popover} l c h / 0.72)" },
    inverse: { background: "oklch(from {inverse} l c h / 0.72)" },
    glass: { background: "oklch(from {popover} l c h / 0.4)" },
  },
};

export const shadows: ThemeShadowScale = {
  light: {
    sm: "0px 1px 3px 0px oklch(0 0 0 / 0.2)",
    md: "none",
    lg: "0px 0px 0px 0.5px oklch(0 0 0 / 0.08), 0px 8px 30px 0px oklch(0 0 0 / 0.14)",
    xl: "0px 0px 0px 0.5px oklch(0 0 0 / 0.08), 0px 8px 30px 0px oklch(0 0 0 / 0.14)",
    inset: "none",
    edge: {
      surface: "0px 0px 0px 0.5px oklch(0 0 0 / 0.08)",
      accent: "none",
    },
  },
  dark: {
    sm: "0px 1px 3px 0px oklch(0 0 0 / 0.2)",
    md: "none",
    lg: "0px 0px 0px 0.5px oklch(1 0 0 / 0.1), 0px 8px 30px 0px oklch(0 0 0 / 0.4)",
    xl: "0px 0px 0px 0.5px oklch(1 0 0 / 0.1), 0px 8px 30px 0px oklch(0 0 0 / 0.4)",
    inset: "none",
    edge: {
      surface: "0px 0px 0px 0.5px oklch(1 0 0 / 0.1)",
      accent: "none",
    },
  },
};
