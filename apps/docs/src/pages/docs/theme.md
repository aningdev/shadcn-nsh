---
layout: ../../layouts/Docs.astro
title: Theme
description: theme.json is the color/radius truth; finishes and press helpers brand surface depth and motion.
---

Token truth for **colors and radius** is **`theme.json`** (wired through `nsh.json` `theme`). Surface depth and short press motion live beside it as **this package’s increment** (not default shadcn theming tokens). See [ADR 0002](https://github.com/aningdev/shadcn-nsh/blob/main/docs/adr/0002-theme-finish-and-motion.md).

Styled wrappers read helpers from `@shadcn-nsh/theme` (`colors`, `radius`, `finish`, `pressSink`, …).

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

Authoring copy lives at `packages/theme/theme.json`. Shape:

- `cssVars.theme` — shared tokens (e.g. `radius`)
- `cssVars.light` / `cssVars.dark` — semantic colors (`background`, `foreground`, `primary`, …)

NSH resolves these into runtime tokens. Prefer editing JSON over hard-coding hex in components. **Do not** put shadow strings in `theme.json`.

## Finish — `finishes.json`

Light/dark semantic **surface depth** (`finish.*`). Depth only: pair with `colors.*` for fills.

| Role                                                      | Use                                                                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `raised` / `hover` / `pressed` / `on` / `accent` / `card` | Control surfaces (e.g. [Button](/docs/components/button))                                                         |
| `menu`                                                    | Popup-family **one** soft shadow — menus, popovers, selects, dialogs, sheets via `popupSurface` / `overlayShadow` |

```tsx
import { colors, finish } from "@shadcn-nsh/theme";

// control
style={{ backgroundColor: colors.secondary, boxShadow: finish.raised.boxShadow }}

// overlay (prefer shared helpers in ui)
boxShadow: finish.menu.boxShadow
```

## Motion

```tsx
import { duration, easing, pressSink } from "@shadcn-nsh/theme";

const sink = pressSink(0.97, "background-color, border-color, box-shadow, opacity");
// style={sink.transition}  activeStyle={sink.activeStyle}
// duration.press === 150, easing.press === "ease-out"; honors reduceMotion()
```

Enter/exit overlay choreography is **not** part of this theme layer yet.

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
- `finish.*` / `pressSink` / `duration` / `easing` — finish + motion (above)

Changing brand colors still means editing **`theme.json`**. Changing control/overlay depth means editing **`finishes.json`**.

## Gallery vs docs

Native verification of theme + components: `apps/gallery`. Docs pages may show optional web demos; they are sketches, not the token authority.

## Behavior & elements

Control behavior and a11y stay on [nsh.dev/elements](https://nsh.dev/elements). Theme here only brands the styled layer.
