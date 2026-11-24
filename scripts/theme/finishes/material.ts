/**
 * material: what each layer finish paints, and the shadow scale, per appearance.
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
      "border-color": "transparent",
      shadow: "{shadow.md}",
      foreground: "{foreground}",
      elevation: 1,
    },
    inset: {
      shadow: "{shadow.inset}",
      "border-color": "{input}",
      foreground: "{foreground}",
    },
    channel: {
      background: "{inset}",
      "border-color": "{border}",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
    },
    raised: {
      background: "{raised}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
    plate: {
      background: "{secondary}",
      "border-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      elevation: 1,
    },
    overlay: {
      background: "{popover}",
      "border-color": "transparent",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      elevation: 3,
    },
    modal: {
      "border-color": "transparent",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
      elevation: 6,
    },
    inverse: {
      background: "{inverse}",
      "border-color": "transparent",
      shadow: "{shadow.lg}",
      foreground: "{inverse-foreground}",
      elevation: 6,
    },
    glass: {
      background: "{popover}",
      "border-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      elevation: 3,
    },
    accent: {
      background: "{primary}",
      "border-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      // M3 presses with a state layer, not by dimming.
      "pressed-opacity": 1,
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
      background: "{raised}",
      "border-color": "transparent",
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      elevation: 1,
    },
    pressed: {
      background: "{raised}",
      "border-color": "transparent",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
      elevation: 1,
    },
    disabled: {
      "border-color": "transparent",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
  },
  light: {
    modal: { background: "oklch(0.93251 0.01479 312.24)" },
    disabled: {
      background: "oklch(from {foreground} l c h / 0.1)",
      foreground: "oklch(from {foreground} l c h / 0.38)",
    },
  },
  dark: {
    modal: { background: "oklch(0.2859 0.01293 298.633)" },
    disabled: {
      background: "oklch(from {foreground} l c h / 0.1)",
      foreground: "oklch(from {foreground} l c h / 0.38)",
    },
  },
};

export const shadows: ThemeShadowScale = {
  light: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.3), 0px 1px 3px 1px oklch(0 0 0 / 0.15)",
    md: "0px 1px 2px 0px oklch(0 0 0 / 0.3), 0px 1px 3px 1px oklch(0 0 0 / 0.15)",
    lg: "0px 1px 2px 0px oklch(0 0 0 / 0.3), 0px 2px 6px 2px oklch(0 0 0 / 0.15)",
    xl: "0px 1px 3px 0px oklch(0 0 0 / 0.3), 0px 4px 8px 3px oklch(0 0 0 / 0.15)",
    inset: "none",
    edge: {
      surface: "none",
      accent: "none",
    },
  },
  dark: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.3), 0px 1px 3px 1px oklch(0 0 0 / 0.15)",
    md: "0px 1px 2px 0px oklch(0 0 0 / 0.3), 0px 1px 3px 1px oklch(0 0 0 / 0.15)",
    lg: "0px 1px 2px 0px oklch(0 0 0 / 0.3), 0px 2px 6px 2px oklch(0 0 0 / 0.15)",
    xl: "0px 1px 3px 0px oklch(0 0 0 / 0.3), 0px 4px 8px 3px oklch(0 0 0 / 0.15)",
    inset: "none",
    edge: {
      surface: "none",
      accent: "none",
    },
  },
};
