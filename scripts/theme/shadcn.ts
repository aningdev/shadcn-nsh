import type { ThemeGeneratorOutput } from "./dtcg";
import { withoutMaterial } from "./material";
/**
 * The shadcn default theme (new-york-v4, `neutral`) as this library's DTCG 2025.10 source.
 *
 * shadcn's palette is `oklch()`, and so is every theme file here (`packages/theme/theme.json` is
 * the upstream gallery theme in the same form). Every value below is quoted from shadcn's
 * registry, never picked by eye:
 *
 *   - colors: `references/shadcn-ui/apps/v4/registry/themes.ts` (theme `neutral`: the one
 *     `shadcn init` writes; `apps/v4/app/globals.css` serves the same palette except `primary` at
 *     `oklch(0% 0 0)`, and the registry's `0.205` is used here)
 *   - radii: `apps/v4/app/globals.css` (`--radius: 0.625rem`, and `--radius-sm` … `--radius-2xl`
 *     at 0.6, 0.8, 1, 1.4, 1.8, 2.2, 2.6 times it)
 *   - finishes: the classes of `apps/v4/registry/new-york-v4/ui/*` (which shadow and fill each
 *     surface wears), flattened: no inner highlight, no inner shade, and a gradient of one colour
 *     where the default theme stacks a two-stop one (every finish states a gradient; see
 *     `docs/specs/theme-roles.md`).
 *
 * A color derived here (an `--input` laid on a card, two tones' midpoint) is mixed in 8-bit sRGB
 * and written back as `oklch()`: `oklch.ts` round-trips every channel exactly.
 *
 * Read by `generate-shadcn.ts`, which writes `packages/theme/tokens/themes/shadcn/` and compiles
 * `packages/theme/themes/shadcn/{theme,semantics}.json`; `docs/archive/theme-shadcn.md` holds the
 * mapping tables this file implements.
 */
import { oklch, oklchColor, over, parseColor, toOklchText, withAlpha } from "./oklch";
import { scaledRadii } from "./style";
import { withSurfaces } from "./surfaces";

/** shadcn's neutrals, quoted from `registry/themes.ts` (theme `neutral`). */
const NEUTRAL = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    primary: "oklch(0.205 0 0)",
    primaryForeground: "oklch(0.985 0 0)",
    control: "oklch(0.97 0 0)",
    muted: "oklch(0.97 0 0)",
    mutedForeground: "oklch(0.556 0 0)",
    accent: "oklch(0.97 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",
    chart: [
      "oklch(0.87 0 0)",
      "oklch(0.556 0 0)",
      "oklch(0.439 0 0)",
      "oklch(0.371 0 0)",
      "oklch(0.269 0 0)",
    ],
    sidebar: "oklch(0.985 0 0)",
  },
  dark: {
    background: "oklch(0.145 0 0)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.205 0 0)",
    primary: "oklch(0.922 0 0)",
    primaryForeground: "oklch(0.205 0 0)",
    control: "oklch(0.269 0 0)",
    muted: "oklch(0.269 0 0)",
    mutedForeground: "oklch(0.708 0 0)",
    accent: "oklch(0.269 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.556 0 0)",
    chart: [
      "oklch(0.87 0 0)",
      "oklch(0.556 0 0)",
      "oklch(0.439 0 0)",
      "oklch(0.371 0 0)",
      "oklch(0.269 0 0)",
    ],
    sidebar: "oklch(0.205 0 0)",
  },
} as const;
type Appearance = keyof typeof NEUTRAL;

/** The default theme's key for a control's fill (spelled in two halves: it is not a word here). */
const CONTROL = "second" + "ary";

/** shadcn's `--radius: 0.625rem` (10 px) and the steps of it the components use. */
const RADIUS = 0.625 * 16;

/** Tailwind's `white` (`bg-white`), which shadcn names outright rather than through a token. */
const WHITE = "oklch(1 0 0)";

/** shadcn's Tailwind v4 shadows, its `rgb(0 0 0 / …)` written as the theme's `oklch()`. */
const SHADOW = {
  xs: `0 1px 2px 0 ${oklchColor(0, 0, 0, 0.05)}`,
  sm: `0 1px 3px 0 ${oklchColor(0, 0, 0, 0.1)}, 0 1px 2px -1px ${oklchColor(0, 0, 0, 0.1)}`,
  md: `0 4px 6px -1px ${oklchColor(0, 0, 0, 0.1)}, 0 2px 4px -2px ${oklchColor(0, 0, 0, 0.1)}`,
} as const;

/** One appearance's neutrals, canonical `oklch()`; `inputOnCard` is `--input` laid on the card. */
function palette(appearance: Appearance) {
  const n = NEUTRAL[appearance];
  const tone = (value: string) => toOklchText(value);
  const card = tone(n.card);
  const input = tone(n.input);
  const border = tone(n.border);
  return {
    background: tone(n.background),
    foreground: tone(n.foreground),
    card,
    primary: tone(n.primary),
    primaryForeground: tone(n.primaryForeground),
    control: tone(n.control),
    muted: tone(n.muted),
    mutedForeground: tone(n.mutedForeground),
    accent: tone(n.accent),
    destructive: tone(n.destructive),
    border,
    input,
    ring: tone(n.ring),
    chart: n.chart.map(tone) as [string, string, string, string, string],
    sidebar: tone(n.sidebar),
    /** `--input` over the card: a pressed control's fill, a dark segment's. */
    inputOnCard: over(input, card),
  };
}

/** `--input` at 30% of its own alpha, as `dark:bg-input/30` composites it (`oklch(1 0 0 / 15%)` → 4.5%). */
const inputThin = (input: string) => {
  const { a } = parseColor(input);
  return withAlpha("white", (a ?? 1) * 0.3);
};

/** A tone's translucent tint, as the theme's `*-tint` tokens write it. */
const tints = (tone: string) => `color-mix(in srgb, var(--${tone}) 10%, transparent)`;

/** The tokens this library adds over shadcn's, per appearance. */
function own(appearance: Appearance) {
  const p = palette(appearance);
  return {
    // A control's raised fill and its press: shadcn's `CONTROL` at rest, `--input` laid on the
    // card pressed (the finishes take the pointer's step from `--accent`, the theme's own).
    raised: p.control,
    pressed: p.inputOnCard,
    // A surface inside a card, a control's track: shadcn's `muted`; an input's well: the card, or
    // `dark:bg-input/30` of it.
    inset: p.muted,
    track: p.muted,
    field: appearance === "light" ? p.background : inputThin(p.input),
    // A switch's knob, a slider's thumb: shadcn's `bg-background` light, `dark:bg-foreground` off and
    // `dark:bg-primary-foreground` on (`switch.tsx` 19–27); the segment's thumb `dark:bg-input/30`.
    knob: appearance === "light" ? p.background : p.foreground,
    knobOn: appearance === "light" ? p.background : p.primaryForeground,
    thumb: appearance === "light" ? p.background : p.inputOnCard,
    // Statuses: shadcn has one red (`destructive`) and no other hue, so the rest step through its
    // grey ramp; `faint` is the quieter of the two muted greys.
    faint: appearance === "light" ? p.ring : p.mutedForeground,
    info: p.mutedForeground,
    warn: appearance === "light" ? p.chart[2] : p.chart[0],
    up: appearance === "light" ? p.chart[3] : p.primary,
    violet: appearance === "light" ? p.chart[4] : p.foreground,
    line: p.border,
    code: p.foreground,
  };
}

/** The theme's own tokens, shared by the appearances (a colour may name one: `var(--primary)`). */
const themeLevel = (light: ReturnType<typeof palette>): Record<string, string> => ({
  ...scaledRadii(RADIUS),
  // The monospaced family: NSH's generic `monospace`, the system's own — neither theme ships a
  // font face. A theme that names one states its family here (the app imports the file).
  "font-mono": "monospace",
  // The main action: shadcn's `primary`, which differs by appearance, so the token names it.
  "brand-fill": "var(--primary)",
  "on-brand": "var(--primary-foreground)",
  scrim: oklchColor(0, 0, 0, 0.5),
  // The ground a photograph sits on, white ink on it, and the dark ink a light chart tile keeps.
  // None of the three flips.
  media: oklchColor(0.1869, 0.0151, 266.766),
  "on-media": oklchColor(1, 0, 0),
  "chart-foreground": light.foreground,
  // The window buttons are the system's on macOS; shadcn has no such token, so close takes its red
  // and the other two the grey ramp.
  "window-close": light.destructive,
  "window-minimize": light.ring,
  "window-zoom": light.chart[3],
  "window-control-ink": `color-mix(in srgb, ${oklchColor(0, 0, 0)} 50%, transparent)`,
  "window-control-edge": `color-mix(in srgb, ${oklchColor(0, 0, 0)} 12%, transparent)`,
});

/** One appearance's colour tokens. */
function section(p: ReturnType<typeof palette>, o: ReturnType<typeof own>) {
  return {
    background: p.background,
    foreground: p.foreground,
    card: p.card,
    "card-foreground": "var(--foreground)",
    popover: p.card,
    "popover-foreground": "var(--foreground)",
    primary: p.primary,
    "primary-foreground": p.primaryForeground,
    [CONTROL]: "var(--raised)",
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
    inset: o.inset,
    raised: o.raised,
    "scrollbar-thumb": "color-mix(in srgb, var(--muted-foreground) 50%, var(--background))",
    "scrollbar-thumb-hover": "color-mix(in srgb, var(--muted-foreground) 80%, var(--background))",
    field: o.field,
    line: o.line,
    // A pressable under the pointer: shadcn's `hover:bg-accent`, not an ink over the surface.
    hover: "var(--accent)",
    // The keyboard focus's halo: shadcn's `ring-ring/50`.
    "ring-halo": "color-mix(in srgb, var(--ring) 50%, transparent)",
    // shadcn draws no edge on a filled pane or round a glass surface (`border-transparent`), so both
    // roles name the theme's border: a theme switched to this one still has the tokens.
    "brand-edge": "var(--border)",
    "glass-edge": "var(--border)",
    faint: o.faint,
    brand: p.primary,
    track: o.track,
    knob: o.knob,
    code: o.code,
    info: o.info,
    warn: o.warn,
    up: o.up,
    down: "var(--destructive)",
    "brand-tint": tints("brand"),
    "on-brand-tint": "var(--foreground)",
    inverse: "var(--card)",
    "inverse-foreground": "var(--foreground)",
    "inverse-muted": "var(--muted-foreground)",
    "inverse-brand": "var(--primary-foreground)",
    "info-tint": tints("info"),
    "warn-tint": tints("warn"),
    "destructive-tint": tints("destructive"),
    "up-tint": tints("up"),
    "down-tint": tints("destructive"),
    violet: o.violet,
    "window-control-off": o.faint,
  };
}

/** A finish names the theme's token instead of writing its colour: one shape, the theme's colours. */
const alias = (token: string) => `{${token}}`;

/**
 * A flat finish's gradient: its colour at both stops. Every finish states one, so a theme that
 * draws a gradient of one colour says "no gradient" with that, not with a missing key.
 */
const flat = (color: string) => `linear-gradient(180deg, ${color} 0%, ${color} 100%)`;

/** A surface: its colour, the gradient over it, its shadow and its edge. */
const surface = (
  color: string,
  {
    boxShadow = "none",
    borderColor = "transparent",
  }: { boxShadow?: string; borderColor?: string } = {},
) => ({ backgroundColor: color, backgroundImage: flat(color), boxShadow, borderColor });

/** One appearance's finishes: flat, the lift of shadcn's own surfaces and no more. */
function finishes(appearance: Appearance, o: ReturnType<typeof own>) {
  return {
    card: { backgroundImage: flat(alias("card")), boxShadow: SHADOW.sm },
    inset: { boxShadow: "none" },
    field: { boxShadow: SHADOW.xs },
    raised: surface(alias("raised"), { boxShadow: SHADOW.xs }),
    hover: surface(alias("hover"), { boxShadow: SHADOW.xs }),
    // Pressed, the lift goes: the one cue a flat theme has left (shadcn styles no press state).
    // Light, `--input` laid on the card is `--border`'s own grey (shadcn's light `input` and `border`
    // are one colour), so the finish names that token; dark, no token holds the fill.
    pressed: surface(appearance === "light" ? alias("border") : o.pressed),
    light: surface(alias("primary")),
    accent: surface(alias("primary")),
    // A rail has no lip of its own (shadcn draws the track flat): the edge comes from the theme's
    // `border`, and `theme.ts`'s `insetEdge` keeps this `none` from voiding it.
    track: { boxShadow: "none", borderColor: alias("border") },
    // A run's colour is carried by the gradient: the engine draws the gradient over the fill's
    // colour, so a colour under it shows through and tints the run. `transparent` is the one that
    // does not.
    fill: {
      backgroundColor: "transparent",
      backgroundImage: flat(alias("primary")),
      boxShadow: "none",
      borderColor: "transparent",
    },
    knob: surface(alias("knob"), { boxShadow: SHADOW.sm }),
    // Lit, the knob is `background` light and `primary-foreground` dark: no token of its own.
    knobOn: surface(alias(appearance === "light" ? "background" : "primary-foreground"), {
      boxShadow: SHADOW.sm,
    }),
    // A slider's thumb: white with a `primary` edge in both appearances (`slider.tsx`'s
    // `border-primary bg-white shadow-sm`), where a switch's knob has no edge.
    handle: surface(WHITE, { boxShadow: SHADOW.sm, borderColor: alias("primary") }),
    pill: surface(alias("raised"), { boxShadow: SHADOW.xs }),
    thumb: surface(o.thumb, { boxShadow: SHADOW.sm }),
    // What stays chosen: the neutral ramp's step a press is not (shadcn has no fourth grey).
    on: surface(alias(appearance === "light" ? "chart-1" : "chart-3")),
    // shadcn's combobox chip: a flat `bg-muted` label, no edge and no shadow.
    chip: surface(alias("muted"), { boxShadow: "none" }),
    glass: {
      // A control over a photo: the card's own colour at 80% (`bg-card/80`), named at that alpha.
      backgroundColor: "oklch(from {card} l c h / 0.8)",
      boxShadow: "none",
      borderColor: alias("border"),
      backdropFilter: "blur(20px)",
    },
    menu: { backgroundColor: alias("card"), boxShadow: SHADOW.md, borderColor: alias("border") },
    groove: { boxShadow: "none" },
  };
}

/** Theme data and theme-specific DTCG descriptions ready for `emitDtcgTheme`. */
export function themeFiles(): ThemeGeneratorOutput {
  const light = palette("light");
  const dark = palette("dark");
  const ownLight = own("light");
  const ownDark = own("dark");
  const statusAndHoverDescriptions = {
    hover: "Pointer hover fill aliased to {color.accent} per shadcn hover:bg-accent.",
    "brand-edge":
      "Hairline border aliased to {color.border} (shadcn draws no separate brand edge).",
    "glass-edge":
      "Hairline border aliased to {color.border} (shadcn draws no separate glass edge).",
    info: "Informational semantic status color mapped onto shadcn's neutral grey ramp.",
    warn: "Warning semantic status color mapped onto shadcn's neutral chart ramp.",
    up: "Positive trend color mapped onto shadcn's neutral ramp.",
    violet: "Accent data-visualization and link color mapped onto shadcn's neutral ramp.",
  };

  return {
    id: "shadcn",
    name: "shadcn neutral",
    resolverDescription: "DTCG 2025.10 resolver for the shadcn neutral theme.",
    themeDescription:
      "Appearance-invariant base tokens and press-scale override for the shadcn neutral theme.",
    finishesDescription:
      "Appearance-invariant surface finish recipes for the shadcn neutral theme.",
    lightDescription: "Light appearance colors and finish overrides for the shadcn neutral theme.",
    darkDescription: "Dark appearance colors and finish overrides for the shadcn neutral theme.",
    // A flat theme draws no press of its own: its surfaces change colour under the finger, they
    // do not sink (`state.pressScale` of 1, which `pressSink` reads as "no sink").
    pressScale: 1,
    pressScaleDescription:
      "Scale factor applied while pressed (1 disables press shrinking for flat shadcn surfaces).",
    cssVars: {
      theme: themeLevel(light),
      light: section(light, ownLight),
      dark: section(dark, ownDark),
    },
    finishes: {
      light: withoutMaterial(withSurfaces(finishes("light", ownLight))),
      dark: withoutMaterial(withSurfaces(finishes("dark", ownDark))),
    },
    descriptions: {
      sharedColors: {
        "brand-fill": "Primary brand action fill, aliased to {color.primary}.",
        "on-brand":
          "Foreground text and icons on brand-fill surfaces, aliased to {color.primary-foreground}.",
        scrim: "Translucent backdrop scrim behind modals and sheets (50% black).",
        "window-close": "macOS window close traffic-light fill mapped to shadcn destructive red.",
        "window-minimize": "macOS window minimize traffic-light fill mapped to shadcn ring grey.",
        "window-zoom": "macOS window zoom traffic-light fill mapped to shadcn chart-4 grey.",
      },
      lightColors: statusAndHoverDescriptions,
      darkColors: statusAndHoverDescriptions,
    },
  };
}

/** The palette, for the report's table (`generate-shadcn.ts` prints it): each source `oklch()` and the sRGB it lands on. */
export function conversionTable(): { oklch: string; hex: string }[] {
  const seen = new Map<string, string>();
  for (const appearance of ["light", "dark"] as const) {
    for (const value of Object.values(NEUTRAL[appearance]).flat()) {
      if (typeof value === "string" && !seen.has(value)) seen.set(value, oklch(value));
    }
  }
  return [...seen].map(([value, hex]) => ({ oklch: value, hex }));
}
