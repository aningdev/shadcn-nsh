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
import { reduceColours, type ColourOrigin, type ColourScheme } from "./sources";

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
    // Light steps up to secondarySystemFill: tertiarySystemFill on white is only 0.010 darker than
    // the grouped page, so the selection fill (`accent` is `muted`) vanished there (#349). Dark
    // already separates.
    muted: onCard(appearance === "light" ? s.secondaryFill : s.tertiaryFill),
    mutedForeground: onCard(s.secondaryLabel),
    // Quaternary fill is 0.006 lighter than the grouped page in light, under the fill floor
    // (`scripts/theme/contrast.ts`): it vanished there once already (#349), so `accent` takes the
    // step `muted` uses — secondary fill in light, tertiary in dark.
    accent: onCard(appearance === "light" ? s.secondaryFill : s.tertiaryFill),
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
  };
}

/** A tone's translucent tint, as the theme's `*-tint` tokens write it. */
const tints = (tone: string) => `color-mix(in srgb, var(--${tone}) 12%, transparent)`;

/** The theme's own tokens, shared by the appearances. */
const themeLevel = (): Record<string, string> => ({
  // Apple HIG Layout: 8 pt in-page controls/fields, 12 pt containers/menus, 16 pt modal windows,
  // and per-size button corners (`button.corner.*`).
  radius: "8px",
  "radius-control": "8px",
  "radius-container": "12px",
  "radius-modal": "16px",
  scrim: oklchColor(0, 0, 0, 0.4),
  media: oklchColor(0.1869, 0.0151, 266.766),
  "on-media": oklchColor(1, 0, 0),
});

/** The choices the derived keys make (ADR 0007 §4). */
const scheme: ColourScheme = {
  tint: 12,
  ring: "primary",
  field: "muted",
  knob: ["card", "foreground"],
  secondaryIsRaised: true,
  raised: "secondary",
  inverse: ["card", "foreground"],
  chart: ["primary", "up", "warn", "destructive", "muted-foreground"],
};

/**
 * Where each colour the theme states comes from (ADR 0012 §4): Apple's own name for it, over the
 * surface a translucent fill is composited on.
 */
const origin: ColourOrigin = {
  spec: "Apple HIG system colours",
  names: {
    accent: "secondarySystemFill over the card (light) / tertiarySystemFill over the card (dark)",
    inset: "quaternarySystemFill over the card",
    track: "secondarySystemFill over the card",
    hover: "label at 6% over transparent",
    popover: "tertiarySystemBackground",
    sidebar: "secondarySystemBackground",
    field: "tertiarySystemFill over the card",
    raised: "tertiarySystemFill over the card",
    knob: "white",
    input: "separator over the card",
    ring: "systemBlue",
    brand: "systemBlue",
    "chart-1": "systemBlue",
    "chart-2": "systemGreen",
    "chart-3": "systemOrange",
    "chart-4": "systemPurple",
    "chart-5": "systemRed",
  },
};

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
    field: p.field,
    line: p.line,
    hover: "color-mix(in srgb, var(--foreground) 6%, transparent)",
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
  };
}

/** The style groups: the HIG's metrics; `docs/specs/native-themes.md` §3.2 lists each with its source. */
export const style = {
  typography: {
    caption: {
      fontWeight: 400,
      letterSpacing: 0,
    },
    detail: {
      fontWeight: 400,
      letterSpacing: 0,
    },
    body: {
      fontWeight: 400,
      letterSpacing: 0,
    },
    label: {
      fontWeight: 500,
      letterSpacing: 0,
    },
    title: {
      fontWeight: 600,
      letterSpacing: 0,
    },
    headline: {
      fontWeight: 600,
      letterSpacing: 0,
    },
    display: {
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
      // macOS 26's control heights are 20/24/28 (mini/small/regular); large keeps 28.
      height: { pointer: { sm: 20, md: 24, lg: 28 }, touch: { sm: 32, md: 44, lg: 56 } },
    },
    stroke: { hairline: 0.5, control: 1 },
    focus: { style: "halo", width: 3, offset: 0 },
    icon: {
      pointer: { sm: 12, md: 16, lg: 20 },
      touch: { sm: 16, md: 20, lg: 24 },
    },
  },
  slots: {
    // Apple's own controls (docs/specs/theme-slots.md, docs/specs/native-themes.md §3.5–3.6):
    // macOS buttons take a corner per size (capsules only at large), a selected control wears the
    // 12% brand wash with brand ink, `.gray` (secondary) is a solid fill-3 ground, `.destructive`
    // is the tint with neither border nor shadow, the checkbox is a white rounded square with a
    // mid grey border, switch and slider thumbs are ovals on filled tracks, today's date is brand
    // ink without a disc, and the spinner is eight spokes.
    "button.corner.sm": 5,
    "button.corner.md": 6,
    "button.corner.lg": "full",
    "button.selected.face": "tint:brand",
    "button.selected.ink": "color:brand",
    "button.secondary.edge": "none",
    "button.secondary.hover": "color:muted",
    "button.destructive.edge": "none",
    "button.destructive.shade": "none",
    "choice.corner": { pointer: 4, touch: 7 },
    "choice.face": { light: "color:card", dark: "color:raised" },
    "choice.shade": "none",
    "switch.width": { pointer: 54, touch: 63 },
    "switch.height": { pointer: 24, touch: 28 },
    "switch.knob.width": { pointer: 31, touch: 37 },
    "switch.knob.height": { pointer: 20, touch: 24 },
    "switch.knob.on.width": { pointer: 31, touch: 37 },
    "switch.knob.on.height": { pointer: 20, touch: 24 },
    "switch.knob.hover": { pointer: 31, touch: 37 },
    "switch.knob.pressed.width": { pointer: 31, touch: 37 },
    "switch.knob.pressed.height": { pointer: 20, touch: 24 },
    "switch.edge.off": 0,
    "switch.edge.on": 0,
    "slider.rail": { pointer: 4, touch: 6 },
    "slider.band": { pointer: 24, touch: 32 },
    "slider.knob.size": { pointer: 20, touch: 37 },
    "slider.knob.height": { pointer: 16, touch: 24 },
    "slider.knob.pressed.size": { pointer: 20, touch: 37 },
    "slider.shade": "none",
    "slider.edge.width": 0,
    "calendar.today.face": "none",
    "calendar.today.ink": "brand",
    "spinner.spokes": true,
    "spinner.opacity": 0,
    // Apple's wells are their ground alone: no fill of a box ever draws a border (HIG, "Adopting
    // Liquid Glass"; the inset edge is transparent for the same reason).
    "well.edge": "none",
  },
  shape: {
    curve: "continuous",
    corners: {
      // A button's own corners are the `button.corner.*` slots; this is the corner of the other
      // button-like controls (icon buttons, pagination items, calendar days): macOS rounds them
      // like a control, not as capsules.
      button: "{dimension.radius.control}",
    },
  },
  state: {
    // Apple presses by dimming (`state["pressed-opacity"]`), not by sinking.
    "press-scale": 1,
    overlay: { hover: 0, focus: 0, pressed: 0, dragged: 0 },
    "pressed-opacity": 0.7,
    "rest-opacity": 0.5,
    disabled: { content: 0.4, fill: false },
  },
  transition: {
    enter: { duration: 420, timingFunction: "out-cubic" },
  },
  motion: {
    // UIKit's own animations run a quarter second (`CATransaction`'s default 0.25 s) and ease out:
    // a toggle's snap is quicker, a panel's settle slower.
    fast: { duration: 150, timingFunction: "out-cubic" },
    default: { duration: 250, timingFunction: "out-cubic" },
    slow: { duration: 350, timingFunction: "out-cubic" },
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
    muted:
      "Subdued container fill (UIKit tertiarySystemFill composited over card; light uses secondarySystemFill so it reads on the grouped page).",
    "muted-foreground": "Secondary label ink (UIKit secondaryLabel composited over card).",
    accent:
      "Subtle hover/selection fill (UIKit secondarySystemFill over the card in light, tertiarySystemFill in dark: the step `muted` uses).",
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
  };

  const reduced = {
    light: reduceColours(section(palette("light")), origin, scheme, "light"),
    dark: reduceColours(section(palette("dark")), origin, scheme, "dark"),
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
      "Apple HIG corner radius scale (8px control, 12px container, 16px modal; button corners per size via the `button.corner.*` slots).",
    style,
    designMd: {
      overview:
        "Apple Human Interface Guidelines / UIKit system palette (`systemBlue`, `systemGroupedBackground`, `label`) with Retina 0.5px hairlines, per-size button corners (capsules only at large), continuous corners, and Liquid Glass on floating and raised surfaces.",
      elevation:
        'Apple Liquid Glass and Retina hairline depth: `glass`, `menu`, and `raised` finishes request `material.apple` (`glass: "regular"`) with iOS backdrop fallback (`ios.backdrop`) and 0.5px borders; other surfaces stay flat with subtle shadows.',
      dos: [
        'Use the `button.corner.*` slots (5/6/`full` with a pointer) alongside `8px` controls/fields, `12px` containers, and `16px` modals with `shape.curve: "continuous"`.',
        "Respect pointer (macOS: 13px body, 32px density row) vs touch (iOS: 17px body, 44px hit target) metrics.",
        "Keep `material.apple` on `glass`, `menu`, and `raised` finishes and spread `platformMaterial()` on native views.",
      ],
      donts: [
        "Do not replace Retina `0.5px` `stroke.hairline` with thick borders or `circular` corners, and do not paint a selected control a solid accent: Apple washes it at 12%.",
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
            ["primary-foreground", "finish.fill"],
          ] as const
        ).map(([fg, bg]) => ({ fg, bg, source: "white on Apple systemBlue" })),
        { fg: "brand", bg: "background", source: "Apple systemBlue links" },
      ],
    },
    colourSources: {
      light: reduced.light.provenance,
      dark: reduced.dark.provenance,
    },
    cssVars: {
      theme: themeLevel(),
      light: reduced.light.colours,
      dark: reduced.dark.colours,
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
          "UIKit disabled content opacity multiplier (0.4); containers keep resting fills.",
      },
    },
  };
}
