---
title: Theme
description: theme.json and semantics.json are the look; lib/ui/theme.ts reads them for every component.
---

The theme is the upstream gallery's: a graphite page (paper in light appearance), cards and insets, one citrus accent, compact controls with a pointer and roomier ones on a touch screen. It is two JSON files — base tokens in `theme.json` and cross-platform semantics in `semantics.json`, following the [design-semantics standard](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/design-semantics.md) — plus the module that reads them, and every component takes its colors, radii, typography, motion and depth from there. No component writes a color of its own.

## Files

| File                                    | What it holds                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme.json`                            | Base tokens: colors (light / dark and shared), the three `radius-*` layer lengths (plus `radius`), and font families (`font-mono`, optional `font-sans`) in shadcn's `cssVars` shape                                                                                                                                                                                      |
| `light.tokens.json`, `dark.tokens.json` | Standalone W3C DTCG 2025.10 Format files resolved per appearance at the `pointer` tier (in-file aliases, 6-digit `hex` fallbacks) for Figma Variables (Light/Dark modes), Tokens Studio, and Style Dictionary v4; static snapshots as shipped                                                                                                                             |
| `DESIGN.md`                             | Generated Google Labs DESIGN.md (`alpha`) specification for coding agents, compiled from DTCG sources and the pointer-tier `light`/`dark` resolutions; static snapshot as shipped                                                                                                                                                                                         |
| `semantics.json`                        | Semantic layer in DTCG names: 7 style groups (`typography`, `dimension` — with the four control dimensions under `dimension.control` — `shape`, `state`, `transition`, `motion` (three springs plus the `state` fade), `controls`), `elevation` (the shadow scale, per appearance) and `finishes` (`shared` + sparse `light` / `dark`), referencing tokens with `{token}` |
| `lib/ui/theme.ts`                       | `colors`, `finish`, `shape`, `font`, `style`, `mono`, `control`, `focusRing` and `alpha`, read reactively from `theme.json` and `semantics.json`                                                                                                                                                                                                                          |

## Installation

```npm
npx shadcn-nsh@latest add theme
```

`add theme` writes `theme.json`, `light.tokens.json`, `dark.tokens.json`, `DESIGN.md`, `lib/ui/semantics.json` and `lib/ui/theme.ts`, the data of the theme `nsh-ui.json` records (`theme-shadcn` writes shadcn's into `themes/shadcn/`). `init` writes the same files and also points each `nsh.json` at `theme.json`. In a monorepo they live under `packages/ui`. Every component depends on it.

`light.tokens.json`, `dark.tokens.json` and `DESIGN.md` are generated outputs: import `.tokens.json` into Figma Variables as Light and Dark modes, Tokens Studio, or Style Dictionary v4, and let coding agents read `DESIGN.md` for the theme's tokens and design rationale. Because they describe the theme as shipped, editing `theme.json` or `semantics.json` later does not update them.

## Colors

`theme.json` is a shadcn theme: `cssVars.theme` holds the radii and the accent's raw values, `cssVars.light` and `cssVars.dark` hold the same semantic keys for the two appearances. The core keys are shadcn's (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar*`). Upstream adds the roles the gallery needs:

| Role                                                                               | Use                                                                                                         |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `inset` / `raised`                                                                 | A surface inside a card, and a control on the card                                                          |
| `field` / `input`                                                                  | An input's well and its edge                                                                                |
| `line` / `border`                                                                  | Hairlines inside insets, and the edge of a card or control                                                  |
| `hover` / `faint`                                                                  | The pointer's wash, and the quietest text                                                                   |
| `ring-halo`                                                                        | The keyboard focus's halo around the `ring` edge                                                            |
| `brand`                                                                            | The accent as ink                                                                                           |
| `track` / `knob`                                                                   | A switch's track when off, and a switch's knob; sliders and progress bars read their preset's track role    |
| `info` / `warn` / `up` / `violet`                                                  | The tones beside the accent; a data loss reads `destructive`                                                |
| `brand-tint`, `info-tint`, `warn-tint`, `destructive-tint`, `up-tint`, `down-tint` | The same tones as fills behind text                                                                         |
| `inverse` / `inverse-foreground` / `inverse-brand`                                 | A toast's and a tooltip's reversed surface, its text and action; quieter ink is `finish.inverse.foreground` |

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
colors.primary; // the accent as a fill
colors.primaryForeground; // what reads on that fill
colors.destructive; // a failure
colors.up; // additions
```

Read a role where it is drawn (in JSX, a `draw`, or an effect): the getters read the token then, so they follow the appearance.

## Finishes

A finish is light and depth: what a surface is filled with, and how it sits above what is behind it. There are fourteen — eleven layers a component can be drawn on, and three states — and a finish states the same fields in every theme: `background`, `foreground`, `shadow`, `material`, `gradient`, `backdropFilter`, the three border colours, the pressed pair and `elevation`. A field a theme leaves out is not missing — it takes a neutral value, written once in the base token set (`tokens/base/style.shared.tokens.json`) and compiled into every theme's `semantics.json`: `material: null` (no platform material), `backdropFilter: "none"`, `elevation: null`, `gradient: null` (flat), no colour of its own on the top or bottom edge, and the pressed pair `null` (pressing only dims). In the DTCG sources those neutrals are written `"none"` in the finish group's `$extensions`, since a token's `$value` cannot be `null`; a token a theme writes wins over it. `semantics.json` keeps `finishes.shared` (fields identical in both appearances, referencing `{token}` so NSH's `token()` handles light/dark switching) plus sparse `finishes.light` and `finishes.dark` overrides, and `finish.<role>` merges them and resolves every `{token}` (including `oklch(from {card} l c h / 0.78)`) for the active appearance.

| Role       | Use                                                                |
| ---------- | ------------------------------------------------------------------ |
| `card`     | A surface that holds content: a card, a section                    |
| `inset`    | A surface sunk into its host: a field, a track, a well             |
| `raised`   | A surface above the page: a button at rest, a chip, a pill         |
| `overlay`  | A surface the page floats over: a menu, a popover, a select's list |
| `modal`    | A surface the page waits for: a dialog, a sheet                    |
| `inverse`  | The reversed surface: a toast, a tooltip                           |
| `glass`    | A control over a photo                                             |
| `accent`   | The brand's own surface: a filled button, a switch that is on      |
| `knob`     | The thumb a control moves: a switch's knob, a slider's handle      |
| `hover`    | The pointer's treatment of the surface under it                    |
| `pressed`  | The press's treatment of the surface under it                      |
| `disabled` | A control that cannot act                                          |

Every finish states a `foreground` — the ink that sits on it — so a component needs no fallback, and `shadow` names the parts of the theme's scale (`["{shadow.edge.surface}", "{shadow.sm}"]`) instead of writing one: `elevation("md")` gives the same values on its own. A theme that paints flat leaves `gradient` out and gets `null`, so the component draws no background image.

The `material` says what the platform's own glass should be: `null` (every theme but the glassed ones, which state `"none"` and compile to `null`), or `apple` — `{ glass: "regular" | "clear", tint }` — which rides inside `finish.<role>` as `glassEffect` and `glassTintColor`, so a spread of the finish carries it. `ios`, `macos` and `windows` are props, not style keys, which `platformMaterial(role)` returns for the view that draws the finish:

```tsx
<View {...platformMaterial("overlay")} style={{ ...finish.overlay }} />
```

Both follow `selectTheme` and the appearance, and with `material: null` the view is drawn as before. The library's own popovers, hover cards, toasts, the editor's find bar and a glass carousel arrow spread it; the popups of `Menu`, `Select` and `Popover` on `nsh/base` take only `popupStyle`, so there the glass keys apply and the platform props do not.

The `apple` theme fills in `material.apple`: `glass`, `overlay` and `raised` carry `{ glass: "regular" }` (Liquid Glass on iOS and macOS 26+), and every other finish is a flat fill with a hairline edge. The `material` theme uses Material 3 Expressive tonal surfaces, circular corners, 8/10/10% state layers, press ripple (`state.ripple: true`), and `material.android.elevation` on elevated surfaces. The `winui` theme uses WinUI 3 (Windows 11) fill and stroke tokens, 4/8-point circular corners, Segoe UI Variable, Consolas, double focus rings, timing motion, underline tab and box-underline field indicators, and `material.windows` blur on `glass`, `overlay` and `inverse`. `nativeTheme()` from `theme-native` picks the theme of the platform the app runs on — Apple's on iOS and macOS, Material on Android, WinUI 3 on Windows, and the default theme everywhere else:

```npm
npx shadcn-nsh@latest init --theme native
```

```tsx
import { nativeTheme } from "./themes/native";

// Before mount: the first frame is already the platform's theme.
selectTheme(nativeTheme());
```

`init --theme apple` builds the app on Apple's palette; `--theme native` builds it on the default theme and installs both, for `nativeTheme()` to choose between at run time. On macOS 26+ an explicit `macos.backdrop` wins over `glassEffect`, so `apple` states none; it states `ios.backdrop` as the blur for iOS before 26.

Windows' Mica is not a finish: it is the window's own `backdrop` in `nsh-desktop` (Windows 11 maps it to Mica or Acrylic, macOS to a visual effect material), set once by the app in `nsh.json` and shown through surfaces whose fill is translucent:

```json
{ "window": { "backdrop": "window" } }
```

Spread one where a control needs that depth:

```tsx
<View style={{ backgroundColor: colors.raised, ...finish.raised, borderRadius: shape.control }} />
```

## Radii

`theme.json`'s `cssVars.theme` block defines three corner radii, one per layer: `radius-control` (in-page elements: fields, rows, chips, badges, wells, colour areas, keycaps), `radius-container` (cards, menus, popovers, rich tooltips, list panels, toasts) and `radius-modal` (dialogs, sheets, drawers). shadcn's own `radius` slot equals `radius-control`. In `semantics.json`, `dimension.shape.*` references them with `"{radius-…}"`, and `shape.corners.button` (`"full" | "radius"`) says whether buttons are capsules. `shape` resolves each role reactively via `token()`:

```tsx
import { shape } from "@shadcn-nsh/theme";

shape.control; // 8, from radius-control
shape.container; // 12, from radius-container
shape.modal; // 14, from radius-modal
shape.button; // 999 when shape.corners.button is "full", else shape.control
```

| Theme               | `control` | `container` | `modal` | Buttons   |
| ------------------- | --------- | ----------- | ------- | --------- |
| `default`, `shadcn` | 8         | 12          | 14      | `control` |
| `solid-glass`       | 11        | 14          | 20      | `control` |
| `apple`             | 8         | 12          | 26      | capsule   |
| `material`          | 4         | 12          | 28      | capsule   |
| `winui`             | 4         | 8           | 8       | `control` |

A surface inside another takes a concentric corner from its outer one: `rounded(outer, inset)` gives `outer − inset`, never below 0. `rounded()` also puts the corner on with `shape.curve` (`"continuous"` or `"circular"`):

```tsx
import { rounded, shape } from "@shadcn-nsh/theme";

const card = { ...rounded(shape.container) };
const thumb = { ...rounded(shape.control, 2) }; // inside a 2-point track
```

## Reading the theme

```tsx
import { alpha, colors, finish, focusRing, rounded, shape } from "@shadcn-nsh/theme";

const card = {
  backgroundColor: colors.card,
  borderColor: colors.border,
  ...rounded(shape.container),
  boxShadow: finish.card.boxShadow,
};

const ring = focusRing(); // the keyboard focus outline
const dim = alpha(colors.foreground, 0.4); // a color at 40%
```

`focusRing(offset)` is the shared keyboard outline: the muted `ring` edge and a 3-point halo of `ring-halo`. `hovered()` is the pointer's fill, the `hover` token (plus `stateLayer("hover")` when `state.overlay.hover > 0`). `alpha(color, a)` is a `color-mix` of that color with transparency. `colors`, `finish`, `shape` and `style()` are reactive: read them where they are used.

## Override from nsh.json

An app's `nsh.json` sets the look in two places, and the two do not merge:

| Key in `nsh.json` | What it sets                                                                                         | When it is read                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `"theme"`         | the path to `theme.json`: every base token — colours, the `radius-*` tokens, `font-sans`/`font-mono` | on each read, at runtime — so `setTheme`, `setThemeOverrides`, `shape` and `font.family()` reach it |
| `"tailwind"`      | the app's own class strings: `colors`, `fontFamily`, `spacing`, `radius`, …                          | when the app is built, into the class strings — no component here reads it                          |

Components take their look from `"theme"`: `colors`, `finish`, `shape` and `font` read the tokens where they are used. `"tailwind"` shapes class names — which this library writes too (`bg-muted`, `text-sm`, `h-8`) — but it is fixed at build time, so nothing in it can follow `setTheme`. NSH's [theme tokens](https://nsh.dev/docs/tailwind#theme-tokens) has the rule in full.

**A colour named in `"tailwind"` wins over the token of the same name.** With `"colors": { "primary": "#3366ff" }`, every `bg-primary` in the app draws blue — pagination's selected page, a data table's move indicator — while `colors.primary` in JSX stays the theme's citrus. One name, two colours, and the panels drawn by class are the ones that differ. Set the role in `"theme"` instead.

The theme file stays complete: copy it, then edit. A shadcn slot it leaves out falls back to shadcn's neutral (see [Colors](#colors)), and `semantics.json` names tokens with `{token}`, so both appearances need the same set.

Add a colour the app's own classes use (both appearances — a token in one alone is not a token):

```json
{
  "cssVars": {
    "light": { "brand-alt": "oklch(0.65 0.14 300)" },
    "dark": { "brand-alt": "oklch(0.72 0.12 300)" }
  }
}
```

Change a role: `primary` in `cssVars.light` and `cssVars.dark`. Change a radius: `radius-control`, `radius-container` or `radius-modal` in `cssVars.theme` (keep `radius` equal to `radius-control`) — every corner follows them: `shape.*` and `rounded()` in the styles, and `rounded-(--radius…)` in the classes, this library's and the app's own alike. Set the fonts in the same block: see [Fonts](#fonts).

## Fonts

Two base tokens are fonts: `font-sans` is the app's body font — every text that names no family of its own — and `font-mono` is the monospaced family: the `font-mono` class, code in a `Text`, and this library's `mono()`. Both live in `cssVars.theme`, and every shipped theme declares each of them. Nothing in `semantics.json` names a family: each of the 7 typography composites carries `fontFamily: "{font.family.sans}"` because DTCG requires the field, but the library never reads it — NSH draws every text that names no family in `font-sans` itself, which is why a theme whose body font is the platform's writes a generic family:

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

Edit the sources; every component follows. Change a brand color in `cssVars.light` and `cssVars.dark`, a radius or font in `cssVars.theme`, a shadow part in the DTCG `shadow` group, a gradient, style group or material in the theme's `tokens/` files. Keep the keys: components and finishes refer to them by name, and both appearances need the same merged finish shape — a finish you add states every field of its neighbours, and a value that follows the device is stated twice, `pointer` and `touch`, with the same keys — a theme that has its own device sizes writes them in `tokens/themes/<id>/pointer.tokens.json` and `touch.tokens.json`, and one that does not inherits the base set's.

- Add the theme to an app with `shadcn-nsh add theme` (or let `init` do it); subsequent `add` runs key-merge missing entries into `theme.json` and `semantics.json` while keeping your values.
- Replacing both files together rebrands the whole library; a key added upstream should be added here too.
- The demos on this site can draw in an installed theme: the **Demo theme** switch in the nav (Default, shadcn, Solid Glass, Apple, Material or WinUI 3) writes the demo app's palette and loads the panels again. The list is `apps/website/demos/palettes.ts`; a demo reads the palette before it mounts, so its first frame is already the chosen theme. Every palette — its install command and every role it sets — has a page linked from [Themes](./themes).
- To change one component's look instead, edit its look function in the copied component; to change structure or API, edit the shell. See [Customizing](./customizing).
- Maintaining this repository: edit the look in `packages/ui` (all of it is ours; a credit line in the header says where it began); `port:check` lists upstream's changes and `bun run port:review` marks them read. After editing `packages/theme`, run `bun run registry:build` and commit `public/r`.

Theme rules and decisions: [`docs/specs/design-semantics.md`](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/design-semantics.md), [`docs/specs/theme-roles.md`](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/theme-roles.md) and [`packages/theme/README.md`](https://github.com/aningdev/shadcn-nsh/blob/main/packages/theme/README.md). Behavior and accessibility are `nsh/base`'s: [nsh.dev/elements](https://nsh.dev/elements).
