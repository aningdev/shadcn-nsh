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
import { oklchColor, over, toOklchText } from "./oklch";
import { withSurfaces } from "./surfaces";

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
    windowControlOff: onCard(s.fill),
  };
}

/** A tone's translucent tint, as the theme's `*-tint` tokens write it. */
const tints = (tone: string) => `color-mix(in srgb, var(--${tone}) 12%, transparent)`;

/** The theme's own tokens, shared by the appearances. */
const themeLevel = (): Record<string, string> => ({
  // Concentric radii (HIG, Layout): a control is a capsule, a card the 20 pt corner of an iPhone
  // grouped list, a field the 8 pt of a macOS text field.
  radius: "8px",
  "radius-card": "20px",
  "radius-control": "999px",
  "radius-field": "8px",
  "radius-chip": "999px",
  "radius-overlay": "12px",
  "radius-dialog": "26px",
  "radius-sheet": "34px",
  "font-mono": "monospace",
  "brand-fill": "var(--primary)",
  "on-brand": "var(--primary-foreground)",
  scrim: oklchColor(0, 0, 0, 0.4),
  media: oklchColor(0.1869, 0.0151, 266.766),
  "on-media": oklchColor(1, 0, 0),
  "chart-foreground": toOklchText(SYSTEM.light.label),
  // The macOS traffic lights.
  "window-close": toOklchText("#FF5F57"),
  "window-minimize": toOklchText("#FEBC2E"),
  "window-zoom": toOklchText("#28C840"),
  "window-control-ink": `color-mix(in srgb, ${oklchColor(0, 0, 0)} 50%, transparent)`,
  "window-control-edge": `color-mix(in srgb, ${oklchColor(0, 0, 0)} 12%, transparent)`,
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
    "sidebar-accent": p.accent,
    "sidebar-accent-foreground": "var(--foreground)",
    "sidebar-border": p.border,
    "sidebar-ring": "var(--ring)",
    inset: p.inset,
    raised: p.raised,
    "glass-edge": "var(--border)",
    "scrollbar-thumb": "color-mix(in srgb, var(--muted-foreground) 50%, var(--background))",
    "scrollbar-thumb-hover": "color-mix(in srgb, var(--muted-foreground) 80%, var(--background))",
    field: p.field,
    line: p.line,
    hover: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    "ring-halo": "color-mix(in srgb, var(--ring) 30%, transparent)",
    faint: p.faint,
    brand: p.primary,
    "brand-edge": "var(--border)",
    track: p.track,
    "slider-track": "var(--track)",
    knob: oklchColor(1, 0, 0),
    code: p.foreground,
    info: p.info,
    warn: p.warn,
    up: p.up,
    down: "var(--destructive)",
    "brand-tint": tints("brand"),
    "on-brand-tint": "var(--foreground)",
    inverse: "var(--popover)",
    "inverse-foreground": "var(--foreground)",
    "inverse-muted": "var(--muted-foreground)",
    "inverse-brand": "var(--primary-foreground)",
    "info-tint": tints("info"),
    "warn-tint": tints("warn"),
    "destructive-tint": tints("destructive"),
    "up-tint": tints("up"),
    "down-tint": tints("destructive"),
    violet: p.violet,
    "window-control-off": p.windowControlOff,
    dialog: "var(--card)",
    "card-edge": "var(--border)",
    bevel: "var(--border)",
    "accent-bevel": "var(--brand-edge)",
    disabled: "var(--raised)",
    "disabled-foreground": "var(--muted-foreground)",
    "accent-pressed": "var(--primary)",
    "on-accent-pressed": "var(--on-brand)",
    "selected-foreground": "var(--foreground)",
    "pressed-foreground": "var(--foreground)",
  };
}

const alias = (token: string) => `{${token}}`;
const flat = (color: string) => `linear-gradient(180deg, ${color} 0%, ${color} 100%)`;
/** A hairline edge in ink: the box shadow's one colour (ink is exempt from the token rule). */
const edge = (appearance: Appearance) =>
  `0 0 0 0.5px ${appearance === "light" ? oklchColor(0, 0, 0, 0.08) : oklchColor(1, 0, 0, 0.1)}`;
const lift = (alpha: number) => `0 1px 3px ${oklchColor(0, 0, 0, alpha)}`;

const surface = (
  color: string,
  {
    shadow = "none",
    "border-color": borderColor = "transparent",
    "border-top-color": borderTopColor,
    "border-bottom-color": borderBottomColor,
  }: {
    shadow?: string;
    "border-color"?: string;
    "border-top-color"?: string;
    "border-bottom-color"?: string;
  } = {},
) => ({
  background: color,
  gradient: flat(color),
  shadow,
  "border-color": borderColor,
  ...(borderTopColor !== undefined ? { "border-top-color": borderTopColor } : {}),
  ...(borderBottomColor !== undefined ? { "border-bottom-color": borderBottomColor } : {}),
});

/**
 * One appearance's finishes: flat fills with a hairline, and three that are glass. Glass is the
 * platform's (`material.apple`): the fill under it is translucent, because NSH draws
 * `backgroundColor` over the glass; `backdropFilter` and the `ios` backdrop are what iOS below 26
 * and the other platforms draw instead. No `macos` backdrop: an explicit one wins over the glass
 * on macOS 26 and later (`styling.md`).
 */
function finishes(appearance: Appearance) {
  const hairline = edge(appearance);
  const glass = { glass: "regular", tint: null } as const;
  // Every glass finish carries this blur: without Liquid Glass its translucent fill would show what
  // is behind it unblurred.
  const fallbackBlur = "blur(30px)";
  return {
    card: { gradient: flat(alias("card")), shadow: "none" },
    section: { background: alias("card"), shadow: "none", "border-color": alias("card-edge") },
    inset: { shadow: "none" },
    field: { shadow: "none" },
    raised: {
      // The glass shows through the fill, so the gradient over it is clear, not the opaque token.
      ...surface("oklch(from {raised} l c h / 0.72)", {
        shadow: hairline,
        "border-top-color": "transparent",
        "border-bottom-color": "transparent",
      }),
      gradient: "linear-gradient(180deg, transparent 0%, transparent 100%)",
      backdropFilter: fallbackBlur,
      material: { apple: glass },
    },
    hover: surface(alias("hover"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    pressed: surface(alias("muted"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    disabled: surface(alias("disabled"), { "border-color": alias("border") }),
    light: surface(alias("primary"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    accent: surface(alias("primary"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    accentPressed: surface(alias("accent-pressed"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    track: { shadow: "none", "border-color": "transparent" },
    fill: {
      background: "transparent",
      gradient: flat(alias("primary")),
      shadow: "none",
      "border-color": "transparent",
    },
    knob: surface(alias("knob"), { shadow: lift(0.2) }),
    knobOn: surface(alias("knob"), { shadow: lift(0.2) }),
    handle: surface(alias("knob"), { shadow: lift(0.2) }),
    pill: surface(alias("raised"), { shadow: hairline }),
    thumb: surface(alias(appearance === "light" ? "knob" : "raised"), { shadow: lift(0.16) }),
    on: surface(alias("muted"), {
      "border-top-color": "transparent",
      "border-bottom-color": "transparent",
    }),
    chip: surface(alias("muted")),
    glass: {
      background: "oklch(from {popover} l c h / 0.4)",
      shadow: "none",
      "border-color": alias("border"),
      backdropFilter: fallbackBlur,
      material: { apple: glass, ios: { backdrop: "thin" } },
    },
    menu: {
      background: "oklch(from {popover} l c h / 0.72)",
      shadow: `${hairline}, 0 8px 30px ${oklchColor(0, 0, 0, appearance === "light" ? 0.14 : 0.4)}`,
      "border-color": "transparent",
      backdropFilter: fallbackBlur,
      material: { apple: glass, ios: { backdrop: "regular" } },
    },
    grabber: {
      background: alias("raised"),
      shadow: "none",
    },
    groove: { shadow: "none" },
  };
}

/** The style groups: the HIG's metrics; `docs/specs/native-themes.md` §3.2 lists each with its source. */
export const style = {
  typography: {
    fontFamily: null,
    caption: {
      fontSize: { pointer: 10, touch: 12 },
      lineHeight: { pointer: 13 / 10, touch: 16 / 12 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    detail: {
      fontSize: { pointer: 11, touch: 13 },
      lineHeight: { pointer: 14 / 11, touch: 18 / 13 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    body: {
      fontSize: { pointer: 13, touch: 17 },
      lineHeight: { pointer: 16 / 13, touch: 22 / 17 },
      fontWeight: 400,
      letterSpacing: 0,
    },
    label: {
      fontSize: { pointer: 13, touch: 17 },
      lineHeight: { pointer: 16 / 13, touch: 22 / 17 },
      fontWeight: 500,
      letterSpacing: 0,
    },
    title: {
      fontSize: { pointer: 13, touch: 17 },
      lineHeight: { pointer: 16 / 13, touch: 22 / 17 },
      fontWeight: 600,
      letterSpacing: 0,
    },
    headline: {
      fontSize: { pointer: 22, touch: 22 },
      lineHeight: { pointer: 26 / 22, touch: 28 / 22 },
      fontWeight: 600,
      letterSpacing: 0,
    },
    display: {
      fontSize: { pointer: 26, touch: 34 },
      lineHeight: { pointer: 32 / 26, touch: 41 / 34 },
      fontWeight: 600,
      letterSpacing: 0,
    },
  },
  dimension: {
    shape: {
      control: "{radius-control}",
      field: "{radius-field}",
      chip: "{radius-chip}",
      card: "{radius-card}",
      overlay: "{radius-overlay}",
      dialog: "{radius-dialog}",
      sheet: "{radius-sheet}",
      inset: "{radius}",
    },
    size: {
      hit: { pointer: 0, touch: 44 },
      density: {
        pointer: { row: 32, pad: 14, gap: 12, surface: 12 },
        touch: { row: 44, pad: 16, gap: 12, surface: 20 },
      },
      control: {
        pointer: {
          row: 36,
          padding: 6,
          gap: 10,
          control: 16,
          corner: 4,
          check: 12,
          dot: 6,
          tabs: 28,
          line: 28,
          clear: 16,
          switch: "regular",
        },
        touch: {
          row: 44,
          padding: 8,
          gap: 12,
          control: 22,
          corner: 11,
          check: 16,
          dot: 8,
          tabs: 36,
          line: 44,
          clear: 20,
          switch: "regular",
        },
      },
      height: { pointer: { sm: 24, md: 28, lg: 32 }, touch: { sm: 32, md: 44, lg: 50 } },
    },
    stroke: { hairline: 0.5, surface: 0.5, control: 1, indicator: 2 },
    focus: { style: "halo", width: 3, offset: 0 },
    icon: {
      pointer: { sm: 12, md: 14, lg: 16 },
      touch: { sm: 15, md: 17, lg: 20 },
    },
  },
  shape: {
    curve: "continuous",
    corners: { field: "all" },
  },
  state: {
    // Apple presses by dimming (`state["pressed-opacity"]`), not by sinking.
    "press-scale": 1,
    overlay: { hover: 0, focus: 0, pressed: 0, dragged: 0 },
    ripple: false,
    "pressed-opacity": 0.7,
    disabled: { content: 0.3, fill: false },
  },
  duration: { shake: 500 },
  transition: {
    enter: { duration: 420, timingFunction: "out-cubic" },
  },
  motion: {
    press: { stiffness: 520, damping: 34 },
    settle: { stiffness: 320, damping: 30 },
    control: { stiffness: 1218, damping: 70 },
    move: { stiffness: 504, damping: 38 },
  },
  indicator: { tabs: "pill", nav: "fill", field: "box" },
};

/** Every finish states a material: the one that asks for none says `null`. */
const withMaterial = (roles: Record<string, Record<string, unknown>>) =>
  Object.fromEntries(
    Object.entries(roles).map(([role, finish]) => [
      role,
      { ...finish, material: finish.material ?? null },
    ]),
  );

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
    "slider-track": "Inactive slider track fill aliased to {color.track}.",
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
    "window-control-off":
      "Unfocused window traffic-light fill (UIKit systemFill composited over card).",
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
      "Apple HIG concentric corner radius scale (999px capsule controls/chips, 20px card, 26px dialog, 34px sheet).",
    style,
    designMd: {
      overview:
        "Apple Human Interface Guidelines / UIKit system palette (`systemBlue`, `systemGroupedBackground`, `label`) with Retina 0.5px hairlines, capsule controls, continuous corners, and Liquid Glass on floating and raised surfaces.",
      elevation:
        'Apple Liquid Glass and Retina hairline depth: `glass`, `menu`, and `raised` finishes request `material.apple` (`glass: "regular"`) with iOS backdrop fallback (`ios.backdrop`) and 0.5px borders; other surfaces stay flat with subtle shadows.',
      dos: [
        'Use `999px` capsule corners on controls and chips alongside concentric `20px` cards, `26px` dialogs, and `34px` sheets with `shape.curve: "continuous"`.',
        "Respect pointer (macOS: 13px body, 32px density row) vs touch (iOS: 17px body, 44px hit target) metrics.",
        "Keep `material.apple` on `glass`, `menu`, and `raised` finishes and spread `platformMaterial()` on native views.",
      ],
      donts: [
        "Do not replace Retina `0.5px` `stroke.hairline`/`stroke.surface` with thick borders or `circular` corners.",
        "Do not set `macos.backdrop` when Liquid Glass `glassEffect` is active on macOS 26+.",
      ],
    },
    cssVars: {
      theme: themeLevel(),
      light: section(palette("light")),
      dark: section(palette("dark")),
    },
    finishes: {
      light: withMaterial(withSurfaces(finishes("light"))),
      dark: withMaterial(withSurfaces(finishes("dark"))),
    },
    descriptions: {
      sharedColors: {
        "brand-fill": "Primary brand action fill, aliased to {color.primary} (UIKit systemBlue).",
        "on-brand":
          "Foreground text and icons on brand-fill surfaces, aliased to {color.primary-foreground}.",
        scrim: "Translucent backdrop scrim behind modals and sheets (40% black).",
        "chart-foreground": "Dark ink on light chart tiles matching UIKit light label (#000000).",
      },
      lightColors: appearanceColorDescs,
      darkColors: appearanceColorDescs,
      finishes: {
        raised: "Raised control surface with Liquid Glass material (regular) and hairline shadow.",
        glass:
          "Liquid Glass overlay surface with translucent popover fill, 30px blur fallback, and regular/thin Apple material.",
        menu: "Floating menu/popover surface with translucent popover fill, hairline + drop shadow, and Liquid Glass material.",
        inverse: "Toast/inverse floating surface using Liquid Glass material over inverse fill.",
      },
      style: {
        "dimension.stroke.hairline": "Retina 0.5px hairline divider width per Apple HIG.",
        "dimension.stroke.surface": "Retina 0.5px container surface hairline width per Apple HIG.",
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking; Apple dims via pressed-opacity).",
        "state.disabled":
          "UIKit disabled content opacity multiplier (0.3); containers keep resting fills.",
      },
    },
  };
}
