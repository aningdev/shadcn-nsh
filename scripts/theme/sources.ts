/**
 * The colour scope of a theme (ADR 0007 §4): fifteen sources a theme writes a value for, and every
 * other key a reference to one of them or a `*-tint` from one formula. A generator builds the colours
 * it has (a palette, a stylesheet, a spec's tokens) and `reduceColours` keeps the sources and writes
 * the rest as `var(--source)` or `color-mix(in srgb, var(--tone) N%, transparent)`.
 */

/** The keys a theme writes a value for. */
export const COLOUR_SOURCES = [
  "primary",
  "primary-foreground",
  "secondary",
  "foreground",
  "muted-foreground",
  "faint",
  "background",
  "card",
  "muted",
  "border",
  "line",
  "destructive",
  "warn",
  "info",
  "up",
] as const;
export type ColourSource = (typeof COLOUR_SOURCES)[number];

/** The keys that are theme-wide constants (the C layer), identical in both appearances. */
export const SHARED_COLOURS = ["scrim", "media", "on-media"] as const;

/** The tones a `*-tint` washes, by tint key. */
export const TINT_TONES: Record<string, string> = {
  "brand-tint": "primary",
  "info-tint": "info",
  "warn-tint": "warn",
  "destructive-tint": "destructive",
  "up-tint": "up",
  "down-tint": "destructive",
};

/** The one formula every tint is written with. */
export const tint = (tone: string, percent: number): string =>
  `color-mix(in srgb, var(--${tone}) ${percent}%, transparent)`;

/** The choices a theme makes where its derived keys have more than one honest source. */
export interface ColourScheme {
  /** The one tint percentage of the theme. */
  tint: number;
  /** The source the focus ring takes. */
  ring: ColourSource;
  /** The source a field's fill takes. */
  field: ColourSource;
  /** The source a switch knob takes in the light appearance, and in the dark one. */
  knob: [ColourSource, ColourSource];
  /** `secondary` is the old raised value (a control surface on a card); otherwise it keeps its own. */
  secondaryIsRaised: boolean;
  /** The source `raised` takes when it is not `secondary`. */
  raised: ColourSource;
  /** The sources the inverse surface and its ink take. */
  inverse: [ColourSource, ColourSource];
  /** `border` is the generator's `input` (the strong edge), not its `border` (a theme whose hairline is weaker than a field's edge). */
  strongBorder?: boolean;
  /** Chart series: five sources, or a foreground grey ramp. */
  chart: ColourSource[] | "ramp";
}

const RAMP = [90, 70, 55, 40, 25];

/**
 * One appearance's colours reduced to the scope: `full` is what the generator built, `appearance`
 * picks the knob. Keys the scope drops (`violet`, `glass-edge`, `ring-halo`) are not in the result.
 */
export function reduceColours(
  full: Record<string, string>,
  scheme: ColourScheme,
  appearance: "light" | "dark",
): Record<string, string> {
  const ref = (name: string) => `var(--${name})`;
  const out: Record<string, string> = {};
  for (const name of COLOUR_SOURCES) {
    const own =
      name === "secondary" && scheme.secondaryIsRaised
        ? full.raised
        : name === "border" && scheme.strongBorder
          ? full.input
          : full[name];
    if (own === undefined) throw new Error(`the theme writes no source colour ${name}`);
    out[name] = own;
  }
  for (const name of SHARED_COLOURS) if (full[name] !== undefined) out[name] = full[name];
  const knob = scheme.knob[appearance === "light" ? 0 : 1];
  const chart =
    scheme.chart === "ramp"
      ? RAMP.map((p) => `color-mix(in srgb, var(--foreground) ${p}%, var(--background))`)
      : scheme.chart.map(ref);
  Object.assign(out, {
    accent: ref("muted"),
    inset: ref("muted"),
    track: ref("muted"),
    hover: ref("muted"),
    popover: ref("card"),
    sidebar: ref("background"),
    "sidebar-accent": ref("muted"),
    field: ref(scheme.field),
    raised: ref(scheme.secondaryIsRaised ? "secondary" : scheme.raised),
    knob: ref(knob),
    input: ref("border"),
    "sidebar-border": ref("line"),
    ring: ref(scheme.ring),
    "sidebar-ring": ref(scheme.ring),
    brand: ref("primary"),
    "brand-edge": ref("border"),
    "inverse-brand": ref("primary-foreground"),
    inverse: ref(scheme.inverse[0]),
    "inverse-foreground": ref(scheme.inverse[1]),
    "sidebar-primary": ref("primary"),
    "sidebar-primary-foreground": ref("primary-foreground"),
    "chart-1": chart[0]!,
    "chart-2": chart[1]!,
    "chart-3": chart[2]!,
    "chart-4": chart[3]!,
    "chart-5": chart[4]!,
  });
  for (const name of [
    "card-foreground",
    "popover-foreground",
    "secondary-foreground",
    "accent-foreground",
    "sidebar-foreground",
    "sidebar-accent-foreground",
  ])
    out[name] = ref("foreground");
  for (const [name, tone] of Object.entries(TINT_TONES)) out[name] = tint(tone, scheme.tint);
  return out;
}
