# @shadcn-nsh/theme

[中文](./README.zh.md)

Brand look for the copy-into-app layer: this library's own, started from the upstream gallery UI theme. **Every color is `oklch()`** — tokens, the stops of a gradient, the colors of a shadow — with alpha as `oklch(… / a)`. NSH reads `oklch()` wherever a color is a string (`references/nsh/website/docs/styling.md#colors`), so one file holds one form of color and a value reads as the lightness and the hue it is.

| File                                    | Role                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens/`                               | W3C DTCG 2025.10 source of truth for all six themes (`tokens/base/*` and `tokens/themes/<id>/*`), compiled by `bun run tokens:build` into `theme.json`, `semantics.json`, `{light,dark}.tokens.json`, `DESIGN.md`, and `themes/<id>/`                                                                                                                                                                           |
| `theme.json`                            | Compiled base tokens: colors (light / dark and shared), the three `radius-*` layer lengths (`radius-control`, `radius-container`, `radius-modal`, plus the A-layer `radius` equal to `radius-control`), and fonts (`cssVars`)                                                                                                                                                                                   |
| `semantics.json`                        | Compiled semantic layer: DTCG-named style groups (`typography`, `dimension`, `shape`, `state`, `transition`, `motion`, `controls`), where `dimension.control` states the six behaviour-named control dimensions and `motion.state` the states' fade, the shadow scale (`elevation`, one per appearance) and `finishes` (`shared` plus sparse `light` / `dark` overrides), referencing base tokens via `{token}` |
| `light.tokens.json`, `dark.tokens.json` | Standalone W3C DTCG 2025.10 Format files resolved per appearance at the `pointer` tier (in-file aliases, 6-digit `hex` fallbacks) for Figma Variables (Light/Dark modes), Tokens Studio, and Style Dictionary v4; static snapshots of the shipped theme (not read at runtime, and unaffected by later edits to `theme.json`)                                                                                    |
| `DESIGN.md`                             | Generated Google Labs DESIGN.md (`alpha`) specification for coding agents, compiled from DTCG sources and the pointer-tier `light`/`dark` resolutions (`#RRGGBB`/`#RRGGBBAA` colors, typography, rounded, spacing, motion, components, and rationale prose; never edited by hand)                                                                                                                               |
| `theme.ts`                              | Readers: `colors`, `finish`, `elevation`, `shape`, `font`, `style`, `mono`, `focusRing`, `selectTheme`, `fillStyle`, …                                                                                                                                                                                                                                                                                          |
| `themes/<name>/`                        | Other themes, one `AppTheme` each: `shadcn/` (shadcn's `neutral`), `solid-glass/` (Solid Glass), `apple/` (Apple's system palette and Liquid Glass), `material/` (Material 3 Expressive), `winui/` (WinUI 3 for Windows 11), `native/` (`nativeTheme()`: apple on iOS and macOS, material on Android, winui on Windows, the default elsewhere), and `default/` (this one, to install beside it)                 |

## Spec

New to theming here? [`docs/theme-design.md`](../../docs/theme-design.md) walks through every decision a theme makes, where each lands in the sources, and which check holds it.

Besides `finishes` (`shared` + sparse `light` / `dark`) and `elevation` (the shadow scale, `sm` / `md` / `lg` / `xl` / `inset` / `edge.{surface,accent}`, one per appearance), `semantics.json` states a theme's **style** using DTCG-named groups (`typography`, `dimension`, `shape`, `state`, `transition`, `motion`, `controls`) that every theme writes with the same keys. `density`, `controlSize`, `motion`, `control()` (the six control dimensions, `selection` / `field` / `choice` / `track` / `handle` / `group`), `cornerCurve`, `focusRing` and `controls()` (`"base" | "material" | "winui"`, still read by the components that have not moved to the dimensions yet) read them from the theme in use, so `selectTheme` redraws what reads them; `style()` gives the whole set. Components read the corner roles by layer through `shape` (`shape.control`, `shape.container`, `shape.modal`, resolved reactively from `dimension.shape.*` `{radius-…}` via `token()`, plus `shape.button`, which returns `999` when `shape.corners.button === "full"` and `shape.control` otherwise), `font` (`font.size`, `font.lineHeight` (whole points), `font.weight` and `font.letterSpacing` read each typography role), `stroke` (`hairline` and `control` widths), `dimmed` (pressed and disabled fades), `controlHeight`, `iconSize` and `hitTarget()` (sizes), and `mono()` for `font-mono` (NSH draws `font-sans` itself), and `rounded(outer, inset)` derives nested corners concentrically (`Math.max(outer - inset, 0)`). `theme.json` defines `radius-control`, `radius-container`, and `radius-modal` (plus the A-layer `radius` slot equal to `radius-control`) once, so Tailwind classes and host `setThemeOverrides` reach `shape.*` automatically.

A theme is three things: a **token** (a colour, a length or a font family under a name, as `theme.json` states it), a **finish** (one of the twelve layers a component can be drawn on — background, ink, gradient, edge, the scale's shadow parts, blur, material — as `semantics.json` states it), and an **alias** (`var(--x)` in `theme.json`, `{x}` in `semantics.json`). The layering model and `{token}` rules are in [`docs/specs/design-semantics.md`](../../docs/specs/design-semantics.md); which tokens there are, what each finish draws and who reads it, is [`docs/specs/theme-roles.md`](../../docs/specs/theme-roles.md); `bun scripts/theme-lint.ts` holds these two files to it.

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as registry item `theme` (the app's build-time theme), and as `theme-<name>` for the others. To update any theme, edit the DTCG sources under `packages/theme/tokens/` and run `bun run tokens:build`, then `bun run registry:build` and commit `public/r`. The five generated themes (`shadcn`, `solid-glass`, `apple`, `material`, `winui`) are written by `scripts/theme/generate-<name>.ts`: the theme file states its colours, style and control presets, `scripts/theme/finishes/<name>.ts` states its twelve finishes and shadow scale (`finishes` and `shadows`, `shared` plus sparse `light` / `dark`), and `scripts/theme/dtcg.ts` encodes both into the DTCG sources and compiles them. `scripts/theme/generators.test.ts` asserts that each generator reproduces its committed source byte for byte, so after touching a generator or its data run `bun run test:unit` and check `git status` (see [`docs/port.md`](../../docs/port.md#主题文件)).

The default theme's DTCG source (`tokens/`) and compiled outputs (`"owned"` in [`port-map.json`](../../port-map.json)) belong to this library: `port:vendor` no longer refills them and `port:check` does not compare them with upstream, so they are edited here like any other source ([`docs/port.md`](../../docs/port.md#主题文件)). The look still follows the upstream gallery UI theme; what changed is who owns the data.

All six themes' `themes/<id>/{theme,semantics}.json`, `{light,dark}.tokens.json`, and `DESIGN.md` (alongside the top-level files for `default`) are compiled by `bun run tokens:build` from `packages/theme/tokens/` and never edited by hand (guaranteed up to date by `tokens:build --check`, and `default` byte-identical by `scripts/theme/themes.test.ts`); the `index.ts` beside them is written once, by hand, and names the theme. The build-time theme is installable as one more theme because a registry item ships files, not a path into this package.

Values are written at a fixed precision (L and C five decimals, H three, alpha three), which is what makes the conversion lossless: every sRGB color lands back on its own 8-bit channels, so storing the theme as `oklch()` moves no pixel.

## Overriding

An app sets the look through `nsh.json`'s `"theme"` — the tokens above, read where they are used, so `setTheme` and every theme an app carries land in one place — and not through `"tailwind"`, which shapes the app's own class strings when it is built: a colour named there wins over the token class of the same name, and nothing in it follows a theme. Fonts are tokens too (`font-sans`, `font-mono`), and the family they name ships with the app, never with this package. [Override from nsh.json](https://shadcn-nsh.aning.dev/docs/theme#override-from-nshjson) and [Fonts](https://shadcn-nsh.aning.dev/docs/theme#fonts) are the docs.

## More than one theme

An app is **built** with one theme — `init --theme <name>`, which writes `theme.json` and `lib/ui/semantics.json` and points `nsh.json` at them — and can **carry** more: `shadcn-nsh add theme-<name>` installs another into `themes/<name>/` and leaves the build-time one as it is. Each is one `AppTheme` module:

```ts
// themes/shadcn/index.ts, as `add theme-shadcn` copies it in
export const shadcn: AppTheme = {
  id: "shadcn",
  label: "shadcn neutral",
  theme, // theme.json
  semantics, // semantics.json
};
```

`selectTheme(theme)` switches the running app to it: the tokens first (`nsh`'s `setTheme`, so colors, radii, fonts, the focus ring and `nsh/base` follow), then the semantics — gradients and shadows, which no token holds, read through `finish`'s getters, and `state["press-scale"]` (read via `press.scale`), which says how far a pressed control sinks (`1`: not at all, as shadcn draws it). Every component on screen redraws with both on the next frame, and the appearance (light / dark / system) stays the app's: it applies to whichever theme is in use. `selectTheme(null)` goes back to the build-time theme. A theme `setTheme` refuses (a color NSH does not know) throws `TypeError` and leaves both as they were.

`currentTheme()` is the `id` in use, and `null` while the app is on its build-time theme — the runtime cannot read `nsh-ui.json`. Reading it subscribes, so a list can mark the current row.

**The build-time theme is the list's `null`.** The app writes that list itself; the CLI writes no manifest and no storage:

```ts
// themes.ts — the app's own file.
import { Storage } from "nsh";

import { selectTheme, type AppTheme } from "./lib/ui/theme";
import { shadcn } from "./themes/shadcn";

/** One per `shadcn-nsh add theme-<name>`: the build-time theme is not in it. */
export const themes: AppTheme[] = [shadcn];

/** At launch: what the user chose last time; `null` (or nothing stored) is the build-time theme. */
export async function restoreTheme() {
  const id = await Storage.getItem("theme");
  selectTheme(themes.find((theme) => theme.id === id) ?? null);
}

/** On a pick: switch, then remember which one. */
export async function chooseTheme(theme: AppTheme | null) {
  selectTheme(theme);
  if (theme === null) await Storage.removeItem("theme");
  else await Storage.setItem("theme", theme.id);
}
```

**This library's own theme is one of them.** An app built on another theme — `init --theme shadcn` — can install the build-time one beside it with `shadcn-nsh add theme-default`: `themes/default/` holds the same `theme.json` and `semantics.json` the app would have been built with, and an `index.ts` exporting `defaultTheme`. Listing both is then all it takes to switch back and forth; `selectTheme(null)` still means "the theme this app was built with", whichever one that is.

Rules: [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md). Toolchain / baseline: [`docs/toolchain.md`](../../docs/toolchain.md).

```sh
bun run test:unit   # the oklch round trip, the theme contract among other unit tests
```

Replace `theme.json` + `semantics.json` together to rebrand; keep the keys the upstream theme declares so finishes resolve. To add a theme to the app's list, copy a `themes/<name>/` directory into this package as it is (its two JSON files and the `index.ts` that names it) and add a `theme-<name>` item to `registry.json` — `theme-default` is that item for `themes/default/`.
