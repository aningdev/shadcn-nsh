# Gaps the showcase found

Rebuilding the official Gallery with this library (#78) is a test of what the library can do. Where
a scene needed something the library lacks, the demo uses `nsh/base` (or a local workaround) and
the gap is listed here with its issue. When an issue closes, its workaround in `demos/` goes too,
and its row leaves this file.

## Library

| Issue                                                     | Gap                                                                                               | Scenes that work around it                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [#83](https://github.com/aningdev/shadcn-nsh/issues/83)   | A `Button`'s text beside an icon is not drawn (`AsText`)                                          | Toast, Popover, HoverCard, Avatar                           |
| [#84](https://github.com/aningdev/shadcn-nsh/issues/84)   | Triggers wrap their child instead of making it the trigger                                        | Popover, HoverCard, Menu, Tooltip, Toolbar                  |
| [#85](https://github.com/aningdev/shadcn-nsh/issues/85)   | No `toast()` API (raise, update, dismiss, stack)                                                  | Toast                                                       |
| [#86](https://github.com/aningdev/shadcn-nsh/issues/86)   | No `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`                                               | Avatar                                                      |
| [#87](https://github.com/aningdev/shadcn-nsh/issues/87)   | Combobox: no single-value mode; field press doesn't open; chips outside the root                  | Combobox                                                    |
| [#88](https://github.com/aningdev/shadcn-nsh/issues/88)   | Select: a narrow trigger overflows; listbox placement                                             | Select                                                      |
| [#89](https://github.com/aningdev/shadcn-nsh/issues/89)   | `sliderFill` ignores from/to; no value on a vertical slider                                       | Slider                                                      |
| [#90](https://github.com/aningdev/shadcn-nsh/issues/90)   | No SplitView component                                                                            | Split view                                                  |
| [#91](https://github.com/aningdev/shadcn-nsh/issues/91)   | NavPage loses Back with a custom header; DialogContent always a card; no `AlertDialog.show()`     | Nav stack, Sheet                                            |
| [#92](https://github.com/aningdev/shadcn-nsh/issues/92)   | Menu (MenuButton, sub-trigger icon), Sheet grabber, Accordion chevron / disabled, Tree row height | Menu, Sheet, Accordion, Collapsible, Tree                   |
| [#93](https://github.com/aningdev/shadcn-nsh/issues/93)   | Parts without `testID` / label; ColorPanel outside its root; `choiceTileLook` placement           | Date picker, Emoji picker, Combobox, Color picker, Checkbox |
| [#94](https://github.com/aningdev/shadcn-nsh/issues/94)   | No theme role for ink over photos                                                                 | Carousel (`#ffffff`)                                        |
| [#95](https://github.com/aningdev/shadcn-nsh/issues/95)   | Input motion: shake, autogrow, rolling digits                                                     | Input, OTP input, Number input                              |
| [#97](https://github.com/aningdev/shadcn-nsh/issues/97)   | A disabled ToggleGroup / Toolbar leaves its children pressable                                    | Toggle, Toolbar                                             |
| [#98](https://github.com/aningdev/shadcn-nsh/issues/98)   | Command's `searchPrefix` on its own line, placeholder unreadable                                  | Command                                                     |
| [#99](https://github.com/aningdev/shadcn-nsh/issues/99)   | Toggle size table not exported; no ghost outdent                                                  | Toolbar, Link                                               |
| [#101](https://github.com/aningdev/shadcn-nsh/issues/101) | Chart colors and their label ink run opposite ways                                                | Plot (Allocation tints its tiles)                           |
| [#102](https://github.com/aningdev/shadcn-nsh/issues/102) | `Stat` has no unit or note (upstream's `Figure`)                                                  | Plot                                                        |

Not gaps: the iOS segmented control is a platform look; a Progress with step dots is app layout;
`Segmented` / `Button` / `Badge` take children where upstream takes `options` / `label` (shadcn's
composition). Upstream's funnel animates drawn `Canvas` geometry with `createAnimatedValue`, which
`nsh/base` doesn't drive; the necks redraw without an entrance.

## Showcase shell

Owned by `App.tsx` / `kit.tsx`, not the library:

- Demos that fill the page (`fill: true` upstream): message bar, split view, dock; DataTable and
  DiffView skip `DemoPage` to fill the screen.
- A page section (heading above a padded surface, with a right slot) is redrawn per batch
  (`actions-shared` `Card`, `data-shared` `ChartCard`); `DemoCard` lacks that slot; `Caption` lacks a label + note form.
- The Gallery's "Last event" card and its kit parts (page header, section, icon tile, appear,
  action) are rebuilt per demo rather than shared.
