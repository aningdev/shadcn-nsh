/**
 * The colour scope of a theme (docs/decisions/0007-theme-customization-scope.md,
 * docs/decisions/0012-derived-colours-are-defaults.md): which colour keys a theme may state, which
 * of them a specification states a value for, and which of them the derivation writes.
 *
 * A generator builds every colour its specification gives (a palette, a stylesheet, a spec's
 * tokens) and hands them to `reduceColours`, which keeps each value the specification states —
 * recording the name the colour has there, the provenance ADR 0012 §4 asks for — and writes the
 * ADR 0007 §4 derivation only for the keys the specification leaves open. Keys outside the scope
 * (`violet`, `glass-edge`, `ring-halo`) are dropped; the key set itself is unchanged.
 */

/** ADR 0007 §4: the colours a theme writes a value for (15). */
export const sourceColours = [
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
export type ColourSource = (typeof sourceColours)[number];

/** Colours that are fixed by what they sit on, not by the theme's palette: they stay literal. */
export const constantColours = ["scrim", "media", "on-media"] as const;

/** The tones a `*-tint` washes, by tint key (ADR 0007 §4). */
export const TINT_TONES: Record<string, string> = {
  "brand-tint": "primary",
  "info-tint": "info",
  "warn-tint": "warn",
  "destructive-tint": "destructive",
  "up-tint": "up",
};

/** ADR 0007 §4: the `*-tint` colours share one formula, `color-mix(in srgb, <source> N%, transparent)`. */
export const tintColours: readonly string[] = Object.keys(TINT_TONES);

/** ADR 0007 §4: the `chart-*` series point at a source, or at a grey derived from the foreground. */
export const chartColours: readonly string[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

/** The colours a theme points at unless its specification states them: shadcn / NSH slots and the library's roles. */
export const referenceColours: readonly string[] = [
  "card-foreground",
  "popover",
  "popover-foreground",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "input",
  "ring",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "inset",
  "raised",
  "field",
  "track",
  "knob",
  "hover",
  "brand",
  "brand-edge",
  "focus-inner",
  "inverse",
  "inverse-foreground",
  "inverse-brand",
  ...tintColours,
  ...chartColours,
];

/** The one formula every tint is written with. */
export const tint = (tone: string, percent: number): string =>
  `color-mix(in srgb, var(--${tone}) ${percent}%, transparent)`;

/** Where a theme's stated values come from (ADR 0012 §4). */
export interface ColourOrigin {
  /** The specification the values are read from, e.g. "Material 3 sys.color". */
  spec: string;
  /** Each colour's name in that specification, by key: `on-surface`, `--chart-3`, `systemBlue`. */
  names: Record<string, string>;
}

/** The choices a theme makes where its derived keys have more than one honest source. */
export interface ColourScheme {
  /** The one tint percentage of the theme, for a tint its specification leaves to the derivation. */
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
  /** Chart series: five sources, or a foreground grey ramp. */
  chart: ColourSource[] | "ramp";
}

/** One appearance's colours as the theme writes them, and the provenance of the stated ones. */
export interface ReducedColours {
  /** The scope's colours, in the order the theme writes them. */
  colours: Record<string, string>;
  /** The keys whose value a specification states, each as `"<spec>: <name>"` (ADR 0012 §4). */
  provenance: Record<string, string>;
}

/** The provenance a theme states, by appearance. */
export type ColourProvenance = Record<"theme" | "light" | "dark", Record<string, string>>;

const RAMP = [90, 70, 55, 40, 25];

const pointer = /^var\(--[a-z0-9-]+\)$/;

/** The `*-tint` formula, which states a strength rather than a colour and so needs no provenance. */
const tintFormula = /^color-mix\(in srgb, var\(--[a-z-]+\) \d+%, transparent\)$/;

/**
 * One appearance's colours reduced to the scope: `full` is what the generator built from its
 * specification, `origin` names each stated value there, and `appearance` picks the knob.
 */
export function reduceColours(
  full: Record<string, string>,
  origin: ColourOrigin,
  scheme: ColourScheme,
  appearance: "light" | "dark",
): ReducedColours {
  const ref = (name: string) => `var(--${name})`;
  const colours: Record<string, string> = {};
  const provenance: Record<string, string> = {};

  const write = (key: string, stated: string | undefined, derived: string): void => {
    colours[key] = stated ?? derived;
    if (stated === undefined || pointer.test(stated)) return;
    if (tintColours.includes(key) && tintFormula.test(stated)) return;
    const name = origin.names[key];
    if (name === undefined)
      throw new Error(
        `the theme states ${key} as \`${stated}\` and its origin names no source for it (ADR 0012 §4)`,
      );
    provenance[key] = `${origin.spec}: ${name}`;
  };

  for (const name of sourceColours) {
    const own = name === "secondary" && scheme.secondaryIsRaised ? full.raised : full[name];
    if (own === undefined) throw new Error(`the theme writes no source colour ${name}`);
    // A source is the theme's own value (ADR 0007 §4): there is nothing behind it to cite.
    colours[name] = own;
  }
  for (const name of constantColours) if (full[name] !== undefined) colours[name] = full[name]!;

  const knob = scheme.knob[appearance === "light" ? 0 : 1];
  const chart =
    scheme.chart === "ramp"
      ? RAMP.map((p) => `color-mix(in srgb, var(--foreground) ${p}%, var(--background))`)
      : scheme.chart.map(ref);

  write("accent", full.accent, ref("muted"));
  write("inset", full.inset, ref("muted"));
  write("track", full.track, ref("muted"));
  write("hover", full.hover, ref("muted"));
  write("popover", full.popover, ref("card"));
  write("sidebar", full.sidebar, ref("background"));
  write("sidebar-accent", full["sidebar-accent"], ref("muted"));
  write("field", full.field, ref(scheme.field));
  write("raised", full.raised, ref(scheme.secondaryIsRaised ? "secondary" : scheme.raised));
  write("knob", full.knob, ref(knob));
  write("input", full.input, ref("border"));
  write("sidebar-border", full["sidebar-border"], ref("line"));
  write("ring", full.ring, ref(scheme.ring));
  write("sidebar-ring", full["sidebar-ring"], ref(scheme.ring));
  write("brand", full.brand, ref("primary"));
  write("brand-edge", full["brand-edge"], ref("border"));
  write("focus-inner", full["focus-inner"], ref("card"));
  write("inverse-brand", full["inverse-brand"], ref("primary-foreground"));
  write("inverse", full.inverse, ref(scheme.inverse[0]));
  write("inverse-foreground", full["inverse-foreground"], ref(scheme.inverse[1]));
  write("sidebar-primary", full["sidebar-primary"], ref("primary"));
  write(
    "sidebar-primary-foreground",
    full["sidebar-primary-foreground"],
    ref("primary-foreground"),
  );
  for (const [index, key] of chartColours.entries()) write(key, full[key], chart[index]!);
  for (const key of [
    "card-foreground",
    "popover-foreground",
    "secondary-foreground",
    "accent-foreground",
    "sidebar-foreground",
    "sidebar-accent-foreground",
  ])
    write(key, full[key], ref("foreground"));
  for (const [key, tone] of Object.entries(TINT_TONES))
    write(key, full[key], tint(tone, scheme.tint));

  return { colours, provenance };
}
