---
title: Theme
description: theme.json and semantics.json are the look; lib/ui/theme.ts reads them for every component.
---

The theme is the upstream gallery's: a graphite page (paper in light appearance), cards and insets, one citrus accent, compact controls with a pointer and roomier ones on a touch screen. It is two JSON files — base tokens in `theme.json` and cross-platform semantics in `semantics.json`, following the [design-semantics standard](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/design-semantics.md) — plus the module that reads them, and every component takes its colors, radii, typography, motion and depth from there. No component writes a color of its own.

## Files

| File              | What it holds                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme.json`      | Base tokens: colors (light / dark and shared), all 8 `radius-*` lengths, and font families (`font-mono`, optional `font-sans`) in shadcn's `cssVars` shape                                                 |
| `semantics.json`  | Semantic layer: 9 style groups (`type`, `shape`, `size`, `stroke`, `focus`, `state`, `motion`, `icon`, `indicator`) and `finishes` (`shared` + sparse `light` / `dark`), referencing tokens with `{token}` |
| `lib/ui/theme.ts` | `colors`, `finish`, `shape`, `font`, `style`, `mono`, `focusRing` and `alpha`, read reactively from both files                                                                                             |

## Installation

```npm
npx shadcn-nsh@latest add theme
```

`add theme` writes `theme.json`, `lib/ui/semantics.json` and `lib/ui/theme.ts`, the data of the theme `nsh-ui.json` records (`theme-shadcn` writes shadcn's). `init` writes the same files and also points each `nsh.json` at `theme.json`. In a monorepo they live under `packages/ui`. Every component depends on it.

## Colors

`theme.json` is a shadcn theme: `cssVars.theme` holds the radii and the accent's raw values, `cssVars.light` and `cssVars.dark` hold the same semantic keys for the two appearances. The core keys are shadcn's (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar*`). Upstream adds the roles the gallery needs:

| Role                                                                               | Use                                                                 |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `inset` / `raised`                                                                 | A surface inside a card, and a control on the card                  |
| `field` / `input`                                                                  | An input's well and its edge                                        |
| `line` / `border`                                                                  | Hairlines inside insets, and the edge of a card or control          |
| `hover` / `faint`                                                                  | The pointer's wash, and the quietest text                           |
| `ring-halo`                                                                        | The keyboard focus's halo around the `ring` edge                    |
| `brand` / `brand-fill`                                                             | The accent as ink, and as a fill with `on-brand` on it              |
| `track` / `knob`                                                                   | A switch's track when off, and its knob                             |
| `scrollbar-thumb*`                                                                 | The scroll bars, opaque over the view                               |
| `code`                                                                             | Code inside insets                                                  |
| `info` / `warn` / `up` / `down` / `violet`                                         | The tones beside the accent                                         |
| `brand-tint`, `info-tint`, `warn-tint`, `destructive-tint`, `up-tint`, `down-tint` | The same tones as fills behind text                                 |
| `on-brand-tint`                                                                    | Text and icons on the `brand-tint` fill                             |
| `inverse` / `inverse-foreground` / `inverse-brand`                                 | A toast's and a tooltip's reversed surface, its text and its action |
| `window-close`, `window-minimize`, `window-zoom`, `window-control-*`               | The macOS traffic lights                                            |

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

A finish is light and depth: a gradient over the color, its shadows, its edge. `semantics.json` keeps `finishes.shared` (fields identical in both appearances, referencing `{token}` so NSH's `token()` handles light/dark switching) plus sparse `finishes.light` and `finishes.dark` overrides, and `finish.<role>` merges them and resolves every `{token}` (including `oklch(from {card} l c h / 0.78)`) for the active appearance.

| Role                             | Use                                                           |
| -------------------------------- | ------------------------------------------------------------- |
| `card` / `inset` / `field`       | The three surfaces, each with its own shadow                  |
| `raised` / `hover` / `pressed`   | A control at rest, under the pointer, pressed                 |
| `light` / `accent`               | A control on the citrus fill                                  |
| `track` / `fill`                 | A rail, and the accent that runs in it                        |
| `knob` / `knobOn` / `handle`     | A switch's knob off, and on; a slider's thumb                 |
| `pill` / `thumb` / `on`          | A segmented control's track, its thumb, what stays chosen     |
| `chip`                           | A small raised label                                          |
| `glass`                          | A control over a photo                                        |
| `menu`                           | A floating surface's soft shadow                              |
| `dialog` / `tooltip` / `inverse` | A dialog card, a tooltip's bubble, a toast's reversed surface |
| `groove`                         | The lip of light under a separator                            |

Every finish also carries a `material`: `null` (every theme the library ships), or what the platform's own glass should be. `apple` is `{ glass: "regular" | "clear", tint }` and rides inside `finish.<role>` as `glassEffect` and `glassTintColor`, so a spread of the finish carries it; `ios`, `macos` and `windows` are props, not style keys, which `platformMaterial(role)` returns for the view that draws the finish:

```tsx
<View {...platformMaterial("menu")} style={{ ...finish.menu }} />
```

Both follow `selectTheme` and the appearance, and with `material: null` the view is drawn as before. The library's own popovers, hover cards, toasts, the code editor's find bar and a glass carousel arrow spread it; the popups of `Menu`, `Select` and `Popover` on `nsh/base` take only `popupStyle`, so there the glass keys apply and the platform props do not.

The `apple` theme fills in `material.apple`: `glass`, `menu` and `raised` carry `{ glass: "regular" }` (Liquid Glass on iOS and macOS 26+), and every other finish is a flat fill with a hairline edge. The `material` theme uses Material 3 Expressive tonal surfaces, circular corners, 8/10/10% state layers, press ripple (`state.ripple: true`), and `material.android.elevation` on elevated surfaces. `nativeTheme()` from `theme-native` picks the theme of the platform the app runs on — Apple's on iOS and macOS, Material on Android, and the default theme everywhere else:

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

`theme.json`'s `cssVars.theme` block defines all eight corner radii once (`radius`, `radius-control`, `radius-field`, `radius-chip`, `radius-card`, `radius-overlay`, `radius-dialog`, `radius-sheet`). In `semantics.json`, `shape.*` references them with `"{radius-…}"` alongside `shape.curve` (`"continuous" | "circular"`) and `shape.corners.field` (`"all" | "top"`). `shape` resolves each role reactively via `token()`:

```tsx
import { shape } from "@shadcn-nsh/theme";

shape.inset; // 10, from radius
shape.control; // 8, from radius-control
shape.field; // 8, from radius-field
shape.chip; // 10, from radius-chip
shape.card; // 14, from radius-card
shape.overlay; // 10, from radius-overlay
shape.dialog; // 14, from radius-dialog
shape.sheet; // 14, from radius-sheet
```

Themes generated from a base radius (`shadcn`, `solid-glass`) derive `radius-control` / `radius-field` at `0.8×` and `radius-card` / `radius-dialog` / `radius-sheet` at `1.4×`, while platform themes (`apple`, `material`) state their metrics per role (`999px` capsules for `radius-control`, `28px` dialogs and sheets in `material`). `rounded()` puts a corner on one of these with `shape.curve` (`"continuous"` or `"circular"`):

```tsx
import { rounded, shape } from "@shadcn-nsh/theme";

const card = { ...rounded(shape.card) };
```

## Reading the theme

```tsx
import { alpha, colors, finish, focusRing, rounded, shape } from "@shadcn-nsh/theme";

const card = {
  backgroundColor: colors.card,
  borderColor: colors.border,
  ...rounded(shape.card),
  boxShadow: finish.card.boxShadow,
};

const ring = focusRing(); // the keyboard focus outline
const dim = alpha(colors.foreground, 0.4); // a color at 40%
```

`focusRing(offset)` is the shared keyboard outline: the muted `ring` edge and a 3-point halo of `ring-halo`. `hovered()` is the pointer's fill, the `hover` token (plus `stateLayer("hover")` when `state.overlay.hover > 0`). `alpha(color, a)` is a `color-mix` of that color with transparency. `colors`, `finish`, `shape` and `style()` are reactive: read them where they are used.

## Override from nsh.json

An app's `nsh.json` sets the look in two places, and the two do not merge:

| Key in `nsh.json` | What it sets                                                                                           | When it is read                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `"theme"`         | the path to `theme.json`: every base token — colours, all 8 `radius-*` tokens, `font-sans`/`font-mono` | on each read, at runtime — so `setTheme`, `setThemeOverrides`, `shape` and `font.family()` reach it |
| `"tailwind"`      | the app's own class strings: `colors`, `fontFamily`, `spacing`, `radius`, …                            | when the app is built, into the class strings — no component here reads it                          |

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

Change a role: `primary` in `cssVars.light` and `cssVars.dark`. Change a radius: any of the 8 `radius-*` tokens in `cssVars.theme` — every corner follows them: `shape.*` and `rounded()` in the styles, and `rounded-(--radius…)` in the classes, this library's and the app's own alike. Set the fonts in the same block: see [Fonts](#fonts).

## Fonts

Two base tokens are fonts: `font-sans` is the app's body font — every text that names no family of its own — and `font-mono` is the monospaced family: the `font-mono` class, code in a `Text`, and this library's `mono()`. Both live in `cssVars.theme`. In `semantics.json`, `type.family` is `"{font-sans}"` (or `"{font-mono}"`), or `null` for the system default; `font.family()` resolves it reactively via `token()`. The shipped themes set `font-mono` and leave `font-sans` out (`type.family: null`), so both use the system's own:

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

Edit the two JSON files; every component follows. Change a brand color in `cssVars.light` and `cssVars.dark`, a radius or font in `cssVars.theme`, a shadow, gradient, style group or material in `semantics.json`. Keep the keys: components and finishes refer to them by name, and both appearances need the same merged finish shape.

- Add the theme to an app with `shadcn-nsh add theme` (or let `init` do it); subsequent `add` runs key-merge missing entries into `theme.json` and `semantics.json` while keeping your values.
- Replacing both files together rebrands the whole library; a key added upstream should be added here too.
- The demos on this site can draw in an installed theme: the **Demo theme** switch in the nav (Default, shadcn, Solid Glass, Apple or Material) writes the demo app's palette and loads the panels again. The list is `apps/website/demos/palettes.ts`; a demo reads the palette before it mounts, so its first frame is already the chosen theme. Every palette — its install command and every role it sets — has a page linked from [Themes](./themes).
- To change one component's look instead, edit its look function in the copied component; to change structure or API, edit the shell. See [Customizing](./customizing).
- Maintaining this repository: edit the look in `packages/ui` (a `// @port` region is ours); `port:check` lists upstream's changes and `bun run port:review` marks them read. After editing `packages/theme`, run `bun run registry:build` and commit `public/r`.

Theme rules and decisions: [`docs/specs/design-semantics.md`](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/design-semantics.md), [`docs/specs/theme-roles.md`](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/theme-roles.md) and [`packages/theme/README.md`](https://github.com/aningdev/shadcn-nsh/blob/main/packages/theme/README.md). Behavior and accessibility are `nsh/base`'s: [nsh.dev/elements](https://nsh.dev/elements).
