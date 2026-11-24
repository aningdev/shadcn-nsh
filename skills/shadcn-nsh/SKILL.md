---
name: shadcn-nsh
description: Build Native Shell (NSH) interfaces with shadcn-nsh, a copy-into-app component library whose styled components live in the project at components/ui and whose colours and geometry come from theme roles. Use when a project has nsh-ui.json or imports from @/components/ui, when the user mentions shadcn-nsh or its components, themes or registry, or when building or changing a screen, row, form or overlay in an NSH app that uses these components.
---

# Build with shadcn-nsh

shadcn-nsh is styled UI for [Native Shell](https://nsh.dev): components are copied into the app as files it owns, not imported from a package.
Behaviour and accessibility come from `nsh/base`; the look comes from theme roles; each file at `components/ui/<id>.tsx` is both.
`nsh-ui.json` records the theme the app was initialised with.

## Read first

The installed copy is the truth, not the repo or an older tutorial:

- `components/ui/<id>.tsx` — the parts, their props, and the `*Look` functions that draw them. Read the file you are about to use before using it.
- `lib/ui/theme.ts` — every colour, finish, radius, font and control size the components read.
- `nsh-ui.json` — the theme the app builds with; `themes/<name>/` — themes installed for runtime switching.
- Online: [llms.txt](https://shadcn-nsh.aning.dev/llms.txt) indexes the docs, [llms-full.txt](https://shadcn-nsh.aning.dev/llms-full.txt) has them whole, `https://shadcn-nsh.aning.dev/docs/components/<id>` is one component.

## Pick your path

| You need                                           | Read                                                           |
| -------------------------------------------------- | -------------------------------------------------------------- |
| A screen, form, row or overlay from our parts      | [references/build-interface.md](references/build-interface.md) |
| To add a component, or change one after `add`      | [references/own-a-component.md](references/own-a-component.md) |
| Colours, radii, finishes, a theme or switching     | [references/theming.md](references/theming.md)                 |
| To prove the screen compiles, runs and looks right | [references/verify.md](references/verify.md)                   |

## Rules for every path

- Import components by file: `import { Button } from "@/components/ui/button"`, theme roles from `@/lib/ui/theme`, icons from `@/lib/ui/icons`.
- Add a missing component with the CLI (`npx shadcn-nsh@latest add <id>`); do not copy one from the repo or another app.
- Take colours only from theme roles (`colors.*`, `finish.*`, `toneColor`). A colour literal in a component is a bug.
- Take sizes from `control()`, `controlHeight`, `iconSize` and `rounded()`; do not hardcode points.
- Read the control's own file for prop names. They follow shadcn/ui where it has an equivalent, but NSH props differ (`onChange({ value })`, `onPress`, `accessibilityLabel`).
- Put layout in `style` (or `class`) on `View` — `padding`, `gap`, `flex`, `width` — not as direct props; components take `style` last, over their look.
- Call `mount(App)` once per app. Use `signal` for state that changes.
- A label is not associated with its control in NSH: give the control the same words in `accessibilityLabel` as the `FieldLabel` shows.

## When you're done

Run `nsh check` in the app; then `nsh run` and look at the screen. [references/verify.md](references/verify.md) lists what to look at.
