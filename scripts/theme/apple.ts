/**
 * The Apple theme as this library's two theme files: the system palette of iOS and macOS, the
 * HIG's metrics, and three finishes that ask the platform for Liquid Glass (`material`).
 *
 * Every colour is quoted from Apple's published system colours (the HIG's Color page and the
 * UIKit `UIColor` constants for the sRGB values), written as canonical `oklch()` (`oklch.ts`). A
 * translucent system fill (`systemFill`, `secondaryLabel`) is composited over the surface it sits on
 * and stored opaque, because a token is one colour on every surface.
 *
 * Read by `generate-apple.ts`; `docs/specs/native-themes.md` §3.2 holds the style values and their
 * sources.
 */
import type { ThemeGeneratorOutput } from "./dtcg";
import { finishes, shadows } from "./finishes/apple";
import { oklchColor, over, toOklchText } from "./oklch";

/** Apple's system colours, per appearance (sRGB, as UIKit documents them). */
const SYSTEM = {
  light: {
    groupedBackground: "#F2F2F7",
    background: "#FFFFFF",
    label: "#000000",
    secondaryLabel: "rgba(60, 60, 67, 0.6)",
    tertiaryLabel: "rgba(60, 60, 67, 0.3)",
    separator: "rgba(60, 60, 67, 0.29)",
    hairline: "rgba(60, 60, 67, 0.18)",
    fill: "rgba(120, 120, 128, 0.2)",
    secondaryFill: "rgba(120, 120, 128, 0.16)",
    tertiaryFill: "rgba(118, 118, 128, 0.12)",
    quaternaryFill: "rgba(116, 116, 128, 0.08)",
    blue: "#007AFF",
    red: "#FF3B30",
    orange: "#FF9500",
    green: "#34C759",
    purple: "#AF52DE",
    popover: "#FFFFFF",
    sidebar: "#F2F2F7",
  },
  dark: {
    groupedBackground: "#000000",
    background: "#1C1C1E",
    label: "#FFFFFF",
    secondaryLabel: "rgba(235, 235, 245, 0.6)",
    tertiaryLabel: "rgba(235, 235, 245, 0.3)",
    separator: "rgba(84, 84, 88, 0.6)",
    hairline: "rgba(84, 84, 88, 0.45)",
    fill: "rgba(120, 120, 128, 0.36)",
    secondaryFill: "rgba(120, 120, 128, 0.32)",
    tertiaryFill: "rgba(118, 118, 128, 0.24)",
    quaternaryFill: "rgba(116, 116, 128, 0.18)",
    blue: "#0A84FF",
    red: "#FF453A",
    orange: "#FF9F0A",
    green: "#30D158",
    purple: "#BF5AF2",
    popover: "#2C2C2E",
    sidebar: "#1C1C1E",
  },
} as const;
type Appearance = keyof typeof SYSTEM;

/** One appearance's colours; a translucent fill is composited over the card it sits on. */
function palette(appearance: Appearance) {
  const s = SYSTEM[appearance];
  const t = (value: string) => toOklchText(value);
  const card = t(s.background);
  const onCard = (fill: string) => over(fill, card);
  return {
    background: t(s.groupedBackground),
    foreground: t(s.label),
    card,
    popover: t(s.popover),
    primary: t(s.blue),
    primaryForeground: t("#FFFFFF"),
    muted: onCard(s.tertiaryFill),
    mutedForeground: onCard(s.secondaryLabel),
    accent: onCard(s.quaternaryFill),
    destructive: t(s.red),
    border: onCard(s.hairline),
    input: onCard(s.separator),
    ring: t(s.blue),
    chart: [s.blue, s.green, s.orange, s.purple, s.red].map(t) as [
      string,
      string,
      string,
      string,
      string,
    ],
    sidebar: t(s.sidebar),
    raised: onCard(s.tertiaryFill),
    inset: onCard(s.quaternaryFill),
    field: onCard(s.tertiaryFill),
    line: onCard(s.hairline),
    track: onCard(s.secondaryFill),
    faint: onCard(s.tertiaryLabel),
    info: t(s.blue),
    warn: t(s.orange),
    up: t(s.green),
    violet: t(s.purple),
  };
}

/** A tone's translucent tint, as the theme's `*-tint` tokens write it. */
const tints = (tone: string) => `color-mix(in srgb, var(--${tone}) 12%, transparent)`;

/** The theme's own tokens, shared by the appearances. */
const themeLevel = (): Record<string, string> => ({
  // Apple HIG Layout: 8 pt in-page controls/fields, 12 pt containers/menus, 26 pt modals, capsule buttons (`shape.corners.button: "full"`).
  radius: "8px",
  "radius-control": "8px",
  "radius-container": "12px",
  "radius-modal": "26px",
  // The families: the platform's own, neither shade ships a font face.
  "font-sans": "system-ui",
  "font-mono": "monospace",
  scrim: oklchColor(0, 0, 0, 0.4),
  media: oklchColor(0.1869, 0.0151, 266.766),
  "on-media": oklchColor(1, 0, 0),
});

/** One appearance's colour tokens. */
function section(p: ReturnType<typeof palette>) {
  return {
    background: p.background,
    foreground: p.foreground,
    card: p.card,
    "card-foreground": "var(--foreground)",
    popover: p.popover,
    "popover-foreground": "var(--foreground)",
    primary: p.primary,
    "primary-foreground": p.primaryForeground,
    secondary: "var(--raised)",
    "secondary-foreground": "var(--foreground)",
    muted: p.muted,
    "muted-foreground": p.mutedForeground,
    accent: p.accent,
    "accent-foreground": "var(--foreground)",
    destructive: p.destructive,
    border: p.border,
    input: p.input,
    ring: p.ring,
    "chart-1": p.chart[0],
    "chart-2": p.chart[1],
    "chart-3": p.chart[2],
    "chart-4": p.chart[3],
    "chart-5": p.chart[4],
    sidebar: p.sidebar,
    "sidebar-foreground": "var(--foreground)",
    "sidebar-primary": "var(--primary)",
    "sidebar-primary-foreground": "var(--primary-foreground)",
    "sidebar-accent": "var(--accent)",
    "sidebar-accent-foreground": "var(--accent-foreground)",
    "sidebar-border": "var(--border)",
    "sidebar-ring": "var(--ring)",
    inset: p.inset,
    raised: p.raised,
    "glass-edge": "var(--border)",
    field: p.field,
    line: p.line,
    hover: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    "ring-halo": "color-mix(in srgb, var(--ring) 30%, transparent)",
    faint: p.faint,
    brand: p.primary,
    "brand-edge": "var(--border)",
    track: p.track,
    knob: oklchColor(1, 0, 0),
    info: p.info,
    warn: p.warn,
    up: p.up,
    "brand-tint": tints("brand"),
    inverse: "var(--popover)",
    "inverse-foreground": "var(--foreground)",
    "inverse-brand": "var(--primary-foreground)",
    "info-tint": tints("info"),
    "warn-tint": tints("warn"),
    "destructive-tint": tints("destructive"),
    "up-tint": tints("up"),
    "down-tint": tints("destructive"),
    violet: p.violet,
  };
}

/** The style groups: the HIG's metrics; `docs/specs/native-themes.md` §3.2 lists each with its source. */
export const style = {
  typography: {
    caption: {
      fontSize: { pointer: 10, touch: 12 },
      lineHeight: { pointer: 13, touch: 16 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    detail: {
      fontSize: { pointer: 11, touch: 13 },
      lineHeight: { pointer: 14, touch: 18 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    body: {
      fontSize: { pointer: 13, touch: 17 },
      lineHeight: { pointer: 16, touch: 22 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    label: {
      fontSize: { pointer: 13, touch: 17 },
      lineHeight: { pointer: 16, touch: 22 },
      fontWeight: 500,
      letterSpacing: 0,
    },
    title: {
      fontSize: { pointer: 13, touch: 17 },
      lineHeight: { pointer: 16, touch: 22 },
      fontWeight: 600,
      letterSpacing: 0,
    },
    headline: {
      fontSize: { pointer: 22, touch: 22 },
      lineHeight: { pointer: 26, touch: 28 },
      fontWeight: 600,
      letterSpacing: 0,
    },
    display: {
      fontSize: { pointer: 26, touch: 34 },
      lineHeight: { pointer: 32, touch: 41 },
      fontWeight: 600,
      letterSpacing: 0,
    },
  },
  dimension: {
    shape: {
      control: "{radius-control}",
      container: "{radius-container}",
      modal: "{radius-modal}",
    },
    size: {
      hit: { pointer: 0, touch: 44 },
      density: {
        pointer: { pad: 16, gap: 12 },
        touch: { pad: 16, gap: 12 },
      },
      // Our own: a macOS menu's highlight sits inside the menu's edge; an iOS menu's rows span it, the text 16pt in.
      item: {
        pointer: { inset: 4, pad: 8 },
        touch: { inset: 0, pad: 16 },
      },
      control: {
        pointer: { padding: 8, gap: 8, dot: 6, switch: "regular" },
        touch: { padding: 8, gap: 8, dot: 8, switch: "regular" },
      },
      height: { pointer: { sm: 24, md: 28, lg: 32 }, touch: { sm: 32, md: 44, lg: 56 } },
    },
    // A group of choices is iOS's segmented control: a capsule track on the card layer, a capsule
    // grey chosen block inside it (HIG "Segmented controls": a capsule within a capsule). A tab
    // strip is not that control: it keeps the block at the theme's control radius (`plate`).
    control: { group: "capsule", selection: "plate" },
    stroke: { hairline: 0.5, control: 1 },
    focus: { style: "halo", width: 3, offset: 0 },
    icon: {
      pointer: { sm: 12, md: 16, lg: 20 },
      touch: { sm: 16, md: 20, lg: 24 },
    },
  },
  shape: {
    curve: "continuous",
    corners: {
      button: "full" as const,
    },
  },
  state: {
    // Apple presses by dimming (`state["pressed-opacity"]`), not by sinking.
    "press-scale": 1,
    overlay: { hover: 0, focus: 0, pressed: 0, dragged: 0 },
    ripple: false,
    "pressed-opacity": 0.7,
    "rest-opacity": 0.5,
    disabled: { content: 0.3, fill: false },
  },
  transition: {
    enter: { duration: 420, timingFunction: "out-cubic" },
  },
  motion: {
    // The springs the system's own controls settle with: a toggle's snap, a
    // press, and a release.
    fast: { stiffness: 1218, damping: 70 },
    default: { stiffness: 520, damping: 34 },
    slow: { stiffness: 320, damping: 30 },
  },
};

/** Apple theme data and HIG/UIKit DTCG descriptions ready for `emitDtcgTheme`. */
export function appleDtcgOutput(): ThemeGeneratorOutput {
  const appearanceColorDescs = {
    background: "Grouped page canvas background (UIKit systemGroupedBackground).",
    foreground: "Primary label ink (UIKit label).",
    card: "Elevated list and card surface (UIKit systemBackground).",
    popover: "Floating popover and sheet surface (UIKit secondarySystemBackground / popover).",
    primary: "System accent blue (UIKit systemBlue).",
    muted: "Subdued container fill (UIKit tertiarySystemFill composited over card).",
    "muted-foreground": "Secondary label ink (UIKit secondaryLabel composited over card).",
    accent: "Subtle hover/selection fill (UIKit quaternarySystemFill composited over card).",
    destructive: "System destructive red (UIKit systemRed).",
    border: "Hairline separator (UIKit separator hairline composited over card).",
    input: "Input control border (UIKit separator composited over card).",
    ring: "Focus ring color matching UIKit systemBlue.",
    "chart-1": "First chart series color (UIKit systemBlue).",
    "chart-2": "Second chart series color (UIKit systemGreen).",
    "chart-3": "Third chart series color (UIKit systemOrange).",
    "chart-4": "Fourth chart series color (UIKit systemPurple).",
    "chart-5": "Fifth chart series color (UIKit systemRed).",
    sidebar: "Sidebar surface matching Apple system sidebar/grouped background.",
    inset: "Inset surface (UIKit quaternarySystemFill composited over card).",
    raised: "Raised control surface (UIKit tertiarySystemFill composited over card).",
    field: "Form input background (UIKit tertiarySystemFill composited over card).",
    line: "Inset divider hairline (UIKit hairline composited over card).",
    hover: "Pointer hover tint (6% foreground ink over transparent).",
    "ring-halo": "Outer keyboard focus halo (30% ring color over transparent).",
    faint: "Tertiary label ink for placeholders and quiet captions (UIKit tertiaryLabel).",
    brand: "Inline brand accent ink (UIKit systemBlue).",
    track: "Switch and slider track (UIKit secondarySystemFill composited over card).",
    knob: "Switch knob and slider handle (pure white).",
    info: "Informational semantic color (UIKit systemBlue).",
    warn: "Warning semantic color (UIKit systemOrange).",
    up: "Positive trend semantic color (UIKit systemGreen).",
    "brand-tint": "Translucent brand wash (12% brand over transparent).",
    "info-tint": "Translucent informational wash (12% info over transparent).",
    "warn-tint": "Translucent warning wash (12% warn over transparent).",
    "destructive-tint": "Translucent destructive wash (12% destructive over transparent).",
    "up-tint": "Translucent positive wash (12% up over transparent).",
    "down-tint": "Translucent negative wash (12% destructive over transparent).",
    violet: "Accent purple ink (UIKit systemPurple).",
  };

  return {
    id: "apple",
    name: "Apple",
    resolverDescription: "Apple theme (Apple HIG / UIKit system palette and Liquid Glass).",
    themeDescription:
      "Appearance-invariant base tokens and Apple HIG / UIKit style overrides for the Apple theme.",
    finishesDescription:
      "Appearance-invariant surface finish recipes for the Apple theme (Apple Liquid Glass material and Retina hairlines).",
    lightDescription:
      "Light appearance colors and hairline/glass finish overrides for the Apple theme (UIKit light system colors).",
    darkDescription:
      "Dark appearance colors and hairline/glass finish overrides for the Apple theme (UIKit dark system colors).",
    pointerDescription:
      "Apple macOS pointer input-tier overrides (Apple HIG Layout and Typography).",
    touchDescription: "Apple iOS touch input-tier overrides (Apple HIG Layout and Typography).",
    radiusGroupDescription:
      "Apple HIG corner radius scale (8px control, 12px container, 26px modal; capsule buttons via shape.corners.button).",
    style,
    designMd: {
      overview:
        "Apple Human Interface Guidelines / UIKit system palette (`systemBlue`, `systemGroupedBackground`, `label`) with Retina 0.5px hairlines, capsule buttons, continuous corners, and Liquid Glass on floating and raised surfaces.",
      elevation:
        'Apple Liquid Glass and Retina hairline depth: `glass`, `menu`, and `raised` finishes request `material.apple` (`glass: "regular"`) with iOS backdrop fallback (`ios.backdrop`) and 0.5px borders; other surfaces stay flat with subtle shadows.',
      dos: [
        'Use `999px` capsule corners on button-like controls (`shape.corners.button: "full"`) alongside `8px` controls/fields, `12px` containers, and `26px` modals with `shape.curve: "continuous"`.',
        "Respect pointer (macOS: 13px body, 32px density row) vs touch (iOS: 17px body, 44px hit target) metrics.",
        "Keep `material.apple` on `glass`, `menu`, and `raised` finishes and spread `platformMaterial()` on native views.",
      ],
      donts: [
        "Do not replace Retina `0.5px` `stroke.hairline` with thick borders or `circular` corners.",
        "Do not set `macos.backdrop` when Liquid Glass `glassEffect` is active on macOS 26+.",
      ],
    },
    // UIKit ships these pairs as they are; the library keeps them and says where they come from.
    contrast: {
      waivers: [
        ...["background", "muted", "card", "raised"].map((bg) => ({
          fg: "muted-foreground",
          bg,
          source: "Apple secondaryLabel (#3C3C43 at 60%)",
        })),
        ...(
          [
            ["primary-foreground", "primary"],
            ["sidebar-primary-foreground", "sidebar-primary"],
            ["primary-foreground", "finish.accent"],
          ] as const
        ).map(([fg, bg]) => ({ fg, bg, source: "white on Apple systemBlue" })),
        { fg: "brand", bg: "background", source: "Apple systemBlue links" },
      ],
    },
    cssVars: {
      theme: themeLevel(),
      light: section(palette("light")),
      dark: section(palette("dark")),
    },
    finishes,
    shadows,
    descriptions: {
      sharedColors: {
        scrim: "Translucent backdrop scrim behind modals and sheets (40% black).",
      },
      lightColors: appearanceColorDescs,
      darkColors: appearanceColorDescs,
      style: {
        "dimension.size.item":
          "Our own, from the system menus (the HIG states no numbers): with a pointer a macOS menu's highlight sits 4pt inside the menu's edge, its text 8pt in; on iOS a menu's rows span its width (inset 0) and the text takes the system's 16pt margin.",
        "dimension.stroke.hairline": "Retina 0.5px hairline divider width per Apple HIG.",
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking; Apple dims via pressed-opacity).",
        "state.disabled":
          "UIKit disabled content opacity multiplier (0.3); containers keep resting fills.",
      },
    },
  };
}
