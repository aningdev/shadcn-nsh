import type { ThemeGeneratorOutput } from "./dtcg";
import { finishes, shadows } from "./finishes/solid-glass";
/**
 * Solid Glass (deeplethe/solid-glass) as this library's DTCG 2025.10 source.
 *
 * Quoted from the theme's own stylesheet, `src/solid-glass.css`, at commit `6e8903e` (MIT, © 2026
 * DeepLethe; the notice is in `NOTICE`): `:root` is the material in daylight, `.dark` the material
 * as its author designed it. Every value below is written as the stylesheet writes it and is
 * normalized to canonical `oklch()` when the files are written (`oklch.ts`), so a line here can be
 * read against the CSS line it comes from.
 *
 * The material: every surface is a thick pane of smoky glass with very little see-through — solid
 * from a distance, glass only at its edges. That is three lines and never a gradient across the
 * face: a rim of light along the top edge, a hairline all round, a shadow gathered underneath.
 * Thickness is the three tiers (`panel` < `card` < `popover`); thicker is more opaque. Every state
 * — hovered, chosen, held open — wears the same small pane of clear glass.
 *
 * Where this library's theme and the stylesheet do not line up one to one, the reason is written at
 * the mapping. What NSH cannot draw at all is in the port's report: NSH takes a theme's finishes by
 * role (`theme.ts`'s `themed`), so a role carries the keys the default theme declares for it — a
 * `backdropFilter` outside `glass` is one of those, and a gradient across a face is one this
 * material never wanted.
 *
 * Read by `generate-solid-glass.ts`, which writes `packages/theme/tokens/themes/solid-glass/` and
 * compiles `packages/theme/themes/solid-glass/{theme,semantics}.json`.
 */
import { over } from "./oklch";
import { reduceColours, type ColourScheme } from "./sources";
import { scaledRadii } from "./style";

/** One appearance of the stylesheet's variables, by name (without the `--`). */
type Source = Record<string, string>;

/** A finish role, as `semantics.json` writes it: the keys the default theme declares for the role. */

/** `:root`: the panes in daylight, on a cool grey page. */
const LIGHT: Source = {
  background: "oklch(0.925 0.007 265)",
  foreground: "oklch(0.16 0 0)",
  // Thickness: panel < card < popover.
  panel: "oklch(0.975 0.004 265 / 44%)",
  card: "oklch(0.98 0.004 265 / 60%)",
  popover: "oklch(0.985 0.003 265 / 96%)",
  primary: "oklch(0.2 0 0)",
  "primary-foreground": "oklch(0.985 0 0)",
  muted: "oklch(0.3 0.02 265 / 7%)",
  "muted-foreground": "oklch(0.47 0 0)",
  accent: "oklch(0.3 0.02 265 / 9%)",
  destructive: "oklch(0.577 0.245 27.325)",
  border: "oklch(0.3 0.02 265 / 13%)",
  // A rail, an empty box: shadcn's `--input`, cut into the surface as a groove below.
  input: "oklch(0.3 0.02 265 / 15%)",
  ring: "oklch(0.7 0 0)",
  // The finish: the line of light on a pane's top edge, a faint second line inside it, the
  // hairline round the outside, the shadow underneath.
  "glass-rim": "oklch(1 0 0 / 90%)",
  "glass-inner": "oklch(1 0 0 / 35%)",
  "popover-edge": "oklch(0.38 0.03 265 / 22%)",
  "popover-under": "oklch(0.38 0.03 265 / 16%)",
  "glass-shade": "oklch(0.3 0.06 265 / 28%)",
  "glass-contact": "oklch(0.25 0.03 265 / 6%)",
  "glass-lift": "oklch(0.25 0.03 265 / 14%)",
  // Clear glass, for small things and for the one state.
  "glass-control": "oklch(1 0 0 / 55%)",
  "glass-control-rim": "oklch(1 0 0 / 80%)",
  "glass-state": "oklch(0.3 0.02 265 / 9%)",
  "glass-state-rim": "oklch(1 0 0 / 85%)",
  "glass-state-edge": "oklch(0.3 0.02 265 / 13%)",
  "glass-state-armed": "oklch(0.3 0.02 265 / 26%)",
  // Under the pointer: the theme's own step, strong enough to read on a white pane.
  hover: "oklch(0.3 0.02 265 / 10%)",
  // The button that asks to be pressed: a pane the colour of the ink, lit along its top edge,
  // shaded along its bottom one, a hairline round it.
  // The share of the ink a solid pane keeps (`--primary-solid`): a pane, not a hole.
  "primary-solid": "88%",
  "primary-rim": "oklch(1 0 0 / 30%)",
  "primary-under": "oklch(0 0 0 / 45%)",
  "primary-inner": "oklch(1 0 0 / 7%)",
  "primary-edge": "oklch(0.2 0 0 / 30%)",
  field: "oklch(1 0 0 / 60%)",
  "field-rim": "oklch(1 0 0)",
  "field-edge": "oklch(0.3 0.02 265 / 14%)",
  // A groove (a track, an empty box): shaded under its upper lip, lit along its lower one.
  "well-shade": "oklch(0.3 0.06 265 / 14%)",
  "well-rim": "oklch(1 0 0 / 85%)",
  "focus-line": "oklch(0.2 0 0 / 50%)",
  // A knob is the brightest pane there is.
  knob: "oklch(1 0 0)",
  "knob-shade": "oklch(0.3 0.06 265 / 30%)",
  // Dark enough for a link on the page (WCAG AA 4.5); the wash below keeps the lighter teal.
  brand: "oklch(0.49 0.12 165)",
  "brand-foreground": "oklch(0.99 0 0)",
  "brand-muted": "oklch(0.68 0.13 165 / 12%)",
  // Hue means finished or stopped; motion means running.
  "status-done": "oklch(0.56 0.16 248)",
  success: "oklch(0.58 0.15 152)",
  "status-interrupted": "oklch(0.66 0.16 58)",
  // Code is set in a few colours; this is the one a name is set in.
  "syn-name": "oklch(0.47 0.15 310)",
  // Charts are drawn in greys, like the rest: no hue of their own.
  "chart-1": "oklch(0.7 0 0)",
  "chart-2": "oklch(0.54 0 0)",
  "chart-3": "oklch(0.44 0 0)",
  "chart-4": "oklch(0.35 0 0)",
  "chart-5": "oklch(0.27 0 0)",
  sidebar: "oklch(0.975 0.004 265 / 44%)",
  "sidebar-foreground": "oklch(0.25 0 0)",
  "sidebar-accent": "oklch(0.3 0.02 265 / 9%)",
  "sidebar-border": "oklch(0.3 0.02 265 / 12%)",
};

/** `.dark`: an even, unlit page, and the glass turns smoky. */
const DARK: Source = {
  background: "oklch(0.16 0 0)",
  foreground: "oklch(0.985 0 0)",
  panel: "oklch(1 0 0 / 4.5%)",
  card: "oklch(0.31 0 0 / 46%)",
  popover: "oklch(0.22 0 0 / 96%)",
  primary: "oklch(0.94 0 0)",
  "primary-foreground": "oklch(0.18 0 0)",
  muted: "oklch(1 0 0 / 7%)",
  "muted-foreground": "oklch(0.72 0 0)",
  accent: "oklch(1 0 0 / 8%)",
  destructive: "oklch(0.704 0.191 22.216)",
  border: "oklch(1 0 0 / 11%)",
  input: "oklch(1 0 0 / 13%)",
  ring: "oklch(0.52 0 0)",
  "glass-rim": "oklch(1 0 0 / 16%)",
  "glass-inner": "oklch(1 0 0 / 4%)",
  "popover-edge": "oklch(1 0 0 / 6%)",
  "popover-under": "oklch(0 0 0 / 0%)",
  "glass-shade": "oklch(0 0 0 / 60%)",
  "glass-contact": "oklch(0 0 0 / 10%)",
  "glass-lift": "oklch(0 0 0 / 22%)",
  "glass-control": "oklch(1 0 0 / 7%)",
  "glass-control-rim": "oklch(1 0 0 / 11%)",
  "glass-state": "oklch(1 0 0 / 7%)",
  "glass-state-rim": "oklch(1 0 0 / 11%)",
  "glass-state-edge": "oklch(1 0 0 / 6%)",
  "glass-state-armed": "oklch(1 0 0 / 11%)",
  hover: "oklch(1 0 0 / 8%)",
  "primary-solid": "86%",
  "primary-rim": "oklch(1 0 0)",
  "primary-under": "oklch(0 0 0 / 22%)",
  "primary-inner": "oklch(0 0 0 / 7%)",
  "primary-edge": "oklch(1 0 0 / 26%)",
  field: "oklch(1 0 0 / 6%)",
  "field-rim": "oklch(1 0 0 / 15%)",
  "field-edge": "oklch(1 0 0 / 8%)",
  "well-shade": "oklch(0 0 0 / 38%)",
  "well-rim": "oklch(1 0 0 / 9%)",
  "focus-line": "oklch(1 0 0 / 40%)",
  knob: "oklch(0.97 0 0)",
  "knob-shade": "oklch(0 0 0 / 55%)",
  brand: "oklch(0.78 0.13 166)",
  "brand-foreground": "oklch(0.2 0.03 166)",
  "brand-muted": "oklch(0.78 0.13 166 / 15%)",
  "status-done": "oklch(0.68 0.15 250)",
  success: "oklch(0.74 0.16 152)",
  "status-interrupted": "oklch(0.77 0.15 62)",
  "syn-name": "oklch(0.78 0.11 305)",
  "chart-1": "oklch(0.94 0 0)",
  "chart-2": "oklch(0.83 0 0)",
  "chart-3": "oklch(0.69 0 0)",
  "chart-4": "oklch(0.56 0 0)",
  "chart-5": "oklch(0.44 0 0)",
  sidebar: "oklch(0.11 0 0 / 50%)",
  "sidebar-foreground": "oklch(0.9 0 0)",
  "sidebar-accent": "oklch(1 0 0 / 8%)",
  "sidebar-border": "oklch(1 0 0 / 10%)",
};

const TABLES = { light: LIGHT, dark: DARK };
type Appearance = keyof typeof TABLES;

/** One appearance's variables, throwing on a name the stylesheet does not set in it. */
function source(appearance: Appearance) {
  const table = TABLES[appearance];
  return (name: string): string => {
    const value = table[name];
    if (value === undefined) throw new Error(`--${name} is not set in ${appearance}`);
    return value;
  };
}

/** An `oklch()` colour as its numbers (L, C, H and alpha 0–1), so the two mixed values can be read. */
function coords(value: string): { l: number; c: number; h: number; a: number } {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/.exec(
    value,
  );
  if (!match) throw new Error(`not an oklch(): ${value}`);
  const [l, c, h] = match.slice(1, 4).map(Number) as [number, number, number];
  const alpha = match[4] === undefined ? 1 : Number(match[4]) / (match[5] === "%" ? 100 : 1);
  return { l, c, h, a: alpha };
}

/** `color` at `a` of its own alpha, as `color-mix(in oklch, color 45%, transparent)` composites it. */
function thinned(color: string, share: number): string {
  const { l, c, h, a } = coords(color);
  return `oklch(${l} ${c} ${h} / ${Number((a * share).toFixed(4))})`;
}

/**
 * The two colours the stylesheet mixes and this library's roles need as one value:
 *
 * - the primary button's hairline, `color-mix(in oklab, var(--primary) 55%, var(--primary-edge))`:
 *   both ends are grey (hue 0), so the mix is the ink's own lightness at the two alphas blended;
 * - the ink's shade along a small solid pane's foot,
 *   `color-mix(in oklch, var(--primary-under) 45%, transparent)`, which is that alpha at 45%.
 */
function mixed(appearance: Appearance) {
  const s = source(appearance);
  const ink = coords(s("primary"));
  const edge = coords(s("primary-edge"));
  const at = (share: number, a: number, b: number) =>
    Number((share * a + (1 - share) * b).toFixed(5));
  return {
    hairline: `oklch(${at(0.55, ink.l, edge.l)} 0 ${at(0.55, ink.h, edge.h)} / ${at(0.55, ink.a, edge.a)})`,
    under: thinned(s("primary-under"), 0.45),
  };
}

/** A tone's translucent tint, as the theme's `*-tint` tokens write it. */
const tint = (tone: string) => `color-mix(in srgb, var(--${tone}) 10%, transparent)`;

/**
 * The four panes as they read on the page: each laid over the surface it stands on, so the value
 * that reaches a component is the colour the eye sees rather than a share of it. `section` and
 * `finishes` both read them (a menu's fill is the `popover` pane, not the token).
 */
function laid(appearance: Appearance) {
  const s = source(appearance);
  const background = s("background");
  const card = over(s("card"), background);
  return {
    card,
    popover: over(s("popover"), background),
    sidebar: over(s("sidebar"), background),
    inset: over(s("panel"), card),
  };
}

/**
 * The tokens this library's components read, for one appearance.
 *
 * The stylesheet's names are this library's wherever the two mean the same thing (`background`,
 * `card`, `popover`, `primary`, `muted`, `accent`, `border`, `chart-*`, `sidebar*`); the rest are
 * mapped one by one.
 *
 * The four panes (`card`, `popover`, `sidebar`, `inset`) are laid over the surface they stand on
 * rather than left translucent. A pane is see-through in the stylesheet only *through* its blur —
 * `backdrop-filter`, which no NSH theme role but `glass` carries — and without it a 44%-alpha pane
 * shows what is behind it with sharp edges: the page's text read through a sidebar's rows, a menu
 * with the page's words in it. What the source's reader sees is the pane over the page, and that is
 * the colour written here. The tints that are *meant* to let a surface through (`muted`, `accent`,
 * `hover`, `border`, `field`, `raised`, the `*-tint`s) stay translucent.
 */
/** The choices the derived keys make (ADR 0007 §4). */
const scheme: ColourScheme = {
  tint: 12,
  ring: "primary",
  field: "card",
  knob: ["card", "foreground"],
  secondaryIsRaised: true,
  raised: "secondary",
  inverse: ["card", "foreground"],
  chart: "ramp",
};

function section(appearance: Appearance): Record<string, string> {
  const s = source(appearance);
  const panes = laid(appearance);
  const m = mixed(appearance);
  return {
    background: s("background"),
    foreground: s("foreground"),
    card: panes.card,
    "card-foreground": "var(--foreground)",
    popover: panes.popover,
    "popover-foreground": "var(--foreground)",
    primary: s("primary"),
    "primary-foreground": s("primary-foreground"),
    // A control's fill here is clear glass: the stylesheet paints `.bg-secondary` and
    // `.bg-background` buttons in `--glass-control`, and keeps its own `--secondary` (an ink tint)
    // for the fill a control takes under the pointer, which is this library's `hover`.
    secondary: "var(--raised)",
    "secondary-foreground": "var(--foreground)",
    muted: s("muted"),
    "muted-foreground": s("muted-foreground"),
    accent: s("accent"),
    "accent-foreground": "var(--foreground)",
    destructive: s("destructive"),
    border: s("border"),
    // A field's line. The stylesheet gives every field `--field-edge` (and stops shadcn's
    // `border-input` from showing), so that is the edge an input, a select and a combobox draw.
    input: s("field-edge"),
    // Where the keyboard is: a crisp line in `--focus-line`, not shadcn's three-pixel grey ring.
    ring: s("focus-line"),
    "chart-1": s("chart-1"),
    "chart-2": s("chart-2"),
    "chart-3": s("chart-3"),
    "chart-4": s("chart-4"),
    "chart-5": s("chart-5"),
    sidebar: panes.sidebar,
    "sidebar-foreground": s("sidebar-foreground"),
    "sidebar-primary": "var(--primary)",
    "sidebar-primary-foreground": "var(--primary-foreground)",
    "sidebar-accent": "var(--accent)",
    "sidebar-accent-foreground": "var(--accent-foreground)",
    "sidebar-border": s("sidebar-border"),
    "sidebar-ring": "var(--ring)",
    // A surface inside a card is the thinnest pane; a control on it is clear glass.
    inset: panes.inset,
    raised: s("glass-control"),
    // The edge a filled pane draws: the stylesheet's primary-button hairline,
    // `color-mix(in oklab, var(--primary) 55%, var(--primary-edge))`, mixed here because the two
    // ends are greys and the mix is one value (`mixed`).
    "brand-edge": m.hairline,
    // A field's well: a pane of clear glass to type on, its rim drawn by the finish.
    field: s("field"),
    // Hairlines inside insets: the stylesheet has one hairline, `--border`.
    line: "var(--border)",
    hover: s("hover"),
    // The quietest text: `--ring` is a step off the muted grey in each appearance (lighter on the
    // pale page, darker on the dark one).
    faint: s("ring"),
    // Links and small marks keep the teal (`--brand`); the main action's fill is the ink's pane
    // (`--primary`).
    brand: s("brand"),
    // A switch's rail before it is on: shadcn's `bg-input`, cut into the surface as a groove.
    track: s("input"),
    knob: s("knob"),
    // The tones beside the accent: the stylesheet's own status colours ("hue means finished or
    // stopped"), and for `violet` the colour it sets a name in.
    info: s("status-done"),
    warn: s("status-interrupted"),
    up: s("success"),
    "brand-tint": s("brand-muted"),
    inverse: "var(--popover)",
    "inverse-foreground": "var(--foreground)",
    "inverse-brand": "var(--primary-foreground)",
    "info-tint": tint("info"),
    "warn-tint": tint("warn"),
    "destructive-tint": tint("destructive"),
    "up-tint": tint("up"),
    "down-tint": tint("destructive"),
  };
}

/** The theme's own tokens, shared by the appearances (a colour may name one: `var(--primary)`). */
function themeLevel(): Record<string, string> {
  return {
    // Solid Glass stepped corner radii: 11 px controls, 14 px containers, 20 px modals.
    ...scaledRadii({ control: 11, container: 14, modal: 20 }),
    // The stylesheet has no scrim of its own; shadcn's modal overlay is `bg-black/50`.
    scrim: "oklch(0 0 0 / 0.5)",
    // The ground a photograph sits on, and white ink on it. Neither flips.
    media: "oklch(0.1869 0.0151 266.766)",
    "on-media": "oklch(1 0 0)",
  };
}

export function themeFiles(): ThemeGeneratorOutput {
  const paneAndTokenDescriptions = {
    card: "Opaque composite of Solid Glass card pane over background canvas (no blur on card role).",
    popover: "Opaque composite of Solid Glass popover pane over background canvas.",
    sidebar: "Opaque composite of Solid Glass panel pane over background canvas.",
    inset: "Opaque composite of Solid Glass thinnest panel pane laid over card.",
    "brand-edge": "Primary button hairline mixed from --primary and --primary-edge.",
    "brand-tint": "Static translucent teal brand wash (--brand-muted).",
  };

  return {
    id: "solid-glass",
    name: "Solid Glass",
    resolverDescription: "Solid Glass theme.",
    themeDescription:
      "Appearance-invariant base tokens and press-scale override for the Solid Glass theme.",
    finishesDescription: "Appearance-invariant surface finish recipes for the Solid Glass theme.",
    lightDescription: "Light appearance colors and finish overrides for the Solid Glass theme.",
    darkDescription: "Dark appearance colors and finish overrides for the Solid Glass theme.",
    // The material draws no press of its own: a pressed pane loses the shadow it stood on and
    // darkens a step, it does not shrink (`state["press-scale"]` of 1, which `press.scale` reads as none).
    "press-scale": 1,
    radiusGroupDescription:
      "Solid Glass layered corner radius scale (11px control, 14px container, 20px modal) referenced by semantic shape roles.",
    designMd: {
      overview:
        "Solid Glass (`deeplethe/solid-glass`, MIT): panes of smoky translucent glass with top-edge light rims, hairline glass borders, and ambient drop shadows (`state.press-scale: 1`).",
      elevation:
        "Layered glass elevation: surfaces combine translucent fills (`alpha < 1` over page grounds), top-edge inset highlights, `--glass-edge` borders, soft shadows, and backdrop blur (`glass`, `menu`, `modal`, `tooltip`, `inverse`).",
      dos: [
        "Keep press interactions flat (`state.press-scale: 1`); pressed panes deepen and drop shadow rather than shrinking.",
        "Keep gradient stops `transparent` on translucent `background` finishes so alpha is not doubled by the canvas.",
      ],
      donts: [
        "Do not stack opaque fills behind translucent glass gradients; keep the `background` layer `transparent` when the gradient carries the fill.",
      ],
    },
    cssVars: {
      theme: themeLevel(),
      light: reduceColours(section("light"), scheme, "light"),
      dark: reduceColours(section("dark"), scheme, "dark"),
    },
    finishes,
    shadows,
    descriptions: {
      style: {
        "state.press-scale":
          "Scale factor applied while pressed (1 disables press shrinking for Solid Glass panes).",
      },
      sharedColors: {
        scrim: "Translucent backdrop scrim behind modals and sheets (50% black).",
      },
      lightColors: paneAndTokenDescriptions,
      darkColors: paneAndTokenDescriptions,
    },
  };
}
