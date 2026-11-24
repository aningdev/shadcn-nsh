/**
 * solid-glass: what each layer finish paints, and the shadow scale, per appearance.
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
      "border-color": "{glass-edge}",
      "border-top-color": "{glass-edge}",
      "border-bottom-color": "{glass-edge}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "none",
    },
    plate: {
      background: "{field}",
      "border-color": "{glass-edge}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "none",
    },
    overlay: {
      background: "{popover}",
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
      shadow: "{shadow.lg}",
      foreground: "{inverse-foreground}",
      backdropFilter: "none",
      material: "none",
    },
    glass: {
      background: "{raised}",
      "border-color": "{glass-edge}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
    accent: {
      "border-color": "{brand-edge}",
      "border-top-color": "{brand-edge}",
      "border-bottom-color": "{brand-edge}",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      material: "none",
      "pressed-opacity": 0.88,
    },
    fill: {
      "border-color": "{brand-edge}",
      foreground: "{primary-foreground}",
      shadow: "{shadow.edge.accent}",
      material: "none",
    },
    knob: {
      background: "{knob}",
      "border-color": "transparent",
      shadow: "{shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },

    // Upstream `knobOn`: the knob as it sits on the open track.
    "knob-on": {
      background: "{primary-foreground}",
      "border-color": "transparent",
      shadow: "{shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
    hover: {
      background: "{hover}",
      "border-color": "{glass-edge}",
      "border-top-color": "{glass-edge}",
      "border-bottom-color": "{glass-edge}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
    pressed: {
      "border-color": "{glass-edge}",
      "border-top-color": "{glass-edge}",
      "border-bottom-color": "{glass-edge}",
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
    overlay: { "border-color": "oklch(0.38 0.03 265 / 0.22)" },
    inverse: { "border-color": "oklch(0.38 0.03 265 / 0.22)" },
    glass: { backdropFilter: "blur(14px) saturate(180%)" },
    accent: { background: "oklch(from {primary} l c h / 0.88)" },
    fill: { background: "oklch(from {primary} l c h / 0.88)" },
    pressed: { background: "oklch(from {muted} l c h / 0.26)" },
  },
  dark: {
    overlay: { "border-color": "oklch(1 0 0 / 0.06)" },
    inverse: { "border-color": "oklch(1 0 0 / 0.06)" },
    glass: { backdropFilter: "blur(14px)" },
    accent: { background: "oklch(from {primary} l c h / 0.86)" },
    fill: { background: "oklch(from {primary} l c h / 0.86)" },
    pressed: { background: "oklch(from {muted} l c h / 0.11)" },
  },
};

export const shadows: ThemeShadowScale = {
  light: {
    sm: "0px 1px 2px 0px oklch(0.25 0.03 265 / 0.06)",
    md: "0px 1px 2px 0px oklch(0.25 0.03 265 / 0.06), 0px 12px 32px -14px oklch(0.3 0.06 265 / 0.28)",
    lg: "inset 0px 1px 0px 0px oklch(1 0 0 / 0.9), inset 0px -1px 0px 0px oklch(0.38 0.03 265 / 0.16), 0px 24px 60px -18px oklch(0.3 0.06 265 / 0.28), 0px 6px 16px -6px oklch(0.25 0.03 265 / 0.14)",
    xl: "inset 0px 1px 0px 0px oklch(1 0 0 / 0.9), inset 0px -1px 0px 0px oklch(0.38 0.03 265 / 0.16), 0px 24px 60px -18px oklch(0.3 0.06 265 / 0.28), 0px 6px 16px -6px oklch(0.25 0.03 265 / 0.14)",
    inset:
      "inset 0px 1px 1.5px 0px oklch(0.3 0.06 265 / 0.14), inset 0px -1px 0px 0px oklch(1 0 0 / 0.85)",
    edge: {
      surface:
        "inset 0px 1px 0px 0px oklch(1 0 0 / 0.9), inset 0px 0px 0px 1px oklch(1 0 0 / 0.35)",
      accent:
        "inset 0px 1px 0px 0px oklch(1 0 0 / 0.3), inset 0px -1px 0px 0px oklch(0 0 0 / 0.203), inset 0px 0px 0px 1px oklch(1 0 0 / 0.07), 0px 1px 2px 0px oklch(0.25 0.03 265 / 0.06), 0px 8px 18px -9px oklch(0.3 0.06 265 / 0.28)",
    },
  },
  dark: {
    sm: "0px 1px 2px 0px oklch(0 0 0 / 0.1)",
    md: "0px 1px 2px 0px oklch(0 0 0 / 0.1), 0px 12px 32px -14px oklch(0 0 0 / 0.6)",
    lg: "inset 0px 1px 0px 0px oklch(1 0 0 / 0.16), 0px 24px 60px -18px oklch(0 0 0 / 0.6), 0px 6px 16px -6px oklch(0 0 0 / 0.22)",
    xl: "inset 0px 1px 0px 0px oklch(1 0 0 / 0.16), 0px 24px 60px -18px oklch(0 0 0 / 0.6), 0px 6px 16px -6px oklch(0 0 0 / 0.22)",
    inset:
      "inset 0px 1px 1.5px 0px oklch(0 0 0 / 0.38), inset 0px -1px 0px 0px oklch(1 0 0 / 0.09)",
    edge: {
      surface:
        "inset 0px 1px 0px 0px oklch(1 0 0 / 0.11), inset 0px 0px 0px 1px oklch(1 0 0 / 0.04)",
      accent:
        "inset 0px 1px 0px 0px oklch(1 0 0), inset 0px -1px 0px 0px oklch(0 0 0 / 0.099), inset 0px 0px 0px 1px oklch(0 0 0 / 0.07), 0px 1px 2px 0px oklch(0 0 0 / 0.1), 0px 8px 18px -9px oklch(0 0 0 / 0.6)",
    },
  },
};
