# Gaps the showcase found

Rebuilding the official Gallery with this library (#78) is a test of what the library can do. Where
a scene needed something the library lacks, the demo uses `nsh/base` (or a local workaround) and
the gap is listed here with its issue. When an issue closes, its workaround in `demos/` goes too,
and its row leaves this file.

## Library

| Issue                                                     | Gap                                                                                     | Scenes that work around it                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [#83](https://github.com/aningdev/shadcn-nsh/issues/83)   | A `Button`'s text beside an icon is not drawn (`AsText`)                                | Toast, Popover, HoverCard, Avatar, TextView, Dock, Stocks, Animations     |
| [#84](https://github.com/aningdev/shadcn-nsh/issues/84)   | Triggers wrap their child instead of making it the trigger                              | Popover, HoverCard, Menu, Tooltip, Toolbar                                |
| [#85](https://github.com/aningdev/shadcn-nsh/issues/85)   | No `toast()` API (raise, update, dismiss, stack)                                        | Toast                                                                     |
| [#87](https://github.com/aningdev/shadcn-nsh/issues/87)   | On macOS a click on the combobox field focuses it and does not open the list            | Combobox                                                                  |
| [#93](https://github.com/aningdev/shadcn-nsh/issues/93)   | Parts without `testID` / label; ColorPanel outside its root; `choiceTileLook` placement | Date picker, Emoji picker, Combobox, Color picker, Checkbox               |
| [#94](https://github.com/aningdev/shadcn-nsh/issues/94)   | No theme role for ink over photos                                                       | Carousel (`#ffffff`), TextView (image viewer), Animations (ink on a tone) |
| [#95](https://github.com/aningdev/shadcn-nsh/issues/95)   | Input motion: shake, autogrow, rolling digits                                           | Input, OTP input, Number input                                            |
| [#101](https://github.com/aningdev/shadcn-nsh/issues/101) | Chart colors and their label ink run opposite ways                                      | Plot (Allocation tints its tiles)                                         |
| [#117](https://github.com/aningdev/shadcn-nsh/issues/117) | `Plot` has no overlay hook (hatch with the plot's geometry)                             | Stocks (washes instead of hatching)                                       |
| [#122](https://github.com/aningdev/shadcn-nsh/issues/122) | `nsh/base`'s Button takes no `accessibilityHint`, so no pressable can carry one         | Gestures (accessibility rows draw a `View` with `role="button"`)          |

Not gaps: the iOS segmented control is a platform look; a Progress with step dots is app layout;
`Segmented` / `Button` / `Badge` take children where upstream takes `options` / `label` (shadcn's
composition). Upstream's funnel animates drawn `Canvas` geometry with `createAnimatedValue`, which
`nsh/base` doesn't drive; the necks redraw without an entrance. Editor gutters use the `warn` / `up` /
`destructive` roles, and a terminal's ANSI colors are the program's output, not theme roles. Find
bars, quick-fix menus and the editor zoom are `nsh` `Overlay`s, the code-action menu is the native
`nsh/desktop` `Menu`, and the Gallery's `IconTile` is its own kit, as upstream.

## Showcase shell

Owned by `App.tsx` / `kit.tsx`, not the library:

- The shell hosts each demo in a `flex: 1` view, as upstream; DataTable, DiffView, Editor,
  RichEditor, Terminal, Dock and Resizable skip `DemoPage` to fill it. Only split view is
  `fill: true` upstream, which hides the phone's header; the shell does not do that yet.
- A page section (heading above a padded surface, with a right slot) is redrawn per batch
  (`actions-shared` `Card`, `data-shared` `ChartCard`); `DemoCard` lacks that slot; `Caption` lacks a label + note form.
- The Gallery's "Last event" card and its kit parts (page header, section, icon tile, appear,
  action) are rebuilt per demo rather than shared.
