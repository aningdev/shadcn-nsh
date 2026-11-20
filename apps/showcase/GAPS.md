# Gaps the showcase found

Rebuilding the official Gallery with this library (#78) is a test of what the library can do. Where
a scene needed something the library lacks, the demo uses `nsh/base` (or a local workaround) and
the gap is listed here with its issue. When an issue closes, its workaround in `demos/` goes too,
and its row leaves this file.

## Library

| Issue                                                     | Gap                                                                             | Scenes that work around it                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [#87](https://github.com/aningdev/shadcn-nsh/issues/87)   | On macOS a click on the combobox field focuses it and does not open the list    | Combobox                                                         |
| [#117](https://github.com/aningdev/shadcn-nsh/issues/117) | `Plot` has no overlay hook (hatch with the plot's geometry)                     | Stocks (washes instead of hatching)                              |
| [#122](https://github.com/aningdev/shadcn-nsh/issues/122) | `nsh/base`'s Button takes no `accessibilityHint`, so no pressable can carry one | Gestures (accessibility rows draw a `View` with `role="button"`) |
| [#149](https://github.com/aningdev/shadcn-nsh/issues/149) | No public helper turns a lucide icon into an image for a native menu            | System (context menu rebuilds the Gallery's `lucideSvg`)         |

Not gaps: the iOS segmented control is a platform look; a Progress with step dots is app layout;
`Segmented` / `Button` / `Badge` take children where upstream takes `options` / `label` (shadcn's
composition). Upstream's funnel animates drawn `Canvas` geometry with `createAnimatedValue`, which
`nsh/base` doesn't drive; the necks redraw without an entrance. Editor gutters use the `warn` / `up` /
`destructive` roles, and a terminal's ANSI colors are the program's output, not theme roles. Find
bars, quick-fix menus and the editor zoom are `nsh` `Overlay`s, the code-action menu is the native
`nsh/desktop` `Menu`, and the Gallery's `IconTile` is its own kit, as upstream. Animations' ink on a
saturated tone is `onBrand` / `knob`, the TextView lightbox sits on the page's background, and System's
status-bar preview inks with the foreground and background, all theme roles. The Gallery's `Meter`,
`Toggle` (a switch) and `Field` are this library's `Progress`, `Switch` and a labelled `Input`. The block
editor imports its editor commands (`setNode`, `wrapIn`, `suggestion`, …) from `nsh/base`, where they
live, and its link menu is local, as upstream's `RichEditorLink` is a Gallery demo file.

## Showcase shell

Owned by `App.tsx` / `kit.tsx`, not the library:

- The shell hosts each demo in a `flex: 1` view, as upstream; DataTable, DiffView, Editor,
  RichEditor, Block editor, Terminal, Dock and Resizable skip `DemoPage` to fill it. Only split view is
  `fill: true` upstream, which hides the phone's header; the shell does not do that yet.
- A page section (heading above a padded surface, with a right slot) is redrawn per batch
  (`actions-shared` `Card`, `data-shared` `ChartCard`, `desktop-shared` `DeskCard`); `DemoCard` lacks that
  slot; `Caption` lacks a label + note form (`desktop-shared` `CaptionLine`).
- `DemoPage` takes no scroll props, so Scroll's "taps with the keyboard up" scene sets
  `keyboardShouldPersistTaps` on an inner `Scroll`.
- The Gallery's "Last event" card and its kit parts (page header, section, icon tile, appear,
  action) are rebuilt per demo rather than shared.
