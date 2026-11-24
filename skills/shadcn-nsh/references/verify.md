# Verify

## The two commands

```sh
nsh check .        # type-check the app against the NSH host types; exits 0 or prints errors
nsh run            # build and run the app; the screen appears in the window
nsh test           # headless behaviour tests, if the app has any
```

Run `nsh check` after every change; it catches a prop that does not exist, a part imported from the wrong file, a theme role misspelled. Then run the app and look.

## What to look at

| Check                | Passes when                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Layout               | Nothing clipped or overlapping; the screen survives a narrow window (resize down to ~360 points)      |
| Text                 | Long labels truncate or wrap where intended; no row jumps when a description is absent                |
| States               | Hover, focus (Tab), press and disabled each look different and none disappears                        |
| Appearance           | Light and dark both read; switch the system appearance and check the screen again                     |
| Theme switch         | With a second theme installed, `selectTheme` redraws every surface, edge and accent — no stale colour |
| Accessibility        | Every icon-only control has an `accessibilityLabel`; every `FieldLabel` has its words on the control  |
| Composition          | One `mount()`; state lives in the `Root`; no `View` re-implements a family's look                     |
| Colours and geometry | No hex/oklch/rgb literal, no hardcoded radius or control height                                       |

## When something fails

- **Unknown prop or part** — read the installed `components/ui/<id>.tsx`; the prop may be named differently (`onChange({ value })`, `onPress`), or the part may live in another file.
- **Missing module** — `npx shadcn-nsh@latest add <id>` (and `add theme-<name>` for a theme import).
- **Colour does not change with the theme** — it was written as a literal or read once outside JSX; use a `colors.*`/`finish.*` getter in render.
- **Text borrows the wrong style** — set only the facets you mean (`font.size`, `font.weight`) rather than a whole style object.
- **The screen is blank** — `mount()` missing, called twice, or called on a component that throws; check the terminal output of `nsh run`.
