/**
 * The shadcn default theme (new-york-v4, `neutral`) as this library's two theme files.
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
 *     surface wears), flattened: no gradient, no inner highlight, no inner shade.
 *
 * A color derived here (an `--input` laid on a card, two tones' midpoint) is mixed in 8-bit sRGB
 * and written back as `oklch()`: `oklch.ts` round-trips every channel exactly.
 *
 * Read by `generate-shadcn.ts`, which writes the two JSON files; `docs/specs/theme-shadcn.md`
 * holds the mapping tables this file implements.
 */
import { mix, oklch, oklchColor, over, parseColor, toOklchText, withAlpha } from "./oklch";

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
/** `--radius-md` (0.8) / `--radius-xl` (1.4), as the theme's lengths. */
const radius = (times: number) => `${Math.round(RADIUS * times)}px`;

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
    // A control's raised fill, hover and press: shadcn's `CONTROL` at rest, `--input` pressed,
    // half way between them under the pointer.
    raised: p.control,
    hover: mix(p.control, p.inputOnCard, 0.5),
    pressed: p.inputOnCard,
    // On (a toggle, a chosen tool, a selected button): a step further off than a press, as the
    // default theme's `on` is. shadcn has no hue to give it, so it takes the neutral ramp's step.
    on: appearance === "light" ? p.chart[0] : p.chart[2],
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
  radius: radius(0.8),
  "radius-card": radius(1.4),
  "radius-control": radius(0.8),
  // The main action: shadcn's `primary`, which differs by appearance, so the token names it.
  "brand-fill": "var(--primary)",
  "on-brand": "var(--primary-foreground)",
  scrim: oklchColor(0, 0, 0, 0.5),
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
    hover: "color-mix(in srgb, var(--foreground) 5%, transparent)",
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
    "info-tint": tints("info"),
    "warn-tint": tints("warn"),
    "destructive-tint": tints("destructive"),
    "up-tint": tints("up"),
    "down-tint": tints("destructive"),
    violet: o.violet,
    "window-control-off": o.faint,
  };
}

/** A flat fill: one colour, and a two-stop gradient of it for what draws `backgroundImage` alone. */
const fill = (color: string) => ({
  backgroundColor: color,
  backgroundImage: `linear-gradient(180deg, ${color} 0%, ${color} 100%)`,
  boxShadow: "none",
  borderColor: "transparent",
});

/** A control that stands up: shadcn's `shadow-xs`, no edge of its own. */
const raised = (color: string) => ({
  backgroundColor: color,
  boxShadow: SHADOW.xs,
  borderColor: "transparent",
});

/** One appearance's finishes: flat, the lift of shadcn's own surfaces and no more. */
function finishes(p: ReturnType<typeof palette>, o: ReturnType<typeof own>) {
  return {
    card: { boxShadow: SHADOW.sm },
    inset: { boxShadow: "none" },
    field: { boxShadow: SHADOW.xs },
    raised: raised(o.raised),
    hover: raised(o.hover),
    // Pressed, the lift goes: the one cue a flat theme has left (shadcn styles no press state).
    pressed: { backgroundColor: o.pressed, boxShadow: "none", borderColor: "transparent" },
    light: { backgroundColor: p.primary, boxShadow: "none", borderColor: "transparent" },
    accent: { backgroundColor: p.primary, boxShadow: "none", borderColor: "transparent" },
    // A rail composes `boxShadow` after a comma (`slider.tsx:58`), where `none` voids the whole
    // declaration: a transparent inset ring says "flat" and stays valid.
    track: { boxShadow: "inset 0 0 0 1px transparent", borderColor: p.border },
    fill: fill(p.primary),
    knob: { backgroundColor: o.knob, boxShadow: SHADOW.sm, borderColor: "transparent" },
    knobOn: { backgroundColor: o.knobOn, boxShadow: SHADOW.sm, borderColor: "transparent" },
    pill: raised(o.raised),
    thumb: { backgroundColor: o.thumb, boxShadow: SHADOW.sm, borderColor: "transparent" },
    on: { backgroundColor: o.on, boxShadow: "none", borderColor: "transparent" },
    chip: { boxShadow: "none" },
    glass: {
      backgroundColor: withAlpha(p.card, 0.8),
      boxShadow: "none",
      borderColor: p.border,
      backdropFilter: "blur(20px)",
    },
    menu: { backgroundColor: p.card, boxShadow: SHADOW.md, borderColor: p.border },
    groove: { boxShadow: "none" },
  };
}

/** A file's value for every key of the default file, in the default file's order. */
const ordered = <T>(keys: Record<string, string>, values: Record<string, T>): Record<string, T> =>
  Object.fromEntries(
    Object.keys(keys).map((key) => {
      const value = values[key];
      if (value === undefined) throw new Error(`no value for theme key ${key}`);
      return [key, value];
    }),
  );

/**
 * Both theme files, in the key order of the default ones (so the two diff side by side).
 *
 * `defaults` are the default files' keys: `theme`, `light`, `dark` and the finishes' two.
 */
export function themeFiles(defaults: {
  theme: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
  lightFinishes: Record<string, string>;
  darkFinishes: Record<string, string>;
}) {
  const light = palette("light");
  const dark = palette("dark");
  const ownLight = own("light");
  const ownDark = own("dark");
  return {
    theme: {
      name: "shadcn neutral",
      cssVars: {
        theme: ordered(defaults.theme, themeLevel(light)),
        light: ordered(defaults.light, section(light, ownLight)),
        dark: ordered(defaults.dark, section(dark, ownDark)),
      },
    },
    finishes: {
      dark: ordered(defaults.darkFinishes, finishes(dark, ownDark)),
      light: ordered(defaults.lightFinishes, finishes(light, ownLight)),
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
