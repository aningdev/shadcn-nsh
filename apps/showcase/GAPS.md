# Gaps the showcase found

Rebuilding the official Gallery with this library (#78) is a test of what the library can do. Where
a scene needed something the library lacks, the demo uses `nsh/base` (or a local workaround) and
the gap is listed here with its issue. When an issue closes, its workaround in `demos/` goes too,
and its row leaves this file.

## Library

| Issue                                                   | Gap                                                                          | Scenes that work around it |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| [#87](https://github.com/aningdev/shadcn-nsh/issues/87) | On macOS a click on the combobox field focuses it and does not open the list | Combobox                   |

Not gaps: Stocks' intraday chart washes the area under the price with `Plot`'s own `Area` mark where upstream hatches the rest of the day, since `Plot` draws declared marks and takes no free drawing over its geometry; the Button scene plays no sounds (the library has none), its hold-to-confirm `FillButton` stays scene-local on a `View` with `role="button"` (base `Button` has no `onLongPress`), and its tooltips are the library's `Tooltip`; the iOS segmented control is a platform look;
`Segmented` / `Button` / `Badge` take children where upstream takes `options` / `label` (shadcn's
composition). Upstream's funnel animates drawn `Canvas` geometry with `createAnimatedValue`, which
`nsh/base` doesn't drive; the necks redraw without an entrance. Editor gutters use the `warn` / `up`
/ `destructive` roles, and a terminal's ANSI colors are the program's output, not theme roles. The
find bar is the library's `EditorFindBar`; quick-fix menus and the editor zoom are `nsh`
`Overlay`s, the code-action menu is the native `nsh/desktop` `Menu`, and Chat's empty-state emblem (`apps-shared` `IconTile`) is its own kit (item rows use `ItemMedia`). Animations' ink on a saturated tone is `onBrand` / `knob`, and System's
status-bar preview inks with the foreground and background, all theme roles. The Gallery's `Meter`,
`Toggle` (a switch) and `Field` are this library's `Progress`, `Switch` and a labelled `Input`. The
block editor imports its editor commands (`setNode`, `wrapIn`, `suggestion`, …) from `nsh/base`,
where they live, and its link menu is local, as upstream's `RichEditorLink` is a Gallery demo file.
Canvas draws its gauges, ridgeline, dot matrix and sketch with `nsh`'s `Canvas`, as upstream (`Plot`
is for series marks), a WGSL tint stays a shader constant, and Photos' ⌘R binding is the app's
keymap beside a `Kbd`.

## Showcase shell

Owned by `App.tsx` / `kit.tsx`, not the library:

- The shell hosts each demo in a `flex: 1` view, as upstream; DataTable, DiffView, Editor,
  RichEditor, Block editor, Terminal, Dock and Resizable skip `DemoPage` to fill it. Only split view is
  `fill: true` upstream, which hides the phone's header; the shell does not do that yet.
- A page section (heading above a padded surface, with a right slot) is redrawn per batch
  (`data-shared` `ChartCard`, `graphics-shared` `SceneCard`); `DemoCard` lacks that
  slot; `Caption` lacks a label + note form (`desktop-shared` `CaptionLine`).
- `DemoPage` has no multi-column layout (`graphics-shared` `ScenePage` + `columnsFor`, after `gallery/ui.tsx:122`).
- A demo cannot push onto the shell's stack, so Shader's iris pages play in a `NavStack` of their own.
- `DemoPage` takes no scroll props, so Scroll's "taps with the keyboard up" scene sets
  `keyboardShouldPersistTaps` on an inner `Scroll`.
- The Gallery's "Last event" card and its kit parts (page header, section, appear,
  action) are rebuilt per demo rather than shared.
