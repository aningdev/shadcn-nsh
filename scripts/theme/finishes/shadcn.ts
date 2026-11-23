/**
 * shadcn: what each of the twelve layer finishes paints, and the shadow scale, per appearance.
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
      background: "{raised}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: null,
    },
    overlay: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: null,
    },
    modal: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
      material: null,
    },
    inverse: {
      background: "{inverse}",
      "border-color": "{border}",
      shadow: "{shadow.lg}",
      foreground: "{muted-foreground}",
      backdropFilter: "none",
      material: null,
    },
    glass: {
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(20px)",
      material: null,
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
    glass: { background: "oklch(from {card} l c h / 0.8)" },
    pressed: { background: "{border}" },
  },
  dark: {
    glass: { background: "oklch(from {card} l c h / 0.8)" },
    pressed: { background: "oklch(0.34846 0 0)" },
  },
};

export const shadows: ThemeShadowScale = {
  light: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.05)",
    md: "0px 1px 3px 0px oklch(0 0 0 / 0.1), 0px 1px 2px -1px oklch(0 0 0 / 0.1)",
    lg: "0px 4px 6px -1px oklch(0 0 0 / 0.1), 0px 2px 4px -2px oklch(0 0 0 / 0.1)",
    xl: "0px 4px 6px -1px oklch(0 0 0 / 0.1), 0px 2px 4px -2px oklch(0 0 0 / 0.1)",
    inset: "none",
    edge: {
      surface: "none",
      accent: "none",
    },
  },
  dark: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.05)",
    md: "0px 1px 3px 0px oklch(0 0 0 / 0.1), 0px 1px 2px -1px oklch(0 0 0 / 0.1)",
    lg: "0px 4px 6px -1px oklch(0 0 0 / 0.1), 0px 2px 4px -2px oklch(0 0 0 / 0.1)",
    xl: "0px 4px 6px -1px oklch(0 0 0 / 0.1), 0px 2px 4px -2px oklch(0 0 0 / 0.1)",
    inset: "none",
    edge: {
      surface: "none",
      accent: "none",
    },
  },
};
