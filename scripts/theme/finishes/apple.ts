/**
 * apple: what each layer finish paints, and the shadow scale, per appearance.
 *
 * Field values use the generator vocabulary: `{role}` names a colour role of this theme's palette,
 * `oklch(from {role} l c h / a)` the role at an alpha, `{shadow.part}` a part of the scale below,
 * `"none"` and `"transparent"` their CSS keywords. `material` names the platform material the
 * layer asks for (`"none"`, `"glass"`, `"acrylic"`: the recipes of `packages/theme/materials.ts`),
 * and `elevation` the height Android draws its own shadow at.
 */
import type { ThemeFinishes, ThemeShadowScale } from "../dtcg";

export const finishes: ThemeFinishes = {
  shared: {
    card: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.md}",
      foreground: "{foreground}",
    },
    // macOS's text field draws a 1-point bezel (HIG, Text fields): the field's edge, as material's.
    inset: {
      shadow: "{shadow.inset}",
      "border-color": "{input}",
      foreground: "{foreground}",
    },
    // Apple segmented control track: a recessed system fill groove, no border or drop shadow.
    channel: {
      background: "{raised}",
      "border-color": "transparent",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
    },
    raised: {
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: "glass",
    },
    plate: {
      background: "{card}",
      "border-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
    overlay: {
      "border-color": "transparent",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: "glass",
    },
    modal: {
      background: "{card}",
      "border-color": "transparent",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
    },
    inverse: {
      "border-color": "transparent",
      shadow: "{shadow.lg}",
      foreground: "{inverse-foreground}",
      backdropFilter: "blur(30px)",
      material: "glass",
    },
    glass: {
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: "glass",
    },
    accent: {
      background: "{primary}",
      "border-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      "pressed-opacity": 0.72,
    },
    fill: {
      background: "{primary}",
      "border-color": "transparent",
      foreground: "{primary-foreground}",
      shadow: "{shadow.edge.accent}",
    },
    knob: {
      background: "{knob}",
      "border-color": "transparent",
      shadow: "{shadow.sm}",
      foreground: "{foreground}",
      // Upstream `knobOn` paints an open knob in the accent's ink; the rest is still `knob`.
      "checked-background": "{primary-foreground}",
    },
    hover: {
      background: "{hover}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
    pressed: {
      "border-color": "transparent",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
    },
    disabled: {
      background: "{raised}",
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
  },
  light: {
    raised: { background: "oklch(from {raised} l c h / 0.72)" },
    overlay: { background: "oklch(from {popover} l c h / 0.72)" },
    inverse: { background: "oklch(from {inverse} l c h / 0.72)" },
    glass: { background: "oklch(from {popover} l c h / 0.72)" },
    pressed: { background: "oklch(from {foreground} l c h / 0.16)" },
  },
  dark: {
    channel: { background: "{inset}" },
    raised: { background: "oklch(from {raised} l c h / 0.72)" },
    plate: { background: "{raised}" },
    overlay: { background: "oklch(from {popover} l c h / 0.72)" },
    inverse: { background: "oklch(from {inverse} l c h / 0.72)" },
    glass: { background: "oklch(from {popover} l c h / 0.72)" },
    pressed: { background: "oklch(from {foreground} l c h / 0.2)" },
  },
};

export const shadows: ThemeShadowScale = {
  light: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.12)",
    md: "none",
    lg: "0px 0px 0px 0.5px oklch(0 0 0 / 0.08), 0px 8px 24px 0px oklch(0 0 0 / 0.14)",
    xl: "0px 0px 0px 0.5px oklch(0 0 0 / 0.08), 0px 18px 48px 0px oklch(0 0 0 / 0.2)",
    inset: "none",
    edge: {
      surface: "0px 0px 0px 0.5px oklch(0 0 0 / 0.08)",
      accent: "none",
    },
  },
  dark: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.2)",
    md: "none",
    lg: "0px 0px 0px 0.5px oklch(1 0 0 / 0.1), 0px 8px 24px 0px oklch(0 0 0 / 0.38)",
    xl: "0px 0px 0px 0.5px oklch(1 0 0 / 0.1), 0px 18px 48px 0px oklch(0 0 0 / 0.5)",
    inset: "none",
    edge: {
      surface: "0px 0px 0px 0.5px oklch(1 0 0 / 0.1)",
      accent: "none",
    },
  },
};
