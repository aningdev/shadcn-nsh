# @shadcn-nsh/theme

[中文](./README.zh.md)

The brand look of the styled / copy-into-app layer: colors, radius, shadows, the focus ring and one disabled look. This is **this package's increment** on top of `nsh`, not NSH design tokens and not shadcn's default scaffold. Component structure rules and motion live in the [`@shadcn-nsh/ui` README](../ui).

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as registry `theme` (`theme.json` + `lib/theme.ts`). After edits: `bun run registry:build` from the repo root and commit `public/r`.

## What the theme holds

| What                          | Where                                                                   | Read through                            |
| ----------------------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| Colors (light / dark), radius | `theme.json` `cssVars` (`nsh.json` `theme`)                             | `colors.*`, `radius.control`, `token()` |
| Shadow colors, backdrop       | `custom-shadow-ink`, `custom-highlight`, `custom-backdrop` in `cssVars` | `finish.*`, `popupBackdrop()`           |
| Shadow shapes                 | `theme.ts` (`finish`)                                                   | `finish.*`                              |
| Focus ring                    | `theme.ts`                                                              | `focusRing()`                           |
| Disabled look                 | `theme.ts`                                                              | `disabledOpacity()`                     |

`theme.json` is plain shadcn `cssVars` with every color written as oklch: NSH reads it, types it and follows the appearance by itself. Shadows are not tokens in NSH (it drops them from `cssVars`), so the shapes live in `theme.ts` and the colors come from the tokens above.

**Not in the theme:** motion and transitions (`nsh`'s own values, written in each component, see the UI README), sizes, type scale and per-variant opacities (a component's `look()`). Why: the theme is not a general design system, and those values are `nsh`'s or one component's internals, not brand. Add a token only when a component consumes it; add a helper only when several components need the same value.

**Colors.** Components read semantic tokens only; raw hex / `rgb` / palette classes are a review finding. `alpha(colors.x, a)` keeps the semantic source.

**Copy-into-app.** `theme.json` is installed at the project root. When the app already has one, `init` and `add` merge in the keys it lacks (`custom-shadow-ink`, `custom-highlight`, `custom-backdrop`) and keep every value it has. An app that replaces the file with a generated theme must keep those three tokens, or the finish helpers return `undefined`.

## Official and ours

`theme.json` starts from NSH's own default theme, shadcn's `neutral` (`crates/nsh-base/src/default-theme.json` in `nsh`). **Every key of it is here with its official value**: `radius` and 31 colors per appearance, all oklch. A brand override changes such a value in place. **Our own keys are only the ones below, each with a `custom-` prefix**, so what is NSH's and what is ours can be told apart in the file, in `Tokens` and in a generated theme.

| Ours                | Light                         | Dark                 | Purpose                                                 |
| ------------------- | ----------------------------- | -------------------- | ------------------------------------------------------- |
| `custom-shadow-ink` | `oklch(0.1686 0.0226 263.69)` | `oklch(0 0 0)`       | Shadow tone; opaque, `finish` sets the opacity          |
| `custom-highlight`  | `oklch(1 0 0)`                | `oklch(1 0 0)`       | Inset highlight tone; opaque, `finish` sets the opacity |
| `custom-backdrop`   | `oklch(0 0 0 / 0.4)`          | `oklch(0 0 0 / 0.4)` | The dimming behind modals; opacity is part of the value |

`bun run test:unit` checks it: every official key is present with the official value, every other key starts with `custom-`, every color is oklch, and the two shadow tones stay opaque.

## Finish

Surface depth, `boxShadow` only; fills stay on `colors.*`. A finish is chosen by what the surface is, never by which component draws it, so a component names a role and writes no shadow of its own.

| Role              | Use                                                                     |
| ----------------- | ----------------------------------------------------------------------- |
| `control.rest`    | A bordered control's raised edge (secondary Button)                     |
| `control.flat`    | A hairline under a bordered control (outline, destructive)              |
| `control.pressed` | The sunk press                                                          |
| `control.on`      | A selected or toggled-on control                                        |
| `filled`          | A control on a solid brand fill                                         |
| `popup`           | Popup-family **one** soft shadow (menu, popover, select, dialog, sheet) |

A hover has no entry: it keeps the rest shadow and the state style changes the fill only. Overlay chrome is shared: `popupSurface()`, `popupBackdrop()`, `overlayShadow()`; `modalSurface()` is added with the `dialog` / `sheet` migration.

## State

- `focusRing()` — the edge turns `ring` and a 3-point outline halo lies around the view. An ancestor with `overflow: hidden` clips it; leave room, or draw the focus inside.
- `disabledOpacity(disabled?)` — the one disabled look, `0.5`. Without an argument it is the value for a `disabledStyle`; with a flag it dims a part that styles itself. Precedence is base's: `disabled` wins over every other state, so a disabled control needs no hover or press handling of its own.

## Helpers

```tsx
import { colors, disabledOpacity, finish, focusRing, radius } from "@shadcn-nsh/theme";
import { token } from "nsh";

const pad = radius.control;
const fg = colors.foreground;
const ring = focusRing();
// or: token("primary")
```

- `token(name)` — reactive read of a named token from the active theme
- `colors.*` / `radius.control` — thin getters over `token()`; `alpha(color, a)` — a color at opacity `a`
- `finish.control.*` / `finish.filled` / `finish.popup` — surface depth; `popupSurface()` / `popupBackdrop()` / `overlayShadow()` — overlay chrome
- `focusRing()`, `disabledOpacity()` — shared state looks

Changing the brand means editing `theme.json` (colors, radius, shadow colors) or `finish` in `theme.ts` (shadow shapes).

## Rejected

- `--shadow-*` in `theme.json` `cssVars`: NSH treats shadows as non-tokens and drops them.
- MUI `shadows[0..24]` or MD3 elevation levels as the public API: wrong press model, poor fit for inset control finishes.
- Shadows only inside component files (stock shadcn): there is no CVA / className distribution here, so a reusable theme layer is needed.
- Copying the gallery's roughly 20 finish keys up front: add a key when a component consumes it.
- Motion, press, density, type scale or tint values as tokens, or as a custom `brand` section of `theme.json`: not brand (see above), and the attempt needed a JSON import, CLI path rewriting and a merge step; a generator that overwrites the file also drops an unknown section.
- CSS as the source with a generator that writes `theme.json`: NSH cannot read CSS, so it needs a parser (oklch, `color-mix`) and a build step the app would also have to run, and an edit to the generated files drifts from the source. A CSS-to-`cssVars` import command can come later.
- A token per component size (`button-height-sm` and so on): `Tokens` would grow without bound and apps edit the copied component anyway.

## Decisions

- 2026-11-10 — Four ADRs folded into the two READMEs; new decisions are added here, one line each with a reason.
- 2026-11-10 — The six control finishes become roles (`control` / `filled` / `popup`). Why: only Button used them and wrote a shadow per variant and state; roles keep the brand depth and take that configuration out of components.
- 2026-11-10 — Shadow colors are `cssVars` tokens (`custom-shadow-ink`, `custom-highlight`, `custom-backdrop`); the shapes stay in `theme.ts`. Why: colors belong in the one color file and follow the appearance for free; offsets and blur are structure. Checked on `nsh` 0.4.0: `color-mix` colors parse inside `boxShadow`.
- 2026-11-10 — The theme is colors, radius, shadows, the focus ring and one disabled look. Motion, sizes, type scale and tints were tokenized in `theme.json` for a day and withdrawn. Why: they are `nsh`'s values or one component's internals, and holding them needed a `brand` section, a JSON import and CLI rewriting.
- 2026-11-10 — `init` / `add` merge missing keys into an existing `theme.json` instead of skipping it. Why: `add theme` used to skip an existing file, which would leave the copied helpers without their tokens.
- 2026-11-10 — The disabled opacity is 0.5 everywhere (select and combobox items were 0.4). Why: one disabled look.
- 2026-11-10 — Hover changes the fill only and keeps the rest shadow; `finish.hover` is gone (it equalled `raised`). Why: a state style merges over the base style, so a repeated shadow is noise.
- 2026-11-10 — Our own keys carry a `custom-` prefix, every color is oklch, and `theme.json` keeps every key of NSH's default theme with its official value. Why: the file mixes NSH's standard with ours, and a prefix plus a test is the only way to tell them apart in JSON, which has no comments; oklch is what the official theme uses.
