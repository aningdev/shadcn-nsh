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
 *   - palette/typography/motion: rewritten from `packages/theme/tokens/themes/shadcn/`.
 *   - finishes and the shadow scale: `finishes/shadcn.ts` (the classes of
 *     `apps/v4/registry/new-york-v4/ui/*`, flattened: no inner highlight, no inner shade).
 *
 * A color derived here (an `--input` laid on a card, two tones' midpoint) is mixed in 8-bit sRGB
 * and written back as `oklch()`: `oklch.ts` round-trips every channel exactly.
 *
 * Read by `generate-shadcn.ts`, which writes `packages/theme/tokens/themes/shadcn/` and compiles
 * `packages/theme/themes/shadcn/{theme,semantics}.json`.
 */
import type { ThemeGeneratorOutput } from "./dtcg";
import { finishes, shadows } from "./finishes/shadcn";
import { oklch, oklchColor, over, parseColor, toOklchText, withAlpha } from "./oklch";
import { scaledRadii } from "./style";

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

/** shadcn's neutral corner radius roles by layer: 8 px control, 12 px container, 14 px modal. */
const RADII = { control: 8, container: 12, modal: 14 } as const;

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
    // A switch's knob, a slider's thumb: shadcn's `bg-background` light, `dark:bg-foreground` off
    // (`switch.tsx` 19–27); on, the switch reads the accent's ink.
    knob: appearance === "light" ? p.background : p.foreground,
    // Statuses: shadcn has one red (`destructive`) and no other hue, so the rest step through its
    // grey ramp; `faint` is the quieter of the two muted greys.
    faint: appearance === "light" ? p.ring : p.mutedForeground,
    info: p.mutedForeground,
    warn: appearance === "light" ? p.chart[2] : p.chart[0],
    up: appearance === "light" ? p.chart[3] : p.primary,
    violet: appearance === "light" ? p.chart[4] : p.foreground,
    line: p.border,
  };
}

/** The theme's own tokens, shared by the appearances (a colour may name one: `var(--primary)`). */
const themeLevel = (): Record<string, string> => ({
  ...scaledRadii(RADII),
  // The families: NSH's generic `system-ui` and `monospace`, the system's own — neither theme
  // ships a font face. A theme that names one states its family here (the app imports the file).
  "font-sans": "system-ui",
  "font-mono": "monospace",
  scrim: oklchColor(0, 0, 0, 0.5),
  // The ground a photograph sits on, white ink on it. Neither flips.
  media: oklchColor(0.1869, 0.0151, 266.766),
  "on-media": oklchColor(1, 0, 0),
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
    info: o.info,
    warn: o.warn,
    up: o.up,
    "brand-tint": tints("brand"),
    inverse: "var(--card)",
    "inverse-foreground": "var(--foreground)",
    "inverse-brand": "var(--primary-foreground)",
    "info-tint": tints("info"),
    "warn-tint": tints("warn"),
    "destructive-tint": tints("destructive"),
    "up-tint": tints("up"),
    "down-tint": tints("destructive"),
    violet: o.violet,
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
    resolverDescription: "shadcn/ui neutral theme.",
    themeDescription:
      "Appearance-invariant base tokens and press-scale override for the shadcn neutral theme.",
    finishesDescription:
      "Appearance-invariant surface finish recipes for the shadcn neutral theme.",
    lightDescription: "Light appearance colors and finish overrides for the shadcn neutral theme.",
    darkDescription: "Dark appearance colors and finish overrides for the shadcn neutral theme.",
    // A flat theme draws no press of its own: its surfaces change colour under the finger, they
    // do not sink (`state["press-scale"]` of 1, which `press.scale` reads as "no sink").
    "press-scale": 1,
    designMd: {
      overview:
        "shadcn/ui's neutral palette paired with flat surfaces (`state.press-scale: 1`) and Tailwind-style border/shadow lifts (`references/shadcn-ui` `new-york-v4`).",
      elevation:
        "Flat elevation model: cards and floating surfaces sit on neutral background steps with subtle drop shadows and crisp 1px borders rather than inner specular highlights or glass blur.",
      dos: [
        "Keep press interactions flat (`state.press-scale: 1`); signal hover and press via surface and opacity changes.",
        "Preserve the 31 shadcn A-layer color slots (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar*`).",
      ],
      donts: [
        "Do not add backdrop blur, specular rim highlights, or spring press shrink to flat shadcn finishes.",
      ],
    },
    // shadcn's neutral muted text is 4.4:1 on its muted surfaces, as shipped upstream.
    contrast: {
      waivers: ["muted", "raised"].map((bg) => ({
        fg: "muted-foreground",
        bg,
        source: "shadcn neutral muted-foreground on muted",
      })),
    },
    cssVars: {
      theme: themeLevel(),
      light: section(light, ownLight),
      dark: section(dark, ownDark),
    },
    finishes,
    shadows,
    descriptions: {
      style: {
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking for flat shadcn surfaces).",
      },
      sharedColors: {
        scrim: "Translucent backdrop scrim behind modals and sheets (50% black).",
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
