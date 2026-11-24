/**
 * shadcn: what each layer finish paints, and the shadow scale, per appearance.
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
      material: "none",
    },
    inset: {
      shadow: "{shadow.inset}",
      "border-color": "{border}",
      foreground: "{foreground}",
      material: "none",
    },
    channel: {
      background: "{inset}",
      "border-color": "{border}",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
      material: "none",
    },
    raised: {
      background: "{raised}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "none",
    },
    plate: {
      background: "{field}",
      "border-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "none",
    },
    overlay: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "none",
    },
    modal: {
      background: "{card}",
      "border-color": "{border}",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
      material: "none",
    },
    inverse: {
      background: "{inverse}",
      "border-color": "{border}",
      shadow: "{shadow.lg}",
      foreground: "{inverse-foreground}",
      backdropFilter: "none",
      material: "none",
    },
    glass: {
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(20px)",
      material: "none",
    },
    accent: {
      background: "{primary}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      material: "none",
      "pressed-opacity": 0.88,
    },
    fill: {
      background: "{primary}",
      "border-color": "transparent",
      foreground: "{primary-foreground}",
      shadow: "{shadow.edge.accent}",
      material: "none",
    },
    knob: {
      background: "{knob}",
      "border-color": "transparent",
      shadow: "{shadow.sm}",
      foreground: "{foreground}",
      // Upstream `knobOn` paints an open knob in the accent's ink; the rest is still `knob`.
      "checked-background": "{primary-foreground}",
      material: "none",
    },
    hover: {
      background: "{hover}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
    pressed: {
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
      material: "none",
    },
    disabled: {
      background: "{raised}",
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
  },
  light: {
    glass: { background: "oklch(from {card} l c h / 0.8)" },
    pressed: { background: "{border}" },
  },
  dark: {
    glass: { background: "oklch(from {card} l c h / 0.8)" },
    plate: { "border-color": "{input}" },
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
