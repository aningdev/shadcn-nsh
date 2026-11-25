/**
 * winui: what each layer finish paints, and the shadow scale, per appearance.
 *
 * Hairlines are the XAML stroke brushes stated as the strokes they are — translucent, so each
 * composites over the face it is drawn on rather than over the window behind it (an opaque stroke
 * that replaced `ControlStrokeColorDefault #0F000000` would only be right on the base).
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
    },
    inset: {
      "border-color": "{input}",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
    },
    channel: {
      background: "{inset}",
      "border-color": "{line}",
      shadow: "{shadow.inset}",
      foreground: "{foreground}",
    },
    raised: {
      background: "{raised}",
      "border-color": "{line}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
    plate: {
      background: "{card}",
      "border-color": "{line}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
    overlay: {
      background: "{popover}",
      "border-color": "{line}",
      shadow: "{shadow.lg}",
      foreground: "{foreground}",
      material: "acrylic",
    },
    modal: {
      background: "{background}",
      shadow: "{shadow.xl}",
      foreground: "{foreground}",
    },
    inverse: {
      background: "{inverse}",
      "border-color": "{line}",
      shadow: "{shadow.lg}",
      foreground: "{inverse-foreground}",
    },
    glass: {
      "border-color": "{line}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
      backdropFilter: "blur(30px)",
    },
    accent: {
      background: "{primary}",
      "border-bottom-color": "{brand-edge}",
      shadow: "{shadow.edge.accent}",
      foreground: "{primary-foreground}",
      // WinUI swaps the accent out on a press (`pressed-background` / `pressed-foreground`).
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
      background: "{hover}",
      "border-color": "{line}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
    pressed: {
      background: "{muted}",
      "border-color": "{line}",
      shadow: "{shadow.inset}",
      foreground: "{muted-foreground}",
    },
    disabled: {
      "border-color": "{line}",
      shadow: "{shadow.edge.surface}, {shadow.sm}",
      foreground: "{foreground}",
    },
  },
  // Strokes are the XAML brushes at their own alpha: `ControlStrokeColorDefault #0F000000`,
  // `ControlStrokeColorSecondary #29000000`, `ControlStrongStrokeColorDefault #72000000`,
  // `CardStrokeColorDefault #0F000000`, `SurfaceStrokeColorDefault #66757575` (light) — each over the
  // face it is drawn on (a card's `#fbfbfb`, a field's, a dialog's), the way WinUI paints them.
  light: {
    card: { "border-color": "oklch(0 0 0 / 0.0588)" },
    plate: { "border-color": "oklch(0 0 0 / 0.0588)" },
    inset: {
      "border-color": "oklch(0 0 0 / 0.0588)",
      "border-bottom-color": "oklch(0 0 0 / 0.4471)",
    },
    raised: {
      "border-color": "oklch(0 0 0 / 0.0588)",
      "border-top-color": "oklch(0 0 0 / 0.0588)",
      "border-bottom-color": "oklch(0 0 0 / 0.161)",
    },
    hover: {
      "border-color": "oklch(0 0 0 / 0.0588)",
      "border-top-color": "oklch(0 0 0 / 0.0588)",
      "border-bottom-color": "oklch(0 0 0 / 0.161)",
    },
    modal: { "border-color": "oklch(0.5624 0 0 / 0.4)" },
    // Acrylic's tint over its blur: `TintLuminosityOpacity` 0.85 light, 0.96 dark, the fill `popover`
    // falls back to `AcrylicInAppFillColorDefault` when the platform draws no blur.
    overlay: {
      background: "oklch(from {popover} l c h / 0.85)",
      "border-color": "oklch(0.5624 0 0 / 0.4)",
    },
    glass: { background: "oklch(from {popover} l c h / 0.85)" },
    accent: {
      "border-color": "oklch(0.52768 0.14982 252.341)",
      "pressed-background": "oklch(0.5773 0.13223 250.006)",
      "pressed-foreground": "oklch(0.87245 0.03754 247.003)",
    },
    fill: { "border-color": "oklch(0.52768 0.14982 252.341)" },
    disabled: {
      background: "oklch(0.97015 0 0)",
      "border-color": "oklch(0 0 0 / 0.0588)",
      foreground: "oklch(0.68949 0 0)",
    },
  },
  // Dark strokes: `ControlStrokeColorDefault #12FFFFFF`, `ControlStrokeColorSecondary #18FFFFFF`,
  // `ControlStrongStrokeColorDefault #8BFFFFFF`, `CardStrokeColorDefault #19000000`,
  // `SurfaceStrokeColorDefault #66757575`, the same grey at the same alpha as in light.
  dark: {
    card: { "border-color": "oklch(0 0 0 / 0.102)" },
    plate: { "border-color": "oklch(0 0 0 / 0.102)" },
    inset: {
      "border-color": "oklch(1 0 0 / 0.0706)",
      "border-bottom-color": "oklch(1 0 0 / 0.5451)",
    },
    raised: {
      "border-color": "oklch(1 0 0 / 0.0706)",
      "border-top-color": "oklch(1 0 0 / 0.0706)",
      "border-bottom-color": "oklch(1 0 0 / 0.0941)",
    },
    hover: {
      "border-color": "oklch(1 0 0 / 0.0706)",
      "border-top-color": "oklch(1 0 0 / 0.0706)",
      "border-bottom-color": "oklch(1 0 0 / 0.0941)",
    },
    modal: { "border-color": "oklch(0.5624 0 0 / 0.4)" },
    overlay: {
      background: "oklch(from {popover} l c h / 0.96)",
      "border-color": "oklch(0.5624 0 0 / 0.4)",
    },
    glass: { background: "oklch(from {popover} l c h / 0.96)" },
    accent: {
      "border-color": "oklch(0.81732 0.11439 230)",
      "pressed-background": "oklch(0.70029 0.10192 230.522)",
      "pressed-foreground": "oklch(0.42706 0.05878 229.834)",
    },
    fill: { "border-color": "oklch(0.81732 0.11439 230)" },
    disabled: {
      background: "oklch(0.28502 0 0)",
      "border-color": "oklch(1 0 0 / 0.0706)",
      foreground: "oklch(0.54863 0 0)",
    },
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
