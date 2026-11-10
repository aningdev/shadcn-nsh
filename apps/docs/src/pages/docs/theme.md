---
layout: ../../layouts/Docs.astro
title: Theme
description: theme.json is the color/radius truth (NSH's standard keys plus our custom- ones); finish and the focus ring brand surface depth.
---

Token truth for **colors and radius** is **`theme.json`** (wired through `nsh.json` `theme`). Surface depth and short press motion live beside it as **this package’s increment** (not default shadcn theming tokens). See the [theme README](https://github.com/aningdev/shadcn-nsh/blob/main/packages/theme/README.md).

Styled wrappers read helpers from `@shadcn-nsh/theme` (`colors`, `radius`, `finish`, `focusRing`, …).

## Install

```npx tabs
npx shadcn-nsh@latest add theme
```

```bunx tabs
bunx shadcn-nsh@latest add theme
```

```pnx tabs
pnx shadcn-nsh@latest add theme
```

```yarn tabs
yarn dlx shadcn-nsh@latest add theme
```

## Colors — `theme.json`

Authoring copy lives at `packages/theme/theme.json`. It is plain shadcn `cssVars`, every color written as oklch:

- `cssVars.theme` — shared tokens (`radius`)
- `cssVars.light` / `cssVars.dark` — semantic colors (`background`, `foreground`, `primary`, …)

The file starts from NSH's own default theme (shadcn `neutral`): **every official key is here with its official value**. What is ours is only the keys with a `custom-` prefix:

| Ours                | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `custom-shadow-ink` | Shadow tone (opaque); `finish` sets the opacity          |
| `custom-highlight`  | Inset highlight tone (opaque); `finish` sets the opacity |
| `custom-backdrop`   | The dimming behind modals                                |

NSH resolves `cssVars` into runtime tokens. Prefer editing JSON over hard-coding color in components. Shadows are not tokens in NSH, so they never go in `cssVars`: their colors are the `custom-*` tokens above and their shapes are `finish` in `theme.ts`.

## Finish

Light/dark semantic **surface depth** (`finish.*`). Depth only: pair with `colors.*` for fills.

| Role                                       | Use                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `control.rest` / `flat` / `pressed` / `on` | Bordered control surfaces (e.g. [Button](/docs/components/button)); a hover keeps `rest`           |
| `filled`                                   | A control on a solid brand fill                                                                    |
| `popup`                                    | Popup-family **one** soft shadow — used by `popupSurface` / `modalSurface` / `overlayShadow` below |

A component names a role; it writes no shadow of its own.

```tsx
import { colors, finish } from "@shadcn-nsh/theme";

// control
style={{ backgroundColor: colors.secondary, boxShadow: finish.control.rest }}

// overlay (prefer the shared helpers)
import { modalSurface, popupBackdrop, popupSurface } from "@shadcn-nsh/theme";
style={popupSurface()}
// a dialog or sheet card: style={modalSurface()}
// backdropStyle={popupBackdrop()}
```

## Motion

Motion is **not** part of the theme. It follows [`nsh` Animation](https://nsh.dev/docs/animation) and its element docs, and each component writes the few lines it needs (the press sink in Button, the entrance in Popover / Menu / Tooltip). The conventions are in the [UI README](https://github.com/aningdev/shadcn-nsh/blob/main/packages/ui/README.md#motion-in-components). Reduced motion removes the scale and keeps the short colour fade. Dialog/Sheet keep `nsh/base`'s own motion, and Select/Combobox have no entrance hooks to set.

## `token()` and helpers

```tsx
import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import { token } from "nsh";

const pad = radius.control;
const fg = colors.foreground;
const ring = focusRing();
// or: token("primary")
```

- `token(name)` — reactive read of a named token from the active theme
- `colors.*` / `radius.control` — thin getters over `token()` for common names
- `focusRing()` — shared keyboard focus outline
- `finish.*` — surface depth; `disabledOpacity()` — the one disabled look

Changing brand colors means editing **`theme.json`**. Changing shadow shapes means editing **`finish` in `theme.ts`**.

## Gallery vs docs

Native verification of theme + components: `apps/gallery`. Docs pages may show optional web demos; they are sketches, not the token authority.

## Behavior & elements

Control behavior and a11y stay on [nsh.dev/elements](https://nsh.dev/elements). Theme here only brands the styled layer.
