---
title: Theme
description: theme.json and finishes.json are the look; lib/theme.ts reads them for every component.
---

The theme is the upstream gallery's: a graphite page (paper in light appearance), cards and insets, one citrus accent, compact controls with a pointer and roomier ones on a touch screen. It is two JSON files plus the module that reads them, and every component takes its colors, radii and depth from there — no component writes a color of its own.

## Files

| File            | What it holds                                                                           |
| --------------- | --------------------------------------------------------------------------------------- |
| `theme.json`    | Colors, radii and the monospaced family in shadcn's `cssVars` shape, for light and dark |
| `finishes.json` | Gradients, shadows and edges by role, for light and dark                                |
| `lib/theme.ts`  | `colors`, `finish`, `radius`, `mono`, `focusRing` and `alpha`, read from both files     |

## Installation

```npm
npx shadcn-nsh@latest add theme
```

`add theme` writes `theme.json`, `lib/finishes.json` and `lib/theme.ts`, the data of the theme `nsh-ui.json` records (`theme-shadcn` writes shadcn's). `init` writes the same files and also points each `nsh.json` at `theme.json`. In a monorepo they live under `packages/ui`. Every component depends on it.

## Colors

`theme.json` is a shadcn theme: `cssVars.theme` holds the radii and the accent's raw values, `cssVars.light` and `cssVars.dark` hold the same semantic keys for the two appearances. The core keys are shadcn's (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar*`). Upstream adds the roles the gallery needs:

| Role                                                                               | Use                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `inset` / `raised`                                                                 | A surface inside a card, and a control on the card         |
| `field` / `input`                                                                  | An input's well and its edge                               |
| `line` / `border`                                                                  | Hairlines inside insets, and the edge of a card or control |
| `hover` / `faint`                                                                  | The pointer's wash, and the quietest text                  |
| `ring-halo`                                                                        | The keyboard focus's halo around the `ring` edge           |
| `brand` / `brand-fill`                                                             | The accent as ink, and as a fill with `on-brand` on it     |
| `track` / `knob`                                                                   | A switch's track when off, and its knob                    |
| `scrollbar-thumb*`                                                                 | The scroll bars, opaque over the view                      |
| `code`                                                                             | Code inside insets                                         |
| `info` / `warn` / `up` / `down` / `violet`                                         | The tones beside the accent                                |
| `brand-tint`, `info-tint`, `warn-tint`, `destructive-tint`, `up-tint`, `down-tint` | The same tones as fills behind text                        |
| `window-close`, `window-minimize`, `window-zoom`, `window-control-*`               | The macOS traffic lights                                   |

`colors` maps the roles a component names onto those keys:

```tsx
import { colors } from "@shadcn-nsh/theme";

colors.background; // the page
colors.card; // a card
colors.inset; // a surface inside a card
colors.raised; // a control on a card
colors.field; // an input's well
colors.foreground; // body text
colors.mutedForeground; // secondary text
colors.brand; // the accent as ink
colors.brandFill; // the accent as a fill
colors.destructive; // a failure
colors.up; // additions
```

Read a role where it is drawn (in JSX, a `draw`, or an effect): the getters read the token then, so they follow the appearance.

## Finishes

A finish is light and depth: a gradient over the color, its shadows, its edge. `finishes.json` keeps one entry per role for each appearance, and `finish.<role>` returns the one the appearance shows.

| Role                           | Use                                                       |
| ------------------------------ | --------------------------------------------------------- |
| `card` / `inset` / `field`     | The three surfaces, each with its own shadow              |
| `raised` / `hover` / `pressed` | A control at rest, under the pointer, pressed             |
| `light` / `accent`             | A control on the citrus fill                              |
| `track` / `fill`               | A rail, and the accent that runs in it                    |
| `knob` / `knobOn` / `handle`   | A switch's knob off, and on; a slider's thumb             |
| `pill` / `thumb` / `on`        | A segmented control's track, its thumb, what stays chosen |
| `chip`                         | A small raised label                                      |
| `glass`                        | A control over a photo                                    |
| `menu`                         | A floating surface's soft shadow                          |
| `groove`                       | The lip of light under a separator                        |

Spread one where a control needs that depth:

```tsx
<View style={{ backgroundColor: colors.raised, ...finish.raised, borderRadius: radius.control }} />
```

## Radii

`theme.json`'s `theme` block holds one base length, `radius` (10), and the two tiers derived from
it: `radius-control` (8, 0.8× the base) and `radius-card` (14, 1.4× the base), each rounded to whole
points. `radius` reads them for JSX:

```tsx
import { radius } from "@shadcn-nsh/theme";

radius.inset; // 10, the base
radius.control; // 8
radius.card; // 14
```

A dialog takes the card tier. `rounded()` puts a corner on one of these with the continuous curve
every theme corner shares:

```tsx
import { radius, rounded } from "@shadcn-nsh/theme";

const card = { ...rounded(radius.card) };
```

## Reading the theme

```tsx
import { alpha, colors, finish, focusRing, radius, rounded } from "@shadcn-nsh/theme";

const card = {
  backgroundColor: colors.card,
  borderColor: colors.border,
  ...rounded(radius.card),
  boxShadow: finish.card.boxShadow,
};

const ring = focusRing(); // the keyboard focus outline
const dim = alpha(colors.foreground, 0.4); // a color at 40%
```

`focusRing(offset)` is the shared keyboard outline: the muted `ring` edge and a 3-point halo of `ring-halo`. `hovered()` is the pointer's fill, the `hover` token. `alpha(color, a)` is a `color-mix` of that color with transparency. `colors`, `finish` and `radius` are getters, not snapshots: read them where they are used.

## Override from nsh.json

An app's `nsh.json` sets the look in two places, and the two do not merge:

| Key in `nsh.json` | What it sets                                                                                      | When it is read                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `"theme"`         | the path to `theme.json`: every token this library reads — colours, `radius` and its tiers, fonts | on each read, at runtime — so `setTheme` and every theme an app carries reach it |
| `"tailwind"`      | the app's own class strings: `colors`, `fontFamily`, `spacing`, `radius`, …                       | when the app is built, into the class strings — no component here reads it       |

Components take their look from `"theme"`: `colors`, `finish` and `radius` read the tokens where they are used. `"tailwind"` shapes class names — which this library writes too (`bg-muted`, `text-sm`, `h-8`) — but it is fixed at build time, so nothing in it can follow `setTheme`. NSH's [theme tokens](https://nsh.dev/docs/tailwind#theme-tokens) has the rule in full.

**A colour named in `"tailwind"` wins over the token of the same name.** With `"colors": { "primary": "#3366ff" }`, every `bg-primary` in the app draws blue — pagination's selected page, a data table's move indicator — while `colors.primary` in JSX stays the theme's citrus. One name, two colours, and the panels drawn by class are the ones that differ. Set the role in `"theme"` instead.

The theme file stays complete: copy it, then edit. A shadcn slot it leaves out falls back to shadcn's neutral (see [Colors](#colors)), and `finishes.json` names tokens by key, so both appearances need the same set.

Add a colour the app's own classes use (both appearances — a token in one alone is not a token):

```json
{
  "cssVars": {
    "light": { "brand-alt": "oklch(0.65 0.14 300)" },
    "dark": { "brand-alt": "oklch(0.72 0.12 300)" }
  }
}
```

Change a role: `primary` in `cssVars.light` and `cssVars.dark`. Change the radius: `radius` in `cssVars.theme`, and with it `radius-control` (0.8× it, rounded) and `radius-card` (1.4×) — the three are one scale, and the class radii an app writes follow the tokens. Set the fonts in the same block: see [Fonts](#fonts).

## Fonts

Two tokens are fonts. `font-sans` is the app's font — every text that names no family of its own — and `font-mono` is the monospaced family: the `font-mono` class, code in a `Text`, and this library's `mono()`. Both live in `cssVars.theme`. This library sets `font-mono` and leaves `font-sans` out, so both are the system's:

```json
{
  "cssVars": {
    "theme": { "font-sans": "Inter, sans-serif", "font-mono": "JetBrains Mono, monospace" }
  }
}
```

NSH takes the first family of the list that is not a generic one (`system-ui`, `sans-serif`, `monospace` …), and a list of generics alone is the system's own font. That is why this library states `"font-mono": "monospace"`: the system's monospaced font, not a font called "monospace".

A font file is the app's. Import it in TSX — the import registers it before the first frame, and its value is the family name the file declares, not the file name — and name that family in the theme:

```tsx
// app.tsx: the import bundles and registers the family; `theme.json` names it.
import "./fonts/JetBrainsMono-Regular.ttf";
```

The side-effect import is deliberate: TypeScript drops an import whose value is unused, and the font with it, when the theme names the family as a string. A weight or an italic is a file of its own, `registerFont(bytes)` reads one the app did not ship, and the fallback after the app's family is what NSH draws for a family it cannot find — see NSH's [fonts](https://nsh.dev/docs/fonts#shipping-a-font).

This library distributes no font files: `add theme` writes JSON and TypeScript, and the families it names are the ones every platform has.

## Restyling

Edit the two JSON files; every component follows. Change a brand color in `cssVars.light` and `cssVars.dark`, a radius in `cssVars.theme`, a shadow or gradient in `finishes.json`. Keep the keys: components and finishes refer to them by name, and both appearances need the same set.

- Add the theme to an app with `shadcn-nsh add theme` (or let `init` do it).
- Replacing both files together rebrands the whole library; a key added upstream should be added here too.
- The demos on this site can draw in an installed theme: the **Demo theme** switch in the nav (Default, shadcn or Solid Glass) writes the demo app's palette and loads the panels again. The list is `apps/website/demos/palettes.ts`; a demo reads the palette before it mounts, so its first frame is already the chosen theme. Every palette — its install command and every role it sets — has a page linked from [Themes](./themes).
- To change one component's look instead, edit its look function in the copied component; to change structure or API, edit the shell. See [Customizing](./customizing).
- Maintaining this repository: edit the look in `packages/ui` (a `// @port` region is ours); `port:check` lists upstream's changes and `bun run port:review` marks them read. After editing `packages/theme`, run `bun run registry:build` and commit `public/r`.

Theme rules and decisions: [`packages/theme/README.md`](https://github.com/aningdev/shadcn-nsh/blob/main/packages/theme/README.md). Behavior and accessibility are `nsh/base`'s: [nsh.dev/elements](https://nsh.dev/elements).
