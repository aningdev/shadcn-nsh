---
layout: ../../layouts/Docs.astro
title: Theme
description: theme.json and finishes.json are the look; lib/theme.ts reads them for every component.
---

The theme is the upstream gallery's: a graphite page (paper in light appearance), cards and insets, one citrus accent, compact controls with a pointer and roomier ones on a touch screen. It is two JSON files plus the module that reads them, and every component takes its colors, radii and depth from there — no component writes a color of its own.

## Files

| File            | What it holds                                                               |
| --------------- | --------------------------------------------------------------------------- |
| `theme.json`    | Colors and radii in shadcn's `cssVars` shape, for light and dark            |
| `finishes.json` | Gradients, shadows and edges by role, for light and dark                    |
| `lib/theme.ts`  | `colors`, `finish`, `radius`, `focusRing` and `alpha`, read from both files |

## Installation

```sh
npx shadcn-nsh@latest add theme
```

`add theme` writes `theme.json`, `lib/finishes.json` and `lib/theme.ts`. `init` writes the same files and also points each `nsh.json` at `theme.json`. In a monorepo they live under `packages/ui`. Every component depends on it.

## Colors

`theme.json` is a shadcn theme: `cssVars.theme` holds the radii and the accent's raw values, `cssVars.light` and `cssVars.dark` hold the same semantic keys for the two appearances. The core keys are shadcn's (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar*`). Upstream adds the roles the gallery needs:

| Role                                                                               | Use                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `inset` / `raised`                                                                 | A surface inside a card, and a control on the card         |
| `field` / `input`                                                                  | An input's well and its edge                               |
| `line` / `border`                                                                  | Hairlines inside insets, and the edge of a card or control |
| `hover` / `faint`                                                                  | The pointer's wash, and the quietest text                  |
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
colors.surface; // a card (card)
colors.inset; // a surface inside a card
colors.raised; // a control on a card
colors.field; // an input's well
colors.text; // foreground
colors.muted; // muted-foreground
colors.accent; // brand, as ink
colors.accentFill; // brand-fill, as a fill
colors.danger; // destructive
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
| `knob` / `knobOn`              | A switch's knob off, and on                               |
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

`theme.json`'s `theme` block holds `radius-card` (12), `radius` (10) and `radius-control` (7). `radius` reads them for JSX:

```tsx
import { radius } from "@shadcn-nsh/theme";

radius.card; // 12
radius.inset; // 10
radius.control; // 7
```

## Reading the theme

```tsx
import { alpha, colors, finish, focusRing, radius } from "@shadcn-nsh/theme";

const card = {
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: radius.card,
  boxShadow: finish.card.boxShadow,
};

const ring = focusRing(); // the keyboard focus outline
const dim = alpha(colors.text, 0.4); // a color at 40%
```

`focusRing(offset)` is the shared keyboard outline: the muted `ring` edge and a 3-point halo. `alpha(color, a)` is a `color-mix` of that color with transparency. `colors`, `finish` and `radius` are getters, not snapshots: read them where they are used.

## Restyling

Edit the two JSON files; every component follows. Change a brand color in `cssVars.light` and `cssVars.dark`, a radius in `cssVars.theme`, a shadow or gradient in `finishes.json`. Keep the keys: components and finishes refer to them by name, and both appearances need the same set.

- Add the theme to an app with `shadcn-nsh add theme` (or let `init` do it).
- Replacing both files together rebrands the whole library; a key added upstream should be added here too.
- To change one component's look instead, edit its look function in the copied component; to change structure or API, edit the shell. See [Customizing](./customizing).
- Maintaining this repository: edit the look in `packages/ui` (a `// @port` region is ours); `port:check` lists upstream's changes and `bun run port:review` marks them read. After editing `packages/theme`, run `bun run registry:build` and commit `public/r`.

Theme rules and decisions: [`packages/theme/README.md`](https://github.com/aningdev/shadcn-nsh/blob/main/packages/theme/README.md). Behavior and accessibility are `nsh/base`'s: [nsh.dev/elements](https://nsh.dev/elements).
