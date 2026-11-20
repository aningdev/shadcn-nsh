# Gaps the showcase found

Rebuilding the official Gallery with this library (#78) is a test of what the library can do. Where
a scene needed something the library lacks, the demo uses `nsh/base` (or a local workaround) and
the gap is listed here with its issue. When an issue closes, its workaround in `demos/` goes too,
and its row leaves this file.

## Library

| Issue                                                   | Gap                                                                                               | Scenes that work around it                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [#83](https://github.com/aningdev/shadcn-nsh/issues/83) | A `Button`'s text beside an icon is not drawn (`AsText`)                                          | Toast, Popover, HoverCard, Avatar                           |
| [#84](https://github.com/aningdev/shadcn-nsh/issues/84) | Triggers wrap their child instead of making it the trigger                                        | Popover, HoverCard, Menu, Tooltip                           |
| [#85](https://github.com/aningdev/shadcn-nsh/issues/85) | No `toast()` API (raise, update, dismiss, stack)                                                  | Toast                                                       |
| [#86](https://github.com/aningdev/shadcn-nsh/issues/86) | No `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`                                               | Avatar                                                      |
| [#87](https://github.com/aningdev/shadcn-nsh/issues/87) | Combobox: no single-value mode; field press doesn't open; chips outside the root                  | Combobox                                                    |
| [#88](https://github.com/aningdev/shadcn-nsh/issues/88) | Select: a narrow trigger overflows; listbox placement                                             | Select                                                      |
| [#89](https://github.com/aningdev/shadcn-nsh/issues/89) | `sliderFill` ignores from/to; no value on a vertical slider                                       | Slider                                                      |
| [#90](https://github.com/aningdev/shadcn-nsh/issues/90) | No SplitView component                                                                            | Split view                                                  |
| [#91](https://github.com/aningdev/shadcn-nsh/issues/91) | NavPage loses Back with a custom header; DialogContent always a card; no `AlertDialog.show()`     | Nav stack, Sheet                                            |
| [#92](https://github.com/aningdev/shadcn-nsh/issues/92) | Menu (MenuButton, sub-trigger icon), Sheet grabber, Accordion chevron / disabled, Tree row height | Menu, Sheet, Accordion, Collapsible, Tree                   |
| [#93](https://github.com/aningdev/shadcn-nsh/issues/93) | Parts without `testID` / label; ColorPanel outside its root; `choiceTileLook` placement           | Date picker, Emoji picker, Combobox, Color picker, Checkbox |
| [#94](https://github.com/aningdev/shadcn-nsh/issues/94) | No theme role for ink over photos                                                                 | Carousel (`#ffffff`)                                        |
| [#95](https://github.com/aningdev/shadcn-nsh/issues/95) | Input motion: shake, autogrow, rolling digits                                                     | Input, OTP input, Number input                              |

Not gaps: the iOS segmented control is a platform look; a Progress with step dots is app layout.

## Showcase shell

Owned by `App.tsx` / `kit.tsx`, not the library:

- Demos that fill the page (`fill: true` upstream): message bar, split view, dock.
- `DemoCard` lacks a header action slot; `Caption` lacks a label + note form.
- The Gallery's "Last event" card and its kit parts (page header, section, icon tile, appear,
  action) are rebuilt per demo rather than shared.
