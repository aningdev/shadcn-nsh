# @shadcn-nsh/theme

[中文](./README.zh.md)

Design-token and surface helpers for shadcn-nsh. Three layers (see [`docs/adr/0002-theme-finish-and-motion.md`](../../docs/adr/0002-theme-finish-and-motion.md)):

1. **`theme.json`** — color / radius truth (NSH `cssVars` via `nsh.json` `theme`)
2. **`finishes.json`** — light/dark semantic surface depth (`finish.*`); not cssVars tokens
3. **`theme.ts`** — `token()` helpers: `colors`, `radius`, `finish`, `pressSink`, `duration`, `easing`, …

### Finish roles

| Role                                                      | Use                                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `raised` / `hover` / `pressed` / `on` / `accent` / `card` | Control surfaces (e.g. Button)                                          |
| `menu`                                                    | Popup-family **one** soft shadow (menu, popover, select, dialog, sheet) |

Fills always come from `colors.*`; finishes supply `boxShadow` (depth only).

### Motion

`pressSink(0.97)` + `duration.press` (150ms) / `easing.press` — NSH Design Guides press example; honors `reduceMotion()`.

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as registry `theme` (`theme.json` + `lib/finishes.json` + `lib/theme.ts`). After edits: `bun run registry:build` from the repo root and commit `public/r`.
