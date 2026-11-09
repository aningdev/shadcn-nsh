# Theme finish and motion (three-layer model)

`@shadcn-nsh/theme` brands the styled / copy-into-app layer. We decided to organize surface depth and short press motion as an **application theme** concern—not NSH design tokens, and not shadcn’s default scaffold.

Three layers:

1. **Colors** — [`theme.json`](../../packages/theme/theme.json) via NSH `cssVars` / `token()` (`colors.*`, `radius`). No shadow keys.
2. **Finish** — [`finishes.json`](../../packages/theme/finishes.json) → `finish.*`. Semantic surface depth (control states + overlay `menu`), light/dark tables, **boxShadow only**; fills stay on `colors.*`.
3. **Motion** — `pressSink` / `pressTransition` / `duration` / `easing` in [`theme.ts`](../../packages/theme/theme.ts). Default press: 150ms ease-out, scale 0.97, honors `reduceMotion()`.

Control finishes (`raised` / `hover` / `pressed` / `on` / `accent` / `card`) and overlay elevation (`menu`, one soft shadow for the popup family) stay separate, matching NSH Design Guides. Research: [`docs/research/theme-elevation-motion.md`](../research/theme-elevation-motion.md).

## Considered Options

- Put `--shadow-*` into `theme.json` cssVars — rejected; NSH treats shadows as non-tokens (Gallery theme.ts).
- MUI `shadows[0..24]` or MD3 elevation levels as the public API — rejected; wrong press model and poor fit for inset control finishes.
- Keep shadows only in component files (stock shadcn) — rejected for NSH: no CVA/className distribution; we need a reusable theme helper layer.
- Copy Gallery’s full ~20 finish keys up front — rejected; add keys when a component consumes them.

## Consequences

- Registry `theme` ships `theme.json` + `finishes.json` + `lib/theme.ts`.
- Button is the control-finish + `pressSink` paradigm; `popupSurface` / overlay chrome consume `finish.menu`.
- Docs must say finish/motion are **this package’s increment**, not shadcn default theming.
- Android `elevation` / iOS `glassEffect` remain documented future adapters, not dual theme APIs in this phase.
- Enter/exit overlay choreography (tw-animate analogue) is a later phase.
