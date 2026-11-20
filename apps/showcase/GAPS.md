# Gaps the showcase found

Rebuilding the official Gallery with this library (#78) is a test of what the library can do. Where
a scene needed something the library lacks, the demo uses `nsh/base` (or a local workaround) and
the gap is listed here with its issue. When an issue closes, its workaround in `demos/` goes too,
and its row leaves this file.

## Library

| Issue                                                     | Gap                                                                                               | Scenes that work around it                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [#83](https://github.com/aningdev/shadcn-nsh/issues/83)   | A `Button`'s text beside an icon is not drawn (`AsText`)                                          | Toast, Popover, HoverCard, Avatar, TextView, Dock, Stocks, Animations     |
| [#84](https://github.com/aningdev/shadcn-nsh/issues/84)   | Triggers wrap their child instead of making it the trigger                                        | Popover, HoverCard, Menu, Tooltip, Toolbar                                |
| [#85](https://github.com/aningdev/shadcn-nsh/issues/85)   | No `toast()` API (raise, update, dismiss, stack)                                                  | Toast                                                                     |
| [#86](https://github.com/aningdev/shadcn-nsh/issues/86)   | No `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`                                               | Avatar                                                                    |
| [#87](https://github.com/aningdev/shadcn-nsh/issues/87)   | Combobox: no single-value mode; field press doesn't open; chips outside the root                  | Combobox                                                                  |
| [#88](https://github.com/aningdev/shadcn-nsh/issues/88)   | Select: a narrow trigger overflows; listbox placement                                             | Select                                                                    |
| [#89](https://github.com/aningdev/shadcn-nsh/issues/89)   | `sliderFill` ignores from/to; no value on a vertical slider                                       | Slider                                                                    |
| [#91](https://github.com/aningdev/shadcn-nsh/issues/91)   | NavPage loses Back with a custom header; DialogContent always a card; no `AlertDialog.show()`     | Nav stack, Sheet, TextView (image viewer)                                 |
| [#92](https://github.com/aningdev/shadcn-nsh/issues/92)   | Menu (MenuButton, sub-trigger icon), Sheet grabber, Accordion chevron / disabled, Tree row height | Menu, Sheet, Accordion, Collapsible, Tree                                 |
| [#93](https://github.com/aningdev/shadcn-nsh/issues/93)   | Parts without `testID` / label; ColorPanel outside its root; `choiceTileLook` placement           | Date picker, Emoji picker, Combobox, Color picker, Checkbox               |
| [#94](https://github.com/aningdev/shadcn-nsh/issues/94)   | No theme role for ink over photos                                                                 | Carousel (`#ffffff`), TextView (image viewer), Animations (ink on a tone) |
| [#95](https://github.com/aningdev/shadcn-nsh/issues/95)   | Input motion: shake, autogrow, rolling digits                                                     | Input, OTP input, Number input                                            |
| [#97](https://github.com/aningdev/shadcn-nsh/issues/97)   | A disabled ToggleGroup / Toolbar leaves its children pressable                                    | Toggle, Toolbar                                                           |
| [#98](https://github.com/aningdev/shadcn-nsh/issues/98)   | Command's `searchPrefix` on its own line, placeholder unreadable                                  | Command                                                                   |
| [#99](https://github.com/aningdev/shadcn-nsh/issues/99)   | Toggle size table not exported; no ghost outdent                                                  | Toolbar, Link                                                             |
| [#101](https://github.com/aningdev/shadcn-nsh/issues/101) | Chart colors and their label ink run opposite ways                                                | Plot (Allocation tints its tiles)                                         |
| [#102](https://github.com/aningdev/shadcn-nsh/issues/102) | `Stat` has no unit or note (upstream's `Figure`)                                                  | Plot                                                                      |
| [#116](https://github.com/aningdev/shadcn-nsh/issues/116) | `MessageScroller`: no viewport `alignment`; scroll button has no dot or size                      | AI Chat                                                                   |
| [#117](https://github.com/aningdev/shadcn-nsh/issues/117) | `Plot` has no overlay hook (hatch with the plot's geometry)                                       | Stocks (washes instead of hatching)                                       |
| [#118](https://github.com/aningdev/shadcn-nsh/issues/118) | `DialogContent` has no max height or scrolling body                                               | Stocks (ticket kept short)                                                |
| [#119](https://github.com/aningdev/shadcn-nsh/issues/119) | `Attachment` has no built-in remove affordance                                                    | AI Chat (`AttachmentAction` pill)                                         |
| [#120](https://github.com/aningdev/shadcn-nsh/issues/120) | `Badge` has no size                                                                               | AI Chat (tool card state)                                                 |
| [#122](https://github.com/aningdev/shadcn-nsh/issues/122) | `Pressable`: no press `scale`; no `accessibilityHint`                                             | Gestures (hit slop, accessibility rows)                                   |
| [#123](https://github.com/aningdev/shadcn-nsh/issues/123) | `Card` has no flush form for edge-to-edge content                                                 | Animations (Aurora inset)                                                 |
| [#106](https://github.com/aningdev/shadcn-nsh/issues/106) | CodeEditor / DockArea types not exported; `groupClass` can't replace the background               | Editor, Dock                                                              |
| [#107](https://github.com/aningdev/shadcn-nsh/issues/107) | No 32 pt icon size; no bare ghost for a close × or Hide                                           | RichEditor, Dock                                                          |

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
