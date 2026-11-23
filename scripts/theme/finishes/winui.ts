/**
 * winui: what each of the twelve layer finishes paints, and the shadow scale, per appearance.
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
      shadow: "{shadow.md}",
      foreground: "{foreground}",
      material: "none",
    },
    inset: { shadow: "{shadow.inset}", foreground: "{foreground}", material: "none" },
    raised: {
      background: "{raised}",
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "none",
    },
    overlay: {
      background: "{popover}",
      "border-color": "{glass-edge}",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      backdropFilter: "none",
      material: "acrylic",
    },
    modal: {
      background: "{background}",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
      material: "none",
    },
    inverse: {
      background: "{inverse}",
      "border-color": "{glass-edge}",
      shadow: "{shadow.lg}",
      foreground: "{muted-foreground}",
      backdropFilter: "none",
      material: "none",
    },
    glass: {
      "border-color": "{glass-edge}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
      material: "none",
    },
    accent: {
      background: "{primary}",
      "border-bottom-color": "{brand-edge}",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      material: "none",
    },
    knob: {
      background: "{knob}",
      "border-color": "transparent",
      shadow: "{shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
    hover: {
      background: "{hover}",
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
    pressed: {
      background: "{muted}",
      "border-color": "{border}",
      "border-top-color": "{border}",
      "border-bottom-color": "{border}",
      shadow: "{shadow.inset}",
      foreground: "{muted-foreground}",
      material: "none",
    },
    disabled: {
      "border-color": "{border}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      material: "none",
    },
  },
  light: {
    card: { "border-color": "oklch(0.92191 0 0)" },
    raised: { "border-top-color": "{border}", "border-bottom-color": "oklch(0.84522 0 0)" },
    modal: { "border-color": "oklch(0.81093 0 0)" },
    // Acrylic's tint over its blur: `TintLuminosityOpacity` 0.85 light, 0.96 dark, the fill `popover`
    // falls back to `AcrylicInAppFillColorDefault` when the platform draws no blur.
    overlay: { background: "oklch(from {popover} l c h / 0.85)" },
    glass: { background: "oklch(from {popover} l c h / 0.85)" },
    accent: {
      "border-color": "oklch(0.52768 0.14982 252.341)",
      "border-top-color": "oklch(0.52768 0.14982 252.341)",
      "pressed-background": "oklch(0.5773 0.13223 250.006)",
      "pressed-foreground": "oklch(0.87245 0.03754 247.003)",
    },
    hover: { "border-top-color": "{border}", "border-bottom-color": "oklch(0.84522 0 0)" },
    disabled: { background: "oklch(0.97015 0 0)", foreground: "oklch(0.68949 0 0)" },
  },
  dark: {
    card: { "border-color": "oklch(0.23075 0 0)" },
    raised: { "border-top-color": "oklch(0.32897 0 0)", "border-bottom-color": "{border}" },
    modal: { "border-color": "oklch(0.37909 0 0)" },
    overlay: { background: "oklch(from {popover} l c h / 0.96)" },
    glass: { background: "oklch(from {popover} l c h / 0.96)" },
    accent: {
      "border-color": "oklch(0.81732 0.11439 230)",
      "border-top-color": "oklch(0.81732 0.11439 230)",
      "pressed-background": "oklch(0.70029 0.10192 230.522)",
      "pressed-foreground": "oklch(0.42706 0.05878 229.834)",
    },
    hover: { "border-top-color": "oklch(0.32897 0 0)", "border-bottom-color": "{border}" },
    disabled: { background: "oklch(0.28502 0 0)", foreground: "oklch(0.54863 0 0)" },
  },
};

export const shadows: ThemeShadowScale = {
  light: {
    sm: "none",
    md: "0px 0px 2px 0px oklch(0 0 0 / 0.12), 0px 4px 8px 0px oklch(0 0 0 / 0.14)",
    lg: "0px 0px 8px 0px oklch(0 0 0 / 0.2), 0px 16px 32px 0px oklch(0 0 0 / 0.24)",
    xl: "0px 0px 8px 0px oklch(0 0 0 / 0.2), 0px 64px 128px 0px oklch(0 0 0 / 0.24)",
    inset: "none",
    edge: {
      surface: "none",
      accent: "none",
    },
  },
  dark: {
    sm: "none",
    md: "0px 0px 2px 0px oklch(0 0 0 / 0.24), 0px 4px 8px 0px oklch(0 0 0 / 0.28)",
    lg: "0px 0px 8px 0px oklch(0 0 0 / 0.4), 0px 16px 32px 0px oklch(0 0 0 / 0.48)",
    xl: "0px 0px 8px 0px oklch(0 0 0 / 0.4), 0px 64px 128px 0px oklch(0 0 0 / 0.48)",
    inset: "none",
    edge: {
      surface: "none",
      accent: "none",
    },
  },
};
