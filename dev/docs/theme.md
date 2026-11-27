# Theme specification (/dev/docs/theme)

The theme is the upstream gallery's: a graphite page (paper in light appearance), cards and wells, one citrus accent, compact controls with a pointer and roomier ones on a touch screen. It is **one TypeScript module** — the spec `defineTheme()` compiles — plus the module that reads it, and every component takes its colors, radii, typography, motion and depth from there. `theme.json` and `DESIGN.md` are exports of that same spec, so a theme is written once and drawn, shipped and documented from one place. No component writes a color of its own.

## Files [#files]

| File                                    | What it holds                                                                                                                                                                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `themes/<id>/index.ts`                  | The spec: `tokens` (21 appearance roles per mode, the fixed `scrim` / `media` / `on-media`, radii, fonts, tints, charts), `metrics`, `elevation`, the eleven `surfaces`, `feedback`, `motion`, `controls` — a full `ThemeSpec` for `nsh-gallery`, a `defineTheme({ extends, … })` delta for the other five |
| `theme.json`                            | The build export in shadcn's `cssVars` shape: `cssVars.theme` (`font-sans`, `font-mono`, `radius`, `radius-md`, `radius-lg`, `radius-xl`, `scrim`, `media`, `on-media`), `cssVars.light` and `cssVars.dark` (the same 21 keys)                                                                             |
| `DESIGN.md`                             | Generated Google Labs DESIGN.md (`alpha`) specification for coding agents, compiled from the same spec                                                                                                                                                                                                     |
| `light.tokens.json`, `dark.tokens.json` | Standalone W3C DTCG 2025.10 Format files resolved per appearance (in-file aliases, 6-digit `hex` fallbacks) for Figma Variables (Light/Dark modes), Tokens Studio and Style Dictionary v4                                                                                                                  |
| `lib/ui/theme.ts`                       | `colors`, `surface`, `control`, `feedback`, `shape`, `font`, `metrics`, `elevation`, `motion`, `focusRing` and `alpha`, read reactively from the spec                                                                                                                                                      |

`bun run theme:build` writes `theme.json`, `DESIGN.md` and the two `.tokens.json` files from `themes/<id>/index.ts`; they are build outputs, so edit the spec, not them.

## Installation [#installation]

```npm
npx shadcn-nsh@latest init
```

`init` writes the theme into the app — `theme.json`, `DESIGN.md` and the readers under `lib/ui/` (in a monorepo, under `packages/ui`) — and points each `nsh.json` at `theme.json`. `add theme` does the same for the theme `nsh-ui.json` records; naming one (`add theme-shadcn`) installs that theme beside it, as one more `themes/<id>.ts` the app can switch to while it runs. Every component depends on the theme.

## Colors [#colors]

`theme.json` is a shadcn theme: `cssVars.theme` holds the shared values, `cssVars.light` and `cssVars.dark` hold the same 21 roles for the two appearances. A theme declares every one of them — `defineTheme()` fills what a delta leaves out from the theme it extends — and nothing else is read.

| Role                                           | Use                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `background` / `foreground`                    | The page, and the ink that sits on it                                                         |
| `card` / `popover`                             | A surface that holds content, and one that floats over the page                               |
| `muted` / `muted-foreground`                   | A quiet fill, and the text that reads on it                                                   |
| `surface`                                      | The tone one step above the page: a control at rest                                           |
| `faint`                                        | The quietest text                                                                             |
| `primary` / `primary-foreground`               | The accent as a fill, and what reads on it                                                    |
| `secondary` / `accent`                         | A second fill, and the fill a selected row or a hovered item takes                            |
| `brand`                                        | The accent as ink                                                                             |
| `border` / `line` / `input`                    | The edge of a card or control, a hairline inside one, and an input's edge                     |
| `ring`                                         | The keyboard focus outline                                                                    |
| `info` / `success` / `warning` / `destructive` | The tones beside the accent: information, a gain, a caution, a loss — the last also a failure |

Three more values do not turn with the appearance and are named in `cssVars.theme` beside the radii: `scrim` (what a modal dims the page with), `media` (the ground a photo or a video sits on) and `on-media` (ink drawn straight onto one).

`colors` maps the roles a component names onto those keys:

```tsx
import { colors } from "@shadcn-nsh/theme";

colors.background; // the page
colors.card; // a card
colors.surface; // a control at rest
colors.muted; // a well inside a card
colors.foreground; // body text
colors.mutedForeground; // secondary text
colors.brand; // the accent as ink
colors.primary; // the accent as a fill
colors.primaryForeground; // what reads on that fill
colors.destructive; // a failure
colors.success; // a gain
colors.warninging; // a caution
colors.onMedia; // ink on a photo
```

One ink serves them all: a card, a popover, a secondary and an accent surface read `foreground` unless the surface states its own, which `surface(role).ink` returns (see [Surfaces](#surfaces)). `tints.brand`, `tints.info`, `tints.success`, `tints.warning` and `tints.destructive` are the same tones as low fills behind text, and `toneColor(tone)` / `toneTint(tone)` pick either from the `Tone` a prop carries — `"neutral"`, `"accent"`, `"info"`, `"success"`, `"warning"` or `"destructive"`.

Read a role where it is drawn (in JSX, a `draw`, or an effect): the getters read the token then, so they follow the appearance.

## Surfaces [#surfaces]

A surface is light and depth: what a layer is filled with, and how it sits above what is behind it. There are eleven, and each states the same fields in every theme — `background`, `ink`, `gradient`, `border`, `borderTop`, `borderBottom`, `shadow`, `backdropFilter`, `material` and `elevation` — either for both appearances or split into `light` and `dark`. A field a surface leaves out is not missing: it is a neutral (no gradient, no material, no shadow), and a shadow names the parts of the theme's own scale (`["edgeSurface", "sm"]`) instead of writing one, so `elevation("md")` gives the same values on its own.

| Role      | Use                                                                |
| --------- | ------------------------------------------------------------------ |
| `card`    | A surface that holds content: a card, a section                    |
| `raised`  | A surface above the page: a button at rest, a chip, a pill         |
| `inset`   | A surface sunk into its host: a field, a track, a well             |
| `channel` | The groove a filled track runs in: a slider's rail, a progress bar |
| `plate`   | The plate a row or a group of controls sits on                     |
| `overlay` | A surface the page floats over: a menu, a popover, a select's list |
| `modal`   | A surface the page waits for: a dialog, a sheet                    |
| `inverse` | The reversed surface: a toast, a tooltip                           |
| `glass`   | A control over a photo                                             |
| `accent`  | The brand's own surface: a filled button, a switch that is on      |
| `fill`    | The accent's gradient face: a primary button's highlight           |

`surface(role)` returns the three things a view needs:

```tsx
import { surface } from "@shadcn-nsh/theme";

<View style={{ ...surface("raised").style, borderRadius: shape.control }} />;
surface("accent").ink; // the ink that reads on it
```

`style` is the layer's fill, gradient, shadow, edges and blur; `ink` is the text that reads on it; `platformProps` is what the platform's own glass should be — `ios`, `windows` and `android` props, not style keys — for the view that draws the surface:

```tsx
<View {...surface("overlay").platformProps} style={{ ...surface("overlay").style }} />
```

The `material` says what the platform's material should be: `null` (every theme but the glassed ones), `glass` or `acrylic` on the `apple` and `winui` surfaces that float, or a per-platform name. The `apple` theme fills in `glass`, `overlay` and `raised` (Liquid Glass on iOS and macOS 26+), and every other surface is a flat fill with a hairline edge; the `material` theme uses Material 3 Expressive tonal surfaces, circular corners, 8/10/10% state layers, press ripple and Android elevation on raised surfaces; the `winui` theme uses WinUI 3 (Windows 11) fills and strokes, 4/8-point circular corners, Segoe UI Variable, double focus rings and Windows blur on `glass`, `overlay` and `inverse`. `nativeTheme()` from `themes/native` picks the theme of the platform the app runs on — Apple's on iOS and macOS, Material on Android, WinUI 3 on Windows, and the NSH Gallery theme everywhere else:

```npm
npx shadcn-nsh@latest init --theme native
```

```tsx
import { nativeTheme } from "./themes/native";

// Before mount: the first frame is already the platform's theme.
selectTheme(nativeTheme());
```

Windows' Mica is not a surface: it is the window's own `backdrop` in `nsh-desktop` (Windows 11 maps it to Mica or Acrylic, macOS to a visual effect material), set once by the app in `nsh.json` and shown through surfaces whose fill is translucent:

```json
{ "window": { "backdrop": "window" } }
```

## Feedback [#feedback]

How a control answers the pointer and the keyboard is stated once, per theme, in `feedback`, and every component reads it there:

| Key        | What it states                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `hover`    | The pointer's treatment: a wash over the surface (`overlay`), or the surface it turns into (`fill`, `surface`)                       |
| `press`    | The press: how far the whole control sinks (`scale`, `translateY`), the wash over it, the surface it takes and the accent's own sink |
| `focus`    | The keyboard outline: its style (`halo`, `outline` or `double`), width and offset, and the colour of the inner ring                  |
| `disabled` | A control that cannot act: its content's opacity, whether the face is replaced, and the surface it takes                             |
| `passive`  | The opacity of content that is not interactive at rest, and while pressed                                                            |

```tsx
import { feedback } from "@shadcn-nsh/theme";

const hovered = { ...surface("raised").style, ...feedback.hoverStyle() };
const pressed = feedback.press("surface").activeStyle;
const ring = feedback.focusRing(); // the shared keyboard outline
feedback.disabled.contentOpacity; // 0.5 in the gallery's theme
```

`feedback.hoverStyle(ink?)` is the pointer's fill and `feedback.hoverSurface(ink?)` the surface it becomes, both for the ink you pass or the one the theme reads; `feedback.press(intent, options?)` takes `"surface"`, `"accent"`, `"ghost"`, `"outline"`, `"destructive"` or `"sinkOnly"` and returns the `activeStyle` and `transition` of a press; `feedback.focusRing(offset?)` is the muted `ring` edge and a halo of `ring` at 30%, or the double ring the Windows theme draws.

## Controls [#controls]

A control's own geometry and face live in the theme too, so switching themes changes its shape, not only its colours. `control(name)` resolves one for the active theme and the device's input tier:

```tsx
import { control } from "@shadcn-nsh/theme";

const knob = control("switch").knobStyle(true); // off and on states of the thumb
const rail = control("slider").rail; // 6 on a pointer, 8 on a touch screen
const corner = control("button").corner("md"); // "control", or 999 for a capsule
const field = control("field"); // edges, focus line, ground
```

The names are `button`, `badge`, `field`, `choice`, `switch`, `slider`, `progress`, `spinner`, `popup`, `list`, `tabs`, `menubar` and `well`.

## Radii [#radii]

`theme.json`'s `cssVars.theme` block defines three corner radii, one per layer: `radius-md` (in-page elements: fields, rows, chips, badges, wells, colour areas, keycaps), `radius-lg` (cards, menus, popovers, rich tooltips, list panels, toasts) and `radius-xl` (dialogs, sheets, drawers). shadcn's own `radius` slot equals `radius-md`. `shape` resolves each role reactively via `token()`, and `buttonCorner(size)` reads `control("button").corner` (`"control"` or `"full"` capsule):

```tsx
import { buttonCorner, shape } from "@shadcn-nsh/theme";

shape.control; // 8, from radius-md
shape.container; // 12, from radius-lg
shape.modal; // 14, from radius-xl
buttonCorner("default"); // 999 when button.corner.md is "full", else shape.control
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

## Reading the theme [#reading-the-theme]

```tsx
import { alpha, colors, elevation, feedback, rounded, shape, surface } from "@shadcn-nsh/theme";

const card = {
  backgroundColor: colors.card,
  borderColor: colors.border,
  boxShadow: elevation("md"),
  ...rounded(shape.container),
};

const raised = { ...surface("raised").style }; // the same layer the theme states
const ring = feedback.focusRing(); // the keyboard focus outline
const dim = alpha(colors.foreground, 0.4); // a color at 40%
```

`elevation("sm" | "md" | "lg" | "xl" | "inset")` resolves the theme's shadow scale for the active appearance, and a surface's `shadow` names those parts rather than writing them. `alpha(color, a)` is a `color-mix` of that color with transparency. `metrics`, `font`, `iconSize`, `controlHeight`, `stroke` and `motion` read the rest of the spec — sizes per input tier, the type scale, the timings — and `activeSpec()` is the whole `ThemeSpec` when a look needs a value the readers do not name. All of them are reactive: read them where they are used.

## Override from nsh.json [#override-from-nshjson]

An app's `nsh.json` sets the look in two places, and the two do not merge:

| Key in `nsh.json` | What it sets                                                                | When it is read                                                                 |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `"theme"`         | the path to `theme.json`: every base token — colours, the `radius-*` tokens | on each read, at runtime — so `setTheme`, `setThemeOverrides`, `shape` reach it |
| `"tailwind"`      | the app's own class strings: `colors`, `fontFamily`, `spacing`, `radius`, … | when the app is built, into the class strings — no component here reads it      |

Components take their look from `"theme"`: `colors`, `surface`, `control`, `shape` and `font` read the tokens where they are used. `"tailwind"` shapes class names — which this library writes too (`bg-muted`, `text-sm`, `h-8`) — but it is fixed at build time, so nothing in it can follow `setTheme`. NSH's [theme tokens](https://nsh.dev/docs/tailwind#theme-tokens) has the rule in full.

**A colour named in `"tailwind"` wins over the token of the same name.** With `"colors": { "primary": "#3366ff" }`, every `bg-primary` in the app draws blue — pagination's selected page, a data table's move indicator — while `colors.primary` in JSX stays the theme's citrus. One name, two colours, and the panels drawn by class are the ones that differ. Set the role in `"theme"` instead.

The theme file stays complete: copy it, then edit. Every role of both appearances is there, and a colour the app adds must be named in both (a token in one alone is not a token):

```json
{
  "cssVars": {
    "light": { "brand-alt": "oklch(0.65 0.14 300)" },
    "dark": { "brand-alt": "oklch(0.72 0.12 300)" }
  }
}
```

Change a role: `primary` in `cssVars.light` and `cssVars.dark`. Change a radius: `radius-md`, `radius-lg` or `radius-xl` in `cssVars.theme` (keep `radius` equal to `radius-md`) — every corner follows them: `shape.*` and `rounded()` in the styles, and `rounded-(--radius…)` in the classes, this library's and the app's own alike. A surface's shape and depth and a control's geometry are the spec's, so an app that changes them edits `themes/<id>.ts` — the file `add theme-<id>` installs — and copies it into its own reader if it does not. Fonts are the app's own: see [Fonts](#fonts).

## Fonts [#fonts]

Every `theme.json` writes `font-sans` and `font-mono`. Built-in themes leave `tokens.font` unset, so those keys are `system-ui` and `monospace` — the system's own faces — and one type scale (sizes and line heights) serves them all, so switching themes never reflows text. Each theme states its own weight and letter spacing per role. `font.sans` and `font.mono` read the two keys; the `font-sans` and `font-mono` classes read the same CSS variables. The user's system font size scales every size.

Set the app's families in the `cssVars.theme` block of its own `theme.json`:

```json
{
  "cssVars": {
    "theme": { "font-sans": "Inter, sans-serif", "font-mono": "JetBrains Mono, monospace" }
  }
}
```

NSH takes the first family of the list that is not a generic one (`system-ui`, `sans-serif`, `monospace` …), and a list of generics alone is the system's own font. That is why this library writes `monospace`: the system's monospaced font, not a font called "monospace".

A font file is the app's. Import it in TSX — the import registers it before the first frame, and its value is the family name the file declares, not the file name — and name that family in the theme:

```tsx
// app.tsx: the import bundles and registers the family; the app's `theme.json` names it.
import "./fonts/JetBrainsMono-Regular.ttf";
```

The side-effect import is deliberate: TypeScript drops an import whose value is unused, and the font with it, when the theme names the family as a string. A weight or an italic is a file of its own, `registerFont(bytes)` reads one the app did not ship, and the fallback after the app's family is what NSH draws for a family it cannot find — see NSH's [fonts](https://nsh.dev/docs/fonts#shipping-a-font).

This library distributes no font files: `add theme` writes JSON and TypeScript and names no family.

## Restyling [#restyling]

Edit the spec; every component follows. Change a brand colour in `tokens.light` and `tokens.dark`, a radius in `tokens.radius`, a shadow part in `elevation`, a gradient, a surface or a control in the theme's own `index.ts` — then `bun run theme:build` re-exports `theme.json`, `DESIGN.md` and the two `.tokens.json` files. Keep the keys: components and surfaces refer to them by name. A value that follows the device is stated twice, `pointer` and `touch`, with the same keys.

- A theme of your own is a `defineTheme()` delta over one that ships: `defineTheme({ id, label, extends: nshGallery.spec, tokens: { … } })`, sparse — what it does not state, it inherits. `ALL_THEMES` in `packages/theme/themes` is the list, and adding one there gives it a page on this site and a registry item.
- Add a shipped theme to an app with `shadcn-nsh add theme` (or let `init` do it); subsequent `add` runs key-merge missing entries into `theme.json` while keeping your values.
- The demos on this site can draw in an installed theme: the **Demo theme** switch in the nav (Default, shadcn, Solid Glass, Apple, Material or WinUI 3) writes the demo app's palette and loads the panels again. The list is `apps/website/demos/palettes.ts`; a demo reads the palette before it mounts, so its first frame is already the chosen theme. Every palette — its install command and every role it sets — has a page linked from [Themes](./themes).
- To change one component's look instead, edit its look function in the copied component; to change structure or API, edit the shell. See [Customizing](./customizing).
- Maintaining this repository: edit the look in `packages/ui` (all of it is ours; a credit line in the header says where it began). After editing `packages/theme`, run `bun run theme:build` and `bun run registry:build`, and commit `public/r`.

Theme rules: [`docs/theme.md`](https://github.com/aningdev/shadcn-nsh/blob/main/docs/theme.md) and [`packages/theme/README.md`](https://github.com/aningdev/shadcn-nsh/blob/main/packages/theme/README.md). Behavior and accessibility are `nsh/base`'s: [nsh.dev/elements](https://nsh.dev/elements).