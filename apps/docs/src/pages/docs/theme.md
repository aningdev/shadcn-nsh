---
layout: ../../layouts/Docs.astro
title: Theme
description: theme.json is the token source of truth; token() and @shadcn-nsh/theme helpers read it.
---

Token truth for shadcn-nsh is **`theme.json`** (wired through `nsh.json` `theme`), not CSS variables you invent in the docs site. Styled wrappers read tokens via `token()` / `@shadcn-nsh/theme` helpers (`colors`, `radius`, `focusRing`).

## Install

```sh
shadcn-nsh add theme
# monorepo:
shadcn-nsh add theme -c apps/web
```

Registry item `theme` copies `theme.json` and a small `lib/theme.ts` into the consumer app / `packages/ui`.

## `theme.json`

Authoring copy lives at `packages/theme/theme.json`. Shape:

- `cssVars.theme` — shared tokens (e.g. `radius`)
- `cssVars.light` / `cssVars.dark` — semantic colors (`background`, `foreground`, `primary`, …)

NSH resolves these into runtime tokens. Prefer editing JSON over hard-coding hex in components.

## `token()` and helpers

```tsx
import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import { token } from "nsh";
// after copy-into-app, consumers typically import from their local theme module

const pad = radius.control;
const fg = colors.foreground;
const ring = focusRing();
// or: token("primary")
```

- `token(name)` — reactive read of a named token from the active theme
- `colors.*` / `radius.control` — thin getters over `token()` for common names
- `focusRing()` — shared keyboard focus outline style used by controls

`lib/theme.ts` is a helper only; changing look still means changing **`theme.json`**.

## Gallery vs docs

Native verification of theme + components: `apps/gallery`. Docs pages may show optional web demos; they are sketches, not the token authority.

## Behavior & elements

Control behavior and a11y stay on [nsh.dev/elements](https://nsh.dev/elements). Theme here only brands the styled layer.
