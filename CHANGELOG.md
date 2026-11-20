# Changelog

## Unreleased

### Added

- **Four docs pages show their parts at work (#158).** The `InputGroup` demo is a real search — typed
  into, settling 300 ms later with a spinner where the work is, the matches under the field — and a
  real composer: `Return` sends and `Shift-Return` breaks the line, the add-on turns to open an
  attach menu, and the send turns into a stop while a scripted reply streams;
  `### A search field` and `### A message composer` describe both. `Input` gains
  `### A password with a strength meter`: four segments, a word for the score, and the rules ticking.
  `MessageScroller` gains `### A chat` (an empty state with suggestion cards inside the frame),
  `### Older turns` (`onLoadMoreAtStart` from the list, the rows on screen keeping their place) and
  `### Selecting across turns` (`selectable` over the frame, one selection over the mounted rows).
  `EmojiPicker` gains `### In a composer` (a picker from an `InputGroup` add-on, the choice appended
  to the message and leading the recents) and `### Reactions` (chips with counts where yours is
  tinted, and a quick row that ends in the picker). No component API changes; each demo's reference
  draws the same scene.
- **`code-block` (#160).** Code, a command's output or a log in a block, after shadcn/ui's `CodeBlock`: `CodeBlock` (`variant` `default | destructive`, `size` `default | sm`), `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockActions`, `CodeBlockCopyButton` (a ghost `IconButton` that writes `value` to the clipboard and shows a check for two seconds, its `accessibilityLabel` "Copy" then "Copied"), `CodeBlockContent` (a string or lines; `lineNumbers`, `startLine`, `wrap`; sideways scroll without a bar), `CodeBlockLine` (`variant` `default | highlighted | added | removed`) and `CodeBlockFooter`. The code is plain mono: no tokenizer, so no highlighting. The showcase's AI Chat draws a code tool's result with it instead of by hand.
- **A component page can show its composition (#151).** Pages for a component built from several parts gain an optional `## Composition` between Usage and Examples: one line "Use the following composition to build a `Dialog`:" and one `text` fence with the part tree, as on shadcn/ui's pages. `check:pages` accepts the section only in that slot and fails on a name the component does not export; the page rules in `apps/website/AGENTS.md` and `docs/port.md` describe it. The pages whose parts nest now show their tree; single-part pages have none.
- **Style data in themes (#144).** `finishes.json` now states nine groups of style beside its finishes — `type`, `shape`, `size`, `stroke`, `focus`, `state`, `motion`, `icon`, `indicator` — named by role, the same keys in every theme. `density`, `controlSize`, `motion`, `cornerCurve` and `focusRing` keep their shapes and read the theme in use, so `selectTheme` redraws what reads them; `style()` and `reactive()` are exported from `@shadcn-nsh/theme`. `check:theme` holds the key sets, the enum whitelists and the `shape` corners equal to `theme.json`'s radii. Nothing changes on screen: the default theme's values are the numbers the code wrote.
- **A dialog fills the window as a page (`dialogPage`), and `NavPage`'s `header` takes a function of
  the page (#91).** `dialogPage()` is the look a dialog wears when the app owns the whole surface —
  a lightbox, an editor, a page a phone's system presents: no card, no edge, the theme's background,
  all of it spreadable as `DialogContent`'s `style`. `header={(page) => <MyBar page={page} />}` is
  handed the slot the drawn header reads — `back()`, which is `onBackPress` then the pop `popOnBack`
  allows, and `pages()` — so a header of the app's own answers Back the way the drawn one does,
  without `onBack` and the stack being threaded through the scene. It is a function because
  `nsh/base` mounts the header in the page's own header host, out of reach of what the page provides
  around its content: a bare element there cannot read the page it heads.
- **`MenuButton` is the platform's own menu (#92).** The system pull-down: `UIContextMenu` on iOS, a
  context menu with a pointer — the items as data, `variant` (default `ghost`) and `size` for a
  string child. shadcn has no counterpart (a web menu is always the app's own drawing). A string
  child is drawn, not a nested `Button`: on desktop `nsh/base` makes the button's own view the
  pressable, and a button inside it would swallow the press.
- **`treeRowHeight` is exported (#92).** A well is as tall as its rows — 28 points with a pointer,
  44 on a touch screen — so `height: 8 * treeRowHeight` plus the list's padding, instead of a copy
  of the number in the app.
- **`AvatarGroup`, `AvatarGroupCount` and `AvatarBadge` (#86).** A stacked row keeps `nsh/base`'s `limit` and overflow, overlapped with `-space-x-2`; the count is the overflow's text; a presence mark sits on the avatar's end-bottom corner. Pass the presence color; the avatar does not clip the mark.
- **`Stat` takes `unit` and `note`, and `StatGroup` lays several on one row (#102).** `unit` sits beside the value, smaller and muted; `note` is the line under it. A stat inside `StatGroup` shares the row unless it sets `width`. A hairline above a chart's figures is the group's class.
- **The message scroller pins a short conversation and marks an arrival (#116).** `MessageScrollerViewport` passes `alignment` through to the list (`"bottom"` holds a short thread at the bottom). `MessageScrollerButton` takes `variant` and `size` (still `secondary` and `sm` when omitted) and an `indicator` at its top-end corner; the arrow stays.
- **`CardContent` takes `flush` (#123).** It drops the side padding and pulls the body through the card's bottom padding, so a picture meets the rim and the card's radius clips it. The header stays padded. Off in the terminal.

- **`split-view`.** Columns of navigation stacks — a sidebar, a content column and the detail — with the column header and the sidebar button in the theme's look, over `nsh/base`'s `SplitView`.
- **`Progress` stands a limit with `marker` (#125).** `marker` is where a limit is, a percentage
  along the bar on `value`'s scale: a 2-point hairline in the page's ink, crossing the rail and
  standing past it, drawn over the bar (`progressMarker(value, height)` is its style). It is drawn
  on the bar's own frame, so the rail comes first in the bar's row and a label goes after it.

- **The site gains a showcase page (#78).** `/showcase` runs the new `apps/showcase` app — NSH's
  official Gallery shell and every one of its scenes rebuilt with this library's components, with the palette
  and appearance chosen live inside the app — full width, outside the docs menu; `bun run check`
  type-checks the app, `docs:demos` packages it.

- **`init` and `add` warn when `nsh.json`'s Tailwind colors shadow theme tokens (#54).** A color in
  `tailwind.colors` wins over the theme token of the same name for classes: with `"primary"` there,
  `bg-primary` is that color while `token("primary")` and a component drawing with the theme keep
  the theme's, so one control can show two colors for one name. The CLI now ends with one line
  naming the tokens it found and linking the docs section — a warning, never a failure.
- **`BubbleText` puts a paragraph on a bubble in its ink.** `BubbleContent` drew a string child in
  the bubble's type and ink, but anything else — a list of paragraphs, markdown rendered into
  text — had no way to read the variant: on the web the ink is inherited, NSH has none and the
  variant lives in a context a caller cannot read. `BubbleText` is a `Text` that reads it from the
  `Bubble` around it, and a string child of `BubbleContent` now draws through it (#33).
- **`MessageAvatar` takes children.** An icon or an `Avatar` draws in the round muted slot at the
  bottom of the row; without children, `name` and `src` work as before. (#32)
- **The message scroller takes commands.** `useMessageScroller()` returns
  `scrollToMessage(key, { align, animated })` — a turn's key, from the viewport's `keyExtractor` —
  `scrollToStart` and `scrollToEnd` (with `atStart` / `atEnd`); `MessageScrollerProvider` shares
  them with controls outside the frame; and `MessageScrollerViewport` forwards its `ListRef` (#31).
- **`IconButton` takes four sizes (#107).** `xs` is 20 points across with a pointer (32 on a touch
  screen), `sm` 24 (36), `default` 28 (40) and `lg` 32 (44) — shadcn's `icon-xs` … `icon-lg` on the
  compact scale, with a hit slop that keeps a touch target 44 points and an icon that grows with
  the square. `lg` is upstream's 32 pt tool square, for a rich text toolbar; `xs` a tab's close ×
  beside a document's name. `iconButtonSizes` is the table (`side`, `glyph`).
- **`Badge` takes a `size` (#120).** `sm` is 18 points tall (an 11 pt label, 6 of padding), for a
  chip beside a smaller row — a chat tool card's 32 pt tile; `default` stays 20. `badgeSizes` is
  the table.
- **`Pressable` takes `scale` (#122).** How far a press sinks it: 98% unless it says otherwise
  (`0.8` a dot that gives under a thumb, `1` a row that stays put), and `pressableLook({ scale })`
  takes it too.
- **`toggleSizes` is exported (#99).** The table a `Toggle`'s `size` reads — `side`, `icon`, `text`
  and `pad` — so a bar drawn by the app matches a tool's geometry instead of measuring its own.
- **`on-media` and `chart-foreground` (#94, #101).** White ink for text on a photograph, and dark ink for a light chart tile. A dark tile uses `on-media` through `data-dark` (the cell's own lightness, not the appearance). Both sit in the C layer, the same value in light and dark, in every theme.
- **`toast()`, `toast.update`, `toast.dismiss` and `<Toaster />` (#85).** The names follow sonner: `toast` returns an id, `toast.success` and the other types set `type`, the same id replaces a toast, and `dismiss()` with no id closes every one. `update` changes a toast where it is (a loading note becoming its result). `progress` is the bar sonner does not have. The queue is `nsh/base`'s `ToastManager`. No sounds.
- **A field shakes, a multiline field grows, and a figure rolls (#95).** `Input` and `OtpInput` take `reject`: a new number plays the theme's `shake` (500 ms, `play("shake")`). `Input`'s `grow` sizes a multiline field from its text, up to five lines, and a `style` height still wins. `Roll` (from `lib/motion`) rolls a figure on `motion.control`; the number field's own glyphs stay put, because the caret lives in them. Less motion plays none of the shake or the roll.
- **The Message page shows a reply arriving, failing and being rated (#159).** Three examples: a turn that streams behind `textViewCaretClass`, can be stopped (`Stopped` in the header) and resumed; a failed turn with `Waiting for a connection` under the sent message and a destructive `Alert` with `Retry`; and a footer of copy and rating `IconButton`s, with the copy check and pressed thumbs live in the demo.
- **The TextView page shows code-block actions, a fence of the app's and inline chips (#159).** `codeBlockActions` puts the built-in copy — and the app's own actions, through `onCodeBlockAction` — over each block; an extension with a `language` and `renderCustom` draws a `chart` fence as bars; inline `pattern` extensions draw task ids and pull requests as chips that keep the paragraph's line spacing.
- **The DataTable page shows pinned columns and a selection the app owns (#159).** Two fixed leading columns stay while the rest scroll sideways, and the demo's rows, cells or columns select through `selection` and `onSelectionChange` (with `onRowPress` / `onColumnPress` for the app's own ranges).

### Changed

- **Components read the theme's type roles (#154).** Font weight, and the font size wherever a role has the same size in both tiers, now come from `finishes.json`'s `type` through `font.size`, `font.weight`, `font.line` and `font.tracking` (exported from `@shadcn-nsh/theme`), so `selectTheme` restyles text on the next frame. `type.family` is written into `font-sans` when a theme is selected. Nothing changes on screen: the default `type.*.line` values are the line heights the components drew, and sizes with no matching role stay in code with a comment.
- **A `Button`'s label beside an icon is drawn (#83).** `AsText` draws every string or number
  among a control's children in the control's label type, leaving elements where they are, so
  `<Button><Icon icon={Upload} />Upload 3 photos</Button>` (and `SplitButtonSegment`, `Radio`, a
  trigger with a glyph) shows its label instead of swallowing it. One read of `children`, as before.
- **A trigger's element child is the trigger (#84).** `PopoverTrigger`, `HoverCardTrigger` and
  `MenuTrigger` hand a single element child to `nsh/base` as the trigger itself: no wrapper view,
  so its look, `testID`, accessible name, own press, hover and focus styles stay, and the open
  state lands on it (`expandedStyle`, `expanded:` classes). `variant`, `disabled` and `style` shape
  a string child; an element carries its own. There is no `render` / `asChild` prop because NSH
  merges the trigger into the element a slot holds. A tooltip on a trigger goes on that element
  (`tooltip={<TooltipContent>…</TooltipContent>}`), not on a `TooltipTrigger` around a trigger part.
- **Picker parts take the name and id a test or screen reader uses (#93).** `DatePickerTrigger`,
  `ComboboxTrigger`, `SelectTrigger` and `EmojiPanel` pass `testID` and `accessibilityLabel`
  through; `choiceTileLook` moves to `checkbox` (both the `Checkbox` and the `Radio` spread it);
  `ColorPanel` has to sit inside `nsh/base`'s `ColorPicker` — outside one its parts log that and
  take no input, so every example wraps it.

- **`IconButton`'s `lg` is 32 points with a pointer (44 on a touch screen), not 34 (#107).** It is
  the tool square upstream's rich text toolbar draws; `sm` and `default` are unchanged.
- **The code editor and the dock export the session an app drives them with (#106).** `@/components/ui/code-editor` re-exports the editor's ref, decoration, diagnostic, search and value types; `@/components/ui/dock-area` already re-exports the dock's. `DockArea`'s `groupClass` follows `flex-1 bg-inset`, so `groupClass="bg-card"` replaces the group fill without `groupStyle`.
- **Breaking:** **a combobox without `multiple` holds one value (#87).** As shadcn's combobox,
  leaving `multiple` out makes `value` / `defaultValue` the chosen item or `null`
  (`string | null`), and `onChange` receives `{ value: string | null }`; `multiple` keeps
  `string[]`. An empty string is not a value. **To migrate:** a single-choice combobox drops its
  array of one (`value={[id]}` → `value={id}`, `value[0]` → `value`); a several-choice one adds
  `multiple`.
- **Breaking:** **the rich editor is `rich-editor`, and its session comes from it (#105).** The
  component, demo and registry item were `editor`, next to `code-editor` — and the docs mixed the
  two up, the install line naming one and the page describing the other. `shadcn-nsh add
  rich-editor` installs it at `components/ui/rich-editor.tsx`, the page is
  `/docs/components/rich-editor`; `add editor` is unknown now, so run
  `shadcn-nsh add rich-editor` and point the import at the new file. The file also re-exports the
  session an app edits with — `createRichEditor`, `defineSchema`, `StarterKit`, `TableKit`,
  `defineExtension`, `richExtension`, `RichEditorPlugin`, `chain`, `first`, `command`, `undo`,
  `redo`, `extendMarkRange`, `insertContent` and its types — so `createRichEditor` and
  `StarterKit` no longer need a second import from `nsh/base`; an app that still takes them from
  `nsh/base` keeps working, it is the same functions.
- **`classes` merges part by part over the default (#105).** A `classes` object used to replace
  `richEditorClasses` whole, so naming one part dropped every other. `RichEditor` now merges it in:
  a part you leave out keeps the default's, `null` still drops it, and `nodes` / `marks` merge name
  by name, so `classes={{ nodes: { heading: "text-xl" } }}` overrides that node and keeps the
  default's others.
- **Command, Select and Combobox highlight in the brand tint again.** The highlighted row is lit in
  `brand-tint` with a `brand/30` edge, as NSH's official Gallery draws it, instead of the grey
  `accent` fill; the chosen row keeps its check.
- **The baseline moves to NSH v0.6.1.** Components are checked against that CLI's `nsh/base`; the
  patch brings its fixes (a resizable drag stops at the next panel's minimum, the data table's
  horizontal scroll bar stays between the fixed columns, lists, carousels and video) and changes
  nothing in the official Gallery's UI layer. Install it with
  `curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=v0.6.1 sh`.
- **Breaking:** **theme accessors are named after the tokens they read (#52).** A key is the camelCase of its token, with no alias left behind. `colors.mutedFill` is gone: the `muted` surface is `token("muted")`, so old code that still reads `colors.muted` fails to type-check instead of painting the surface. `Tone` `"danger"` is `"destructive"`. **To migrate:** run `shadcn-nsh diff`, `add --overwrite` `lib/theme.ts`, then rename in the app's own code (`colors.muted` → `colors.mutedForeground` first). The reader is the `theme` item: `shadcn-nsh add theme --overwrite` replaces `lib/theme.ts` and also `theme.json` and `lib/finishes.json`, so put a recolored palette back afterwards.

  | Old                      | New                             |
  | ------------------------ | ------------------------------- |
  | `colors.surface`         | `colors.card`                   |
  | `colors.fieldBorder`     | `colors.input`                  |
  | `colors.text`            | `colors.foreground`             |
  | `colors.muted`           | `colors.mutedForeground`        |
  | `colors.accent`          | `colors.brand`                  |
  | `colors.accentFill`      | `colors.brandFill`              |
  | `colors.onAccent`        | `colors.onBrand`                |
  | `colors.light`           | `colors.primary`                |
  | `colors.onLight`         | `colors.primaryForeground`      |
  | `colors.sidebarSelected` | `colors.sidebarAccent`          |
  | `colors.danger`          | `colors.destructive`            |
  | `colors.mutedFill`       | `token("muted")`                |
  | `tints.accent`           | `tints.brand`                   |
  | `tints.danger`           | `tints.destructive`             |
  | `chart.s1` … `chart.s5`  | `chart.chart1` … `chart.chart5` |
  | `Tone` `"danger"`        | `Tone` `"destructive"`          |

- **Breaking:** **`mono` is a function that follows the theme's `font-mono` (#53).** Write
  `fontFamily: mono()` where you wrote `fontFamily: mono`. The monospaced family was the literal
  `"monospace"`, beside a `font-mono` token no theme set, so code drawn through `mono` could not
  follow a theme while the `font-mono` class and code in a `Text` could. Every theme now states
  `cssVars.theme.font-mono` as `monospace` — NSH's generic family, the system's own, so no pixel
  moves — and `mono()` reads it: a theme, or an app, that names `font-mono` moves the class, code
  in a `Text` and `mono()` together. The theme docs gained
  [Override from nsh.json](https://shadcn-nsh.aning.dev/docs/theme#override-from-nshjson) and
  [Fonts](https://shadcn-nsh.aning.dev/docs/theme#fonts).
- **Breaking:** **the message scroller's viewport is a virtualized list.** The viewport was a
  `Scroll` over one `View`: every turn stayed mounted, however long the conversation, and the frame
  re-measured all of it on every layout. `MessageScrollerViewport` is now `nsh`'s `List`: it takes
  the turns as data (`each`), a child that renders one row, and a `keyExtractor`; only the rows near
  the screen exist, and the list keeps the end in view while the reader is there. Two parts go:
  `MessageScrollerContent` (the list is the content) and `MessageScrollerItem`'s `messageId` (a
  row's `keyExtractor` key is what `scrollToMessage` names). The viewport's `ref` hands you its
  `ListRef`. **To migrate:**
  `<MessageScrollerViewport><MessageScrollerContent>{turns().map((turn) => <MessageScrollerItem
  messageId={String(turn.id)}>…</MessageScrollerItem>)}</MessageScrollerContent></MessageScrollerViewport>`
  becomes `<MessageScrollerViewport each={turns()} keyExtractor={(turn) => String(turn.id)}>{(item)
  => <MessageScrollerItem>…{item().text}…</MessageScrollerItem>}</MessageScrollerViewport>` — read
  `item()` where the turn is used, since the row is recycled (#57).
- **Each theme has its own docs page (#44).** `/docs/themes` keeps the overview and links to one page per palette, and each of those pages has the same sections.
- **Trigger looks leave disabled to the trigger, and a menubar's open fill too (#40).**
  `pickerLook`, `navigationMenuTriggerLook` and `menubarTriggerLook` no longer take `disabled`: the
  dim is their `disabledStyle`, on the view's own `disabled` (`Picker` now passes it), and hover and
  press need no gating there. `menubarTriggerLook` no longer takes `open` either: its open fill is
  `expandedStyle`, the state `nsh/base`'s Menu sets on the trigger. Spread a look on a view no
  control disables or expands, and those states are yours to set. No pixel moves.
- **One radius, three tiers (#38).** A theme now states one base, `radius`: `radius-control` is
  0.8× it and `radius-card` is 1.4×, each rounded to whole points, and `check:theme` rejects a tier
  that is not. In the default theme controls go from 7 to 8 points and cards from 12 to 14, and a
  dialog takes the card tier (16 → 14); the shadcn theme's base goes from 8 to 10, its controls and
  cards staying 8 and 14. `radius-popover` is gone — a dialog uses `radius-card`, with no alias.
  Phone sheets and menu rows take their corners from the theme too, and every corner that reads a
  theme radius now has the continuous curve, applied in one place by `rounded()`.
- **Class radii follow the theme's `radius`, `radius-card` and `radius-control` (#53).** The
  `rounded-*` classes in the library's components name the theme's tiers
  (`rounded-(--radius-control)`, `rounded-(--radius)`, `rounded-(--radius-card)`) instead of
  Tailwind's fixed steps, so an app that changes a `radius*` token in its theme moves every corner,
  the class-rounded ones with the style-rounded ones. By default, the components that look
  different: a data table's and a tree's frame and a command palette's frame are rounder (8 or 12 →
  14), tree and command rows, pagination items and a tooltip's one-line bubble rounder by 2 (6 →
  8), a rich tooltip and the editor's code blocks 8 → 10, a dock's drop indicator 8 → 10 and its
  sheet's top corners 16 → 14, the desktop's emoji cells 6 → 8, and the desktop's number inputs and
  time fields and the option rows of select, combobox and date picker take the controls' 8 (7 → 8). `ui-guards` now fails the build on a fixed-scale
  `rounded-sm` … `rounded-3xl` in `packages/ui`.
- **The docs site is at https://shadcn-nsh.aning.dev.** It was at
  `https://aningdev.github.io/shadcn-nsh/`; the README and every docs link point at the new
  address.
- **Every control reads its children once, where it draws them (#55).** Each read of
  `props.children` builds the children again, so a control reads them once, in the JSX that draws
  them: a string child is wrapped in a `Text` right there, through `AsText` (`lib/as-text.tsx`),
  which `add` installs alongside the control. A string child is no longer copied into
  `accessibilityLabel` — screen readers read the text the control draws, and `accessibilityLabel`
  passes through untouched for the app that gives one. A trigger whose content draws it through a
  slot builds its element once in its own body and hands it to the host, so the children are not
  built again on every draw; a portal's content builder, which `nsh/base` makes only on opening,
  keeps its one read with a `children-lint:` comment saying why (`docs/ARCHITECTURE.md`). A child
  that reads a signal — its text, or which elements it holds — still updates where it is drawn
  (#67). A labelled button with an icon mounts in the same 26 ops as before (`nsh test --trace`).
  `bun run check:children` holds the one rule — at most one read of `props.children` per
  component — over every `.tsx` under `packages/ui` and `packages/ui/lib`, so a new control is
  checked without anyone adding it. Names, looks and props are unchanged.
- **Theme finishes, the narrow-window test, avatars, the calendar and the sidebar rail do less work per read (#56).** A finish string is resolved once per theme and appearance instead of on every read (about 5× cheaper), `narrowWindow` is one shared `computed`, an avatar hashes its name once, and a calendar day converts its date once instead of four times. The sidebar rail's hairline follows the pointer through `group-hover:` instead of a signal, so hovering it commits no frame; it now lights only while the pointer is on the 8-point strip, not in its `hitSlop` margin.

### Removed

- **Breaking:** **`toggle-group` is removed (#127).** `ToggleGroup` now ships in `toggle`. Import
  it from `@/components/ui/toggle`. `shadcn-nsh add toggle-group` is unknown; `add toggle` installs
  the button and the group.
- **Breaking: `Meter` is `Progress` with `marker` (#125).** `Meter` had no role and no look of its
  own — Progress's rail and fill plus a limit hairline — so it is gone, with no alias: the registry
  has no `meter` item, `shadcn-nsh add meter` and its `lib/meter.tsx` do not exist, and the docs
  page, demo, reference page and baselines went with it. **To migrate:** `<Meter value={0.83}
  marker={0.9} />` is `<Progress value={83} marker={90} />` — `value` and `marker` are percentages
  (0 to 100), not fractions.
- **Breaking:** **`textarea` is `Input` with `multiline` (#134).** One `nsh/base` input is one field:
  `Input` already took `multiline` and passed it to the same look, so `textarea` was the same field
  under a second name — and `add input` already brought it. The `textarea` registry item, its file
  and its page are gone. **To migrate:** `shadcn-nsh add input` (or keep the `Input` you have), then
  `<Textarea … />` from `@/components/ui/textarea` becomes `<Input multiline … />` from
  `@/components/ui/input`, and every prop keeps its meaning (`invalid`, `readonly`, `disabled`,
  `maxLength`, `onContentSizeChange`, `submitBehavior`). Delete `components/ui/textarea.tsx` once
  nothing imports it.

### Fixed

- **A select trigger's `width` wins over the 180-point floor (#88).** A `width` on `SelectTrigger`'s
  `style` used to size only the box around the trigger, so the look's `minWidth: 180` spilled a
  narrower trigger past its parent. That width now sets the trigger's own minimum too (a percentage
  width uses `minWidth: 0`).
- **`sliderFill` places a run that starts past the rail, and a vertical slider can show its value (#89).**
  `sliderFill(from, to)` sets the fill's edges when `from` is past the rail's start, in either
  orientation, so a band can light from the middle to its value. A `from` at or below 0 still
  leaves placement to nsh, and the ordinary slider's render is unchanged. `showValue` lays the
  readout above a vertical rail.
- **A command's search icon sits beside the field, and the placeholder stays readable (#98).**
  The search bar's row and the field's text and placeholder color are set inline, so they hold
  when `searchable` builds the bar after mount and on a dark card.
- **A dialog's body scrolls under a height cap, and its footer stays put (#118, #91).**
  `DialogContent` is never taller than the window holds inside the safe areas, 24 points clear of
  either edge: the body scrolls (the shell's `Scroll`, `contentStyle` gap 12) and `DialogFooter`
  registers with `DialogContent`, which draws it under that body, so the actions stay at the card's
  end while the text above them scrolls. Title and description scroll with the body — they are
  separate parts, in the app's own block. `scroll={false}` draws the children as given, for a body
  taking gestures of its own (a lightbox's pinch, an editor's canvas).
- **A dialog the system presents wears no card (#91).** With `presentation="fullScreen"`,
  `"pageSheet"` or `"formSheet"` on a phone or a tablet, the system draws the surface and
  `DialogContent` drops the card's edge, radius, shadow, margin and height cap (`dialogPage`); what
  the app gives as `style` still applies. Desktops and the web ignore `presentation` and keep the
  card, as before.
- **`SheetContent` shows one grabber, and it is the one that drags (#92).** The shell used to draw a
  pill of its own above the content, beside `nsh/base`'s own adjustable handle — a bottom sheet
  showed two, and the decorative one took the meaning away from the real one. The shell now turns
  the base handle on (`grabber`, on for `side="bottom"`), styles it with `sheetGrabber()`, and the
  content starts under it. `grabber`, `grabberStyle` and `grabberAccessibilityLabel` pass through.
- **`AccordionTrigger` lays out more than one child, and takes `disabled` (#92).** Its children are
  drawn in the trigger's row, in order, before the chevron: a leading icon, the title and a badge
  share the row without wrapping them in a `View` of the app's (a string child is the `RowLabel`
  that takes the room left). `disabled` takes the trigger's presses without disabling the item, so
  the panel's own controls keep working; a disabled trigger is drawn as a row of its own, so screen
  readers hear a disabled button without the item's expanded state.
- **`CollapsibleTrigger` can point its chevron down (#92).** `chevron="down"` draws the accordion's
  chevron — pointing down, turning over as the section opens — for a collapsible that reads as a
  section of an accordion; `along` (the default) keeps the right-pointing one in its half-width
  lane. Its children lay out like `AccordionTrigger`'s, more than one of them.
- **A submenu's trigger keeps its chevron, its label and its icon (#92).** `MenuSubTrigger` drew a
  bare row frame for element children: no chevron, and on a touch screen no title on the row that
  leads back. Both kinds now go through `SubmenuRow` (lead, label, chevron), and `lead` puts an
  icon in front; a string child is still the submenu's name on the back row.
- **A button group's joins show one hairline (#135).** `buttonGroupLook().item` used to drop the
  edge on both sides of a join, so a column of raised buttons showed a white seam (the lit top edge
  of the button below) instead of a line. Each join now keeps one edge, as shadcn's does, and in a
  column a button below another drops the raised face's lit top edge.
- **A bubble keeps room for its reactions (#128).** `BubbleReactions` hangs off the bubble's edge,
  and the next bubble in a group used to cover it. A `Bubble` holding a reaction row now keeps the
  room the row hangs out on that side.
- **`CollapsibleTrigger` draws its divider inside its row.** Every trigger but the `first` now
  draws the `RowDivider` its docs promised, so stacked collapsibles need no line between them, the
  line matches the panel's own row dividers, and the hover fill covers it. `CollapsibleContent`'s
  `panel` and `AccordionPanel` take `end`, room after the content to match `start`: a `listRow`
  in a revealed panel reaches past its content, and the region clips it, so with `start` and `end`
  its fill keeps both rounded ends.
- **Components mirror under right-to-left layout (#39).** A side that is not the same on both
  sides — padding, margin, border, corner radius, an offset — now uses NSH's start/end form, so
  `direction: "rtl"` moves it to the reading side. A symmetric pair (`left: 0, right: 0`) and an
  object marked `// physical: <why>` (a switch's knob, a screen-anchored popup) keep their side,
  and `bun run check` flags any new left/right side without a marker.
- **The message scroller's start button goes to the top, and the ends are exact (#31).** The
  button revealed the content's end in both directions, so `direction="start"` went to the newest
  message, and a padded `contentStyle` left the end short; the ends now move the scroll view, and
  new content still follows while the reader is at the end. A hidden button is out of the
  accessibility tree.
- **Chart tiles keep a readable label (#101).** Allocation draws solid `chart-N` tiles. The label is `chart-foreground` on a light tile and `on-media` on a dark one, in every theme. The series colours stay as they are: flipping them would hide a line on a card.
- **Text on a photograph uses `on-media` (#94).** The scrim was already the veil. The caption ink is no longer a white literal.

## 0.8.1 — `init` keeps your JSON, `diff` works offline

### Added

- **`diff` works offline.** The CLI keeps each registry file it fetches in
  `~/.cache/shadcn-nsh` (`SHADCN_NSH_CACHE_DIR` to move it); when the registry cannot be reached,
  `diff` compares with those copies and says when they were fetched. With nothing cached it
  prints `diff skipped` and exits `2` — `1` still means "differs" — so a check can treat
  "could not check" its own way.

### Fixed

- **`init` keeps `nsh.json` and `tsconfig.json` the way the app wrote them.** It used to rewrite
  both when it merged its keys, spreading every short array (`"conditions": ["node"]`, each
  `paths` value) over three lines. It now edits only the keys it sets: the rest of the file —
  formatting, comments, key order — stays byte for byte, and what it adds follows the file's
  indentation, short arrays on one line.
- **The home page's Docs, Components and Themes links open their pages.** They went to
  `/shadcn-nsh/shadcn-nsh/docs/…` and 404'd.

## 0.8.0 — NSH 0.6, the `@/` alias and quieter list highlights

### Added

- **`init` sets up the `@/` import alias in an app.** The docs' snippets import
  `@/components/ui/<name>` and `@/lib/theme`; a fresh app could not resolve them. `init` now
  merges `"@/*": ["./*"]` into `tsconfig.json`'s `compilerOptions.paths` — restating the NSH
  mappings `.nsh/tsconfig.json` declares, because a child's `paths` replace the base's, and
  writing the file when there is none — and adds `"resolve": { "alias": { "@": "./" } }` to
  `nsh.json`, which `nsh run`/`build`/`test` read. Existing `@/*` paths or `@` alias are left
  alone with a warning; running `init` again changes nothing. Monorepos import from
  `@workspace/ui` instead and are not touched.
- **The docs site has a home page.** Fumadocs' home layout in place of a docs page with three
  lines: what the library is, the `init` command, the component and theme counts, the theme
  showcase running live, and where to start.
- **Every install command is npm, pnpm and bun tabs.** The commands are Fumadocs' code block and
  tabs (`npx`, `pnpm dlx`, `bunx --bun`); the choice is shared by every block and kept across pages.

### Changed

- **The baseline is NSH v0.6.0; the library needs NSH CLI v0.6.0.** The ported look follows
  upstream's: the listbox and date-picker popups animate in (`popupStartingStyle`), a menu
  opens as a popup on an iPad at regular width (`menuIsPopup`), and the rich editor's task
  checkbox answers the pointer — a hover rim and fill, a pressed scale. The demo packaging
  follows 0.6's slimmer web template, whose start logic is its own hashed script.
- **A list's highlight is a quiet fill, not a chosen-looking frame.** Select, Combobox and Command
  rows were highlighted in the brand tint with a brand edge, so the first match a combobox
  highlights as one types read as already chosen. The highlight is now shadcn's `accent` fill with
  no edge; the chosen rows keep their check. The calendar's keyboard day keeps the tint and edge,
  since a day's quiet fill already means today and the hover.
- **A field's label in a row keeps its width.** `fieldFamilyLook().labelInRow` no longer shrinks:
  on a narrow phone it was cut mid-word ("Ema / il"); the control beside it gives up the room
  instead (`content` gains `minWidth: 0`). `FieldError`'s messages wrap beside their bullet through
  a new look key, `errorMessage` — a copy that spreads its own `FieldFamilyLook` adds it.
- **The docs site's component pages follow one outline** — Installation, Usage, Examples, an
  optional Differences from shadcn/ui, API — and the components are grouped as Base (dressing an
  NSH element) and Enhanced (a shadcn composite or this library's own). An Icons page explains
  `Icon`, the lucide names and each component's glyph helper. The site itself stays in the shadcn
  theme; the palette switch changes the previews only.

### Fixed

- **The docs site's previews load again.** The site's prerender crawled each packaged demo and
  wrote it back without the script the preview reads (`window.nshDemo`), so every preview said
  "This app could not be loaded".
- **The calendar's preview spans a phone's width.** The demo set each calendar in a row that shrank
  it to its content; the calendar itself already fills the width it is given.
- **The Menu page's context menu lines its rows up.** Copy, Rename and Delete sat left of the
  checkable Pinned row's label; they now take `inset`, as the ContextMenu page's rows already did.
- **An OTP input fits a narrow phone.** Its cells kept their width and pushed the code past its
  card; the cells, the groups and the code now narrow together when the room is short
  (`otpCells` gains `shrink min-w-0`, and `OtpInput` puts `max-w-full shrink min-w-0` in front of
  its `class` and `groupClass`).
- **The Skeleton preview stays inside its card.** Its lines had fixed widths up to 320 points; they
  now stop at their column's width (`maxWidth: "100%"`), as a page's placeholders should.
- **The docs site no longer zooms into a field.** iOS Safari zoomed the page whenever an input under
  16 points took the focus, which every preview's input is; the site and the packaged demos set
  `maximum-scale=1`, and pinching still zooms.
- **Every preview fits a 320-point phone.** The Card, Attachment, Spinner and Tabs previews ran past
  their cards on an iPhone SE's width; the cards shrink, the picture strip scrolls inside its card,
  the surfaces wrap, and the tabs' rule stays on the card's edge. `bun run check:narrow` now
  renders every demo at 320 points and names one that runs into the page's margin.

## 0.7.0 — conversations, navigation and a third theme

### Added

- **`theme-solid-glass`.** Solid Glass ([deeplethe/solid-glass](https://github.com/deeplethe/solid-glass),
  MIT) as one more theme: panes of thick smoky glass — a rim of light along each top edge, a hairline
  round it, a shadow underneath. It installs into `themes/solid-glass/` (`theme.json`,
  `finishes.json` and an `index.ts` for `selectTheme`), so an app switches to it while it runs;
  `init --theme solid-glass` is the same palette as the theme the app is built with.
- **`message`.** One row of a conversation: `MessageGroup`, `Message`, `MessageAvatar`,
  `MessageContent`, `MessageHeader` and `MessageFooter`. `align="end"` mirrors the row, so the
  bubbles inside follow the message; the avatar is this library's `Avatar` at 32 points (36 on a
  touch screen), `name` giving it initials on an identity hue; the header and footer are small and
  medium in the muted ink. `add message` brings `avatar`.
- **`bubble`.** The framed surface of one turn: `BubbleGroup`, `Bubble`, `BubbleContent` and
  `BubbleReactions`. Seven fills (`default`, `secondary`, `muted`, `tinted`, `outline`, `ghost`,
  `destructive`), `align` on the sender's side, a bubble as wide as it holds (80% of the column at
  most, all of it when `ghost`), and a reaction pill that hangs off either edge. `onPress` on the
  content makes a turn act.
- **`marker`.** One line in a conversation that is not a message: `Marker`, `MarkerIcon` and
  `MarkerContent` — inline, with a hairline under it (`variant="border"`), or the label between two
  rules (`variant="separator"`). The line is in the muted ink at the body's size, its icon 16
  points; `onPress` makes a marker act (underlined, the hand over it).
- **`attachment`.** A file or a picture a message or a composer carries: `Attachment`,
  `AttachmentGroup`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`,
  `AttachmentDescription`, `AttachmentActions`, `AttachmentAction` and `AttachmentTrigger`. Five
  states (`idle`, `uploading`, `processing`, `error`, `done`), three sizes, a horizontal frame and a
  vertical one for pictures, and a trigger that opens the file from anywhere on the frame. `add
  attachment` brings `button`.
- **`message-scroller`.** A conversation that scrolls and keeps up with itself: `MessageScroller`,
  `MessageScrollerViewport`, `MessageScrollerContent`, `MessageScrollerItem` and
  `MessageScrollerButton`. New turns follow the newest message while the reader is at the end and
  stay put when they have scrolled up; `initialScroll` says where it opens; a button floats over the
  viewport while there is somewhere to go. State lives inside, so there is no provider or hook.
- **`nav-stack`.** Pages pushed on a stack, after `nsh/base`'s `NavStack`: `NavStack`, `NavPage` and
  `createNavStack` re-exported, with the header a page shows on the desktops and the web — the back
  button while there is a page below, the page's `title`, and `headerRight` at its trailing edge —
  drawn from the theme's header roles with a `colors.border` hairline under it. The header is 48
  points with a pointer (52 on a touch screen), and a page may replace it whole with `header`. iOS
  and Android draw their system header instead, which takes the same `title` and `headerRight`; there
  this component draws nothing of its own. The platform's back (Escape, Alt+Left, the mouse's back
  button, the browser's back, the swipe back on iOS) pops through `nsh/base`, and the back button
  honours `popOnBack` and reports `onBackPress`. `add nav-stack` brings `button`, `icons` and
  `theme`.
- **`sidebar`.** An app's navigation column beside its page: `SidebarProvider`, `useSidebar`,
  `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`,
  `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`,
  `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`,
  `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`,
  `SidebarMenuSubItem` and `SidebarMenuSubButton`. Three axes: `side` (`left` / `right`), `variant`
  (`sidebar` / `floating` / `inset`) and `collapsible` (`offcanvas` / `icon` / `none`); 256 points
  wide, 48 folded to its icons (the fold is instant — the platform transitions colors, opacity and
  transforms, not layout), and a sheet 288 wide on a touch screen or under 600 points. The provider
  owns the state (`open` / `defaultOpen`, `onOpenChange({ open, reason })` with `triggerPress`,
  `railPress` and `shortcut`); ⌘B / Ctrl+B is `nsh`'s `keymap`; nothing is written down, so the app
  keeps the state where it keeps the rest. A folded row names itself in a tooltip, an action steps
  past a badge instead of drawing over it, and the phone's sheet is this library's `Sheet`. `add
  sidebar` brings `button`, `input`, `separator`, `sheet`, `skeleton`, `tooltip`, `icons`,
  `press`, `surface`, `theme` and `utils`.
- **`navigation-menu`.** A row of triggers, each opening a panel of anything — a link grid, a card
  with a description — under the bar: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`,
  `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`. One panel at a time, owned
  by the root (`value` / `defaultValue`, `onValueChange({ value, reason })`); a press opens and
  closes one, and on a desktop the pointer's rest opens it too (`delayDuration` 200, `closeDelay`
  300, both `Infinity`-able). Each panel is a `nsh/base` Popover placed against its trigger: a
  trigger is 36 points high and 16 in either side (44 with a touch screen), the open one on the
  `accent` fill at half with its chevron turned. There is no viewport, so no bar-wide panel and no
  size animation. `add navigation-menu` brings `popup`, `icons`, `press`, `theme` and `utils`.
- **`menubar`.** A row of menus: `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, and
  the menu's rows under the bar's names (`MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioItem`,
  `MenubarLabel`, `MenubarSeparator`, `MenubarShortcut`, `MenubarGroup`, `MenubarSub`,
  `MenubarSubTrigger`, `MenubarSubContent`). The bar is 36 points high with a pointer (50 on a touch
  screen) inside a 1-point edge, its triggers 26 (40) tall, the trigger of the open menu on the
  neutral `accent` fill. Rows, submenus and the popup are `menu`'s looks, so `add menubar` brings
  `menu` with it.
- **`drawer`.** A panel from the bottom edge: `Drawer`, `DrawerTrigger`, `DrawerContent`,
  `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, `DrawerClose`. Against `sheet`
  it is the phone's panel: bottom by default, a 100-point grabber at its top edge (`drawerGrabber`),
  `closeOnSwipe` on by default, its actions stacked. The panel is `sheet`'s, the scrim is
  `lib/popup`'s, the title and text are `dialog`'s, so `add drawer` brings `dialog` with it.
- **`breadcrumb`.** A trail from the app's root to the page it shows: `Breadcrumb` and its parts
  (`List`, `Item`, `Link`, `Page`, `Separator`, `Ellipsis`), the steps small and muted with a chevron
  between them, a step's link taking the text color under the pointer and the theme's focus ring
  with the keyboard on it. A step is `nsh/base`'s Link, so `href` / `openWith` work as everywhere
  else; the page is announced as the current one; the separator and the ellipsis are their marks
  (`›`, `…`) in a terminal, which draws no icons.
- **`aspect-ratio`.** A box as wide as its column and as tall as its `ratio` says (`16 / 9`, a
  square, CSS's `"16 / 9"`), its content clipped to it: pictures keep their shape on every screen.
- **`textarea`.** A field of several lines: `nsh/base`'s Input with `multiline` on, in the look of
  `input.tsx` (`inputLook`, reused, not copied) — the same fill, edge, text and placeholder, the
  focus edge while it has the keys, 50% while disabled, and `invalid` for the danger edge. It sits
  as tall as a one-line input at least; a box that follows its text keeps `onContentSizeChange`'s
  height plus the look's padding.
- **`terminal`.** A program's output on the theme's surface, the keys typed back to it: `nsh/base`'s
  `Terminal` wearing a well — the field's fill and edge, the theme's inner corners and a padding —
  its cursor half the text color. `variant` is `default` (the well) or `ghost` (no fill, no edge, no
  padding: an app whose window is the terminal gives the surface). The program stays the app's
  (`write` on the ref, `onData` and `onResize` on events) and the text is the theme's monospaced
  family; NSH interprets the escape sequences and draws the cells. `add terminal` brings `theme` and `utils`.
- **`code-editor`.** A code file as a field: `CodeEditor` is `nsh/base`'s Editor on the theme's well
  — the field's fill, its hairline edge and the control tier's corners (`codeEditorFrame()`) — with
  its parts painted by `codeEditorClasses`: a gutter on the muted fill, line numbers and fold markers
  muted, the caret's line a faint band and its number in the text color, selected text a tint of the
  brand, carets in the foreground, indent guides on the border color, search matches in the warning
  tone, and diagnostics underlined in the theme's semantic colors (`destructive` for an error, `warn`
  for a warning, `info` for information, `muted-foreground` for a hint). Every `nsh/base` prop passes
  through — text, language, folding, search, the editing keys, diagnostics; an app's `classes` go
  over ours and its `style` over the frame. Syntax highlighting is NSH's own colors. `add
  code-editor` brings `theme` and `utils`.

### Changed

- **Breaking:** **the registry's shared items are `utils` and `popup`.** `label-of` is gone: `labelOf`
  is in `lib/utils`, with `Live` / `read` (a tone written as a value or as a function) and
  `mergeClasses`. `overlay` is gone too: its `backdrop` is in `lib/popup`, beside the placement the
  popup already knew. There is no alias, so a `registryDependencies` entry naming either one does not
  resolve. **To migrate:** `add utils` replaces `add label-of`, `add popup` replaces `add overlay`,
  and an import of `lib/label` or `lib/overlay` reads `lib/utils` or `lib/popup`.
- **Breaking:** **`MenuLabel` takes its title as children.** Every other part of the menu family
  takes `children`; `MenuLabel` read `text`, which is gone — its title is `children`, through a named
  `MenuLabelProps` that `menubar` and `context-menu` re-export as `MenubarLabelProps` and
  `ContextMenuLabelProps`. `MenuShortcut`'s `style` is `StyleProp<TextStyle>` — a text style is
  a view style, so the casts it needed are gone; a style written as a list is taken as one.
  `ContextMenuItemVariant` joins the family's names, as `MenubarItemVariant` did. **To migrate:**
  `<MenuLabel text="More" />` becomes `<MenuLabel>More</MenuLabel>`.
- **Breaking:** **the library gives up the tables and helpers only its own parts read.** Exported
  until now, and read by nothing but the component beside them: `toggleSizes`, `MARK_WEIGHT` (the
  checkbox's pen), `treeIndent`, `treeRowHeight`, `menuPressed`, `menubarSize`,
  `ghostFill` and `solidTint` (`theme.ts`; they live beside their one reader, `button` and
  `diff-view`), `LABEL_WIDTH`, `labelColumn` and `ROW_BLEED` (`surface.tsx`), and `ghostOutdent`,
  which had no caller at all. `AccordionDivider` and `AccordionDividerProps` are gone: the hairline an
  accordion wants is `surface`'s `RowDivider`, placed where the stack wants it. `MenuItemLookOptions`
  loses `tall` — no page passed it, and a row is one line of `menuItemSize.height` everywhere.
  **To migrate:** these are the component's own numbers; an app that needs one copies it from the
  file it now sits in, and an accordion divider is a `RowDivider`.
- **Breaking:** **`editor` is the rich editor only.** `Editor` and `EditorProps` moved to
  `code-editor` as `CodeEditor` and `CodeEditorProps`; `editor` keeps `RichEditor`,
  `richEditorClasses` and `RichEditorProps`, with no alias left behind. **To migrate:** an app
  importing `Editor` from `components/ui/editor` imports `CodeEditor` from
  `components/ui/code-editor` instead, and `add code-editor` brings the file.
- **Breaking:** **`alert-dialog` is the platform's alert now.** `AlertDialogContent` shows
  `nsh/base`'s `AlertDialog.show` instead of drawing a card on `Dialog`: the box is the system's
  (UIAlertController on iOS, NSAlert on macOS, NSH's drawing of the same box on the web, the
  platform dialog on Android), so it does not follow the theme, it shows plain text only (no views,
  icons or fields), and an Android alert takes at most three buttons. The parts keep their names but
  their children are strings: `AlertDialogTitle` and `AlertDialogDescription` register the title and
  the message, `AlertDialogAction` registers a button's `id` / label / `role`, and `AlertDialogHeader`
  and `AlertDialogFooter` draw nothing. `AlertDialogContent` takes what `AlertDialogOptions` has
  besides the content — `presentation`, `closeOnEscape`, `closeOnBackdropPress` — and loses `width`,
  `animation`, `style`, `backdropStyle` and `closeOnSwipe`; `AlertDialogAction` loses `disabled` and
  `style`; the root loses `onOpen`, `onClose` and `onCancel`; `AlertDialogChangeReason` is now
  `"triggerPress" | "select" | "cancel"` (`"select"` when a button was chosen, `"cancel"` when it
  closed without one). `AlertDialogCancel` is new: an action with `role="cancel"` whose `id` is
  `"cancel"` unless the app names another. `add alert-dialog` no longer brings `dialog`, `popup` or
  `theme`; it brings `button` and `open-state`. The box stays one while it is up: a part that renders
  again with the alert still open (a page whose layout rebuilds its children) stacks nothing.
  **To migrate:** a confirmation with content of the app's own, in the app's look, is a `dialog`.
- **Breaking:** **the theme says how a control hovers, rings and where a slider's thumb comes from.**
  `hovered()` reads the theme's `hover` token, `focusRing()` the new `ring-halo` token, and
  `finishes.json` gains a `handle` role for the slider's thumb, apart from the switch's `knob`. The
  default theme keeps its look (`ring-halo` is the ring at 14%, `handle` the knob); the shadcn theme
  hovers in `accent`, rings focus at `ring/50` and draws the thumb white with a `primary` edge. **To
  migrate:** an app with its own `theme.json` and `finishes.json` adds `ring-halo` to both
  appearances and a `handle` finish (a copy of its `knob` keeps the look).
- **Breaking:** **`select` and `combobox` no longer re-export the shared listbox look.** `OptionRow`,
  `ListboxHeader`, `ListboxEmpty`, `listboxProps`, `listboxSearch`, `listboxFooter`,
  `clearButtonLook` and their option types live in `lib/listbox`, and each component drops its own
  copy of `Chevron`. **To migrate:** an app that imported them from `components/ui/select` or
  `components/ui/combobox` imports them from `lib/listbox`, which `add select` already installs;
  `add combobox` no longer brings `icons` or `lucide` of its own.
- **A part's props have a name to import, and a press's target one home.** `MeterProps`,
  `AttachmentContentProps`, `AttachmentActionsProps`, `PaginationItemClassOptions` and
  `CollapsibleOpenChangeReason` were inline or unnamed; each is a named type now, described where it
  is used. The 44-point touch target and the arithmetic that widens a small control's hit area are
  `lib/press`'s (`TOUCH_TARGET`, read from the switch's geometry, and `touchSlop`), read by `button`,
  `toggle` and the switch instead of written out three times. The pixels are unchanged.
- **A shell's default classes and an app's `classes` meet by one rule.** `data-table`, `text-view`
  and `code-editor` shared a private copy each; `mergeClasses` in `lib/utils.ts` is the one: a
  string goes after ours, `null` drops ours. `add` of any of the three brings that item.

### Fixed

- **The CLI reads the registry of its own release.** `add`, `list`, `view` and `diff` fetched
  `main`'s `public/r`, so an app on an older CLI could install files written against a newer one.
  They read `https://raw.githubusercontent.com/aningdev/shadcn-nsh/v<version>/public/r/{name}.json`
  now — the registry published with the tag the CLI came from — as the README promised; an app
  already installed keeps what it has, and `--registry` still points elsewhere.
- **A `tone` is written one way, and a style may be a list.** `tone` is `Live<Tone>` everywhere
  (`Tone` or a function read where the control draws), including `status`, `stat` and `diff-view`'s
  `DiffHunkActions`, which wrote the union out; `otp-input`'s `tone` is `Live<Tone | undefined>`.
  `Picker`, `SelectTrigger`, `DatePickerTrigger`, `ColorTrigger`, `ColorPopover` and `PopIn` took a
  single `ViewStyle`, so `style={[a, b]}`, which every other part takes, was a type error; they take
  `StyleProp<ViewStyle>`.
- **A `CarouselPaginationItem` with no child draws nothing.** It drew a dark dot of its own for
  whatever it was given, and `nsh/base` keeps the current slide to itself (it reports it through
  `onChange`), so the dot pointed at no slide: the app passes the dot and says which slide it is on.
  A disabled `SplitButtonSegment` dims at half, as a disabled button's label does — the segment had
  gone without the look's disabled style. A `MenuSubTrigger` given a string now wears the `style` it
  is handed, as its element form did. A `MenuGroup` is a `group` to a screen reader, and a
  `Collapsible`'s trigger is one element there, not two. A `ColorPicker`'s format button no longer
  leaves 12 points and a gap for the icon a terminal draws nothing for.
- **A `sidebar` mounted closed is folded from its first frame.** A column with
  `defaultOpen={false}` (or an `open` that is false at the first frame) drew its rows expanded until
  something changed: its rows now draw the icon alone, the search field, a group's action, a row's
  badge and action and an open sub menu are gone, and a folded row keeps the 8-point gap so a
  trailing icon is clipped at the 48-point rail instead of hanging beside the icon. The parts read
  the column's axes where they wear them, so a closed column no longer draws its rows expanded.
- **A `collapsible="none"` sidebar keeps its frame** — the 8 points of room `floating` and `inset`
  give a card, on top of the column's 256 — so beside an `inset` page both cards stand on the
  sidebar's ground with their gutters.

## 0.6.1 — the app's theme, kept

- **`add theme` is the app's theme.** In an app `init --theme shadcn` made, `add theme --overwrite`
  wrote the library's default colors into `theme.json` and `lib/finishes.json`. A named `theme` now
  resolves as the dependency does, to the theme `nsh-ui.json` records: shadcn's data at the
  build-time paths, the roles module and `themes/shadcn/`.
- **A pinned package stays pinned.** `add` ran `bun add lucide@^1.66.0` every time, turning an
  app's exact `1.66.0` into `^1.66.0` in `package.json` and the lock file. A package the app
  already declares at a version in range is left as written (`keep lucide …`); one older than the
  range is still raised.
- **One key cap.** A command row's shortcut is drawn in `kbd`'s `Kbd`, and `command` no longer
  has a keycap of its own: `add command` brings `kbd`, and an app that imported `Kbd` from
  `components/ui/command` imports it from `components/ui/kbd` (`<Kbd>⌘K</Kbd>`).
- **A field's label follows the scheme.** `fieldFamilyLook()` built its `title` and `labelInRow`
  color when it was called, so a look kept in a `const` kept the scheme the page opened in (a black
  label on a dark page). They read the theme when drawn now, as the other parts did.

## 0.6.0 — a theme says what it draws

What the shadcn theme still had to work around, worked around in the library instead, so a theme
says what it draws and nothing more.

- **A press sinks as far as the theme says.** `finishes.json` gains a top-level `press.scale`
  (`0.97` here; `1` draws no press at all). `pressSink` reads it when a control is pressed, so
  `selectTheme` turns every sink off and back on — a flat theme's buttons now change color on
  press and nothing else.
- **A fill can be one color.** `finish.fill` is readable as `backgroundColor` as well as
  `backgroundImage`; `slider` and `progress` draw the theme's gradient where it gives one and its
  color alone where it does not. `themes/shadcn/finishes.json`'s runs and bars are a single color
  now, not a two-stop gradient of it.
- **A rail's edge no longer depends on the theme's shade.** `insetEdge()` joins a rail's 1-point
  line to its `boxShadow`, skipping either where the theme gives none; shadcn's `track` says
  `boxShadow: none` instead of `inset 0 0 0 1px transparent`.
- **Corners come from the theme.** A dialog takes the new `radius-popover` token (16 here, 14 in
  shadcn); the toolbar, badge, plot tooltip, popup surface, toast's close button, a tab's count and
  a combobox's toggle take `radius.inset` / `radius.card` / `radius.control`. The build-time theme
  draws the same pixels as before.
- **This library's own theme installs as one more theme.** `add theme-default` writes
  `themes/default/{theme.json,finishes.json,index.ts}`, the `AppTheme` exported as `defaultTheme`:
  an app built with `init --theme shadcn` lists both and switches between them. The `theme` item
  (the build-time theme) and `init --theme default` are unchanged, and no old id is aliased.
- `bun run port:render:theme` is the shadcn theme's render check: every demo and its reference
  page drawn with `selectTheme(shadcn)`, compared pair by pair, 112 of 112 identical, and not part
  of the committed baseline. `port:sheet` shows the pictures as two more columns.
- `scripts/theme/generate-shadcn.ts` may leave a finish role's keys out (the default file's order
  first), which is how this theme's `fill` is one color and its `track` has no shade.

Added:

- `MenuItem`, `MenuLabel` and `MenuSubTrigger` (and their `ContextMenu…` names) take `inset`, as
  shadcn's: a plain row's label starts past a checkable row's mark, so the rows of one menu line
  up. A checkable row keeps its mark's room either way, so its label does not move as it is
  toggled.

Fixed:

- `PopoverContent` and `HoverCardContent` follow a `placement`, and `SheetContent` a `side`, that
  changes after mount; each read it once and kept the first value. `MenuContent`'s entrance now comes
  in from the current `placement` too.
- `Calendar` fits a width narrower than its days (seven 42-point cells on a phone): the days, and the
  month and year views, narrow with their columns instead of running past the calendar's edge.
- `AlertDescription` has no row of its own, as shadcn's `col-start-2`: with no `AlertTitle` it sits
  beside the icon instead of leaving the icon alone on the first line.

## 0.5.0 — themes at run time

An app can carry more than one theme and switch between them while it runs, without a relaunch;
the appearance (light / dark / system) stays the app's own and applies to whichever theme is in use.

- `@shadcn-nsh/theme` exports `AppTheme` (`{ id, label, theme, finishes }`), `selectTheme(theme)`
  and `currentTheme()`. `selectTheme` sets the tokens first (`nsh`'s `setTheme`), then the finishes,
  which are now read through a signal instead of the module's import, so every component on screen
  redraws with both on the next frame. `selectTheme(null)` goes back to the build-time theme; a
  theme `setTheme` refuses throws `TypeError` and leaves the app as it was. `packages/theme/README.md`
  has the list-and-persist example.
- `theme-shadcn` now installs **one more theme**: `themes/shadcn/{theme.json,finishes.json,index.ts}`,
  the last exporting the `AppTheme` the app lists. It no longer replaces the build-time `theme.json`
  and `lib/finishes.json`. `init --theme shadcn` still makes shadcn the build-time theme (and writes
  `themes/shadcn/` beside it).

**To migrate**: an app that switched themes with `add theme-shadcn` now gets a second theme instead.
To make one the theme the app is built with, re-run `init --theme shadcn --overwrite` (the same
semantics as 0.4.0, colours the app changed included); to keep switching at run time, list
`themes/shadcn/index.ts` and call `selectTheme`, as `packages/theme/README.md` shows. Nothing needs
deleting: an app installed before this release keeps its files as they are, and gains
`themes/shadcn/` the next time it takes the item.

## 0.4.1

Fixed:

- `InputGroupInput` and `InputGroupTextarea` take a `ref`, the control's `InputRef`, as shadcn's
  forward theirs: `ref.focus()` puts the keys in the control from code (MyAid #14). The group still
  holds the control too, for an addon's press.

## 0.4.0 — seven components shadcn has, input groups, base types

Seven components, each the library's own: none comes from upstream's gallery, so none carries a
port region, and each is one file the registry copies into the app.

| Item           | What it is                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `separator`    | A hairline across the content or down a row, hidden from a reader unless `decorative={false}`.                   |
| `skeleton`     | The shape of content that is still coming: an `accent` block that breathes.                                      |
| `kbd`          | A key of a shortcut (`Kbd`, one cap; `KbdGroup`, a row of them).                                                 |
| `label`        | The visible name of a control — text, not its accessible name.                                                   |
| `alert`        | A notice of the page or form (`Alert`, `AlertTitle`, `AlertDescription`), in `default` or `destructive`.         |
| `empty`        | A centered empty state (`Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`). |
| `button-group` | Buttons joined into one control (`ButtonGroup`, `ButtonGroupText`, `ButtonGroupSeparator`).                      |

For them the scaffolding grew a flag, `bun run port:new <id> --view`, which starts a component from
nsh's own `View` and `Text` instead of from a `nsh/base` symbol.

Two names moved to make room for shadcn's:

- the registry's `label` library item is now `label-of` (its file stays `lib/label.ts`), so `label`
  is the name of the component, as in shadcn; `add label` copies the component, not the rule. **To
  migrate**: nothing to delete. The components that use the rule depend on `label-of`, so
  `add <id> --overwrite` writes the same `lib/label.ts` again; `add label` now adds `label.tsx`
  beside it. There is no `label` alias for the old item;
- `packages/ui/index.ts` names `command`'s exports one by one, since the palette's own keycap is also
  called `Kbd`: the package's `Kbd` is the component's, and the palette's stays inside the module.

Where nsh has no selector to copy shadcn's CSS, the deviation is in the component's page: `alert`
keeps the icon's column when there is no icon (`has-[>svg]`), `button-group` joins its buttons with a
style each one wears (a child selector), and `label` takes `disabled` itself (a `peer-disabled`).
Also new:

- `InputGroup` (`input-group`), a field's frame around a control and what sits beside it, after
  shadcn's InputGroup: `InputGroup`, `InputGroupInput`, `InputGroupTextarea`, `InputGroupAddon`
  (`align`: `inline-start` / `inline-end` / `block-start` / `block-end`), `InputGroupText`, and
  `InputGroupButton` (`size`: `xs` / `sm` / `icon-xs` / `icon-sm`, taken from this library's scale;
  `variant` is a button's, `ghost` unless set). The group draws the field — its fill, its edge, the
  focus edge and ring while a control in it has the keys, the danger tone while `invalid`, flat on
  the quieter edge and dimmed while `disabled` — and the control in it draws none of that, so a
  group has one frame. The radius you write on it (`style={{ borderRadius: 22 }}`) is the radius its
  focus ring follows, which a `variant="ghost"` `Input` in a `View` of your own cannot do: the ghost
  input keeps its own focus edge and ring, and a group is what replaces it.
- The `input` page says as much under its ghost variant and points at `InputGroup`; both pages are
  in the docs with the examples above.
- The `switch` page writes a settings row both ways — the switch as the whole row (`listRow`), and
  shadcn's `Field` in a row with the switch at the end — and says what each is read as; its demo
  shows a list of them and the same row in a right-to-left app. The `pressable` page says where a
  region's role and its state come from (`role`, not React Native's `accessibilityRole`; a region
  is not an on / off control — that is `Switch`). No component code changed.

Base types, from each component's own file:

- Every type the shells' props, refs and callbacks name comes from `nsh/base`, and each component
  file now re-exports the ones it uses — `dialog` alone keeps its own to `nsh/base` — so a call site
  imports them from its own copy: `command` exports `CommandItem`, `CommandEntry`, `CommandGroup`
  and `CommandRef`, `text-view` exports
  `TextViewImage`, `TextViewClasses` and `TextViewRef`, `dock-area` exports `DockAreaRef`,
  `DockAreaLayout`, `DockRegion`, `DockNode`, `DockPlacement`, `DockPanel`, `DockPanelOptions`,
  `DockTarget`, `DockDropIndicator` and `DockInfo` (a tab is `DockTabValue`, since `DockTab` is the
  component), and the rest of the library the same (`CalendarEntry`, `DataTableClasses`,
  `DiffViewStyles`, `EmojiEntry` and its neighbours, `PaginationItemState`, `ScrollbarTheme`,
  `TreeEntry`, `AlertDialogRole`, `ColorChannel` / `ColorFormat` / `ColorSpace`). Where `nsh/base`'s
  name is taken here, the export is prefixed by the component: `MenuOpenChangeReason`,
  `SheetOpenChangeReason`, `PopoverOpenChangeReason`, `HoverCardOpenChangeReason`,
  `ContextMenuOpenChangeReason`, `ComboboxOpenChangeReason`, `TooltipOpenChangeReason`,
  `DatePickerOpenChangeReason`, `AlertDialogChangeReason`, `ComboboxSelectItem`, `DatePickerEntry`.

Fixed:

- Text is upper- and lower-cased for its locale (`toLocaleUpperCase` / `toLocaleLowerCase`) rather
  than the language-neutral way, so a heading keeps its letters where they have a locale of their
  own (a command palette's headings, a popup's placement words, an emoji section's name, a color
  picker's labels read aloud).
- **`SelectTrigger`'s `style` now places the trigger where the app puts it.** The properties that lay
  a view out — `flex`, `flexGrow`, `flexShrink`, `flexBasis`, `width`, `minWidth`, `maxWidth`,
  `alignSelf` and the margins — go on the view around the trigger, so a trigger grows and shrinks
  like a view of the app's own: in a row, `style={{ flex: 1 }}` takes the room left, and
  `minWidth: 0` lets a narrow row squeeze it under the least the look asks for (180 points with a
  pointer), its title ending in an ellipsis instead of overflowing. The rest of the style (the fill,
  the edge, the padding) stays on the trigger as before, and a trigger with no `style` draws exactly
  what it always did. The field scene drops the view it wrapped around each select.
- **`Item variant="muted"` sits on a muted fill.** It was the inset surface, which in a dark
  appearance is all but the card's colour; it is now `colors.mutedFill`, the theme's `muted` token
  (shadcn's `bg-muted`), which reads on a card and on the page in either appearance and stays
  lighter than an edge. `colors` gains that one role; no theme data changed, since both themes
  already declare `muted`. `default` and `outline` draw what they always did.

## 0.3.0 — the unified API

`variant`, `size` and `tone` are now written the way shadcn writes them, and `kind` is gone. **This
is a breaking change**: the old values are out of the unions they were in, so `nsh check` points at
every call site. There are no aliases — a migration is a type error, not a warning.

| Old                                                | New                                                       |
| -------------------------------------------------- | --------------------------------------------------------- |
| `variant="primary"`, `variant="accent"`            | `variant="default"` (or omit it)                          |
| `variant="danger"`                                 | `variant="destructive"`                                   |
| `size="small"` / `"regular"` / `"large"`           | `size="sm"` / `"default"` / `"lg"`                        |
| `<Toggle variant="ghost" />`                       | `<Toggle />` (`default` is the transparent one)           |
| `<SelectTrigger kind="outline" />`                 | `<SelectTrigger variant="outline" />`                     |
| `<IconButton tone="danger" />`                     | `<IconButton variant="destructive" />`                    |
| `<IconButton on={x} />`                            | `<IconButton selected={x} />`                             |
| `<RoundButton size={24} />`                        | `<RoundButton size="sm" />`, or `side={24}` for 24 points |
| `<Badge outline />`                                | `<Badge variant="outline" />`                             |
| `<Badge label="12" />`                             | `<Badge>12</Badge>`                                       |
| `<Pagination outlined />`                          | `<Pagination variant="outline" />`                        |
| `<MenuItem danger />` `<ContextMenuItem danger />` | `variant="destructive"`                                   |
| `<Checkbox scale={0.8} />`                         | `<Checkbox size="sm" />`                                  |
| `<Radio variant="ring" />`                         | `<Radio />` (`default` is the ring)                       |
| `<Switch size="small" />`                          | `<Switch size="sm" />`                                    |
| `<SegmentedList size="regular" />`                 | `<SegmentedList size="default" />`                        |
| `<IconButton>` / `<RoundButton>` with no name      | pass `accessibilityLabel`, now required on both           |
| `<Icon name="chevron" />`                          | `<Icon icon={ChevronRight} />`, an import from `lucide`   |

Icons come from [`lucide`](https://lucide.dev): a component imports the icon it draws
(`import { ChevronDown } from "lucide"`) and hands it over as `icon={ChevronDown}`, so the app bundles
only the icons it uses. `IconName` and the glyphs in `lib/icons.tsx` are gone; a public prop that took
`IconName` takes lucide's `IconNode` (`tabs`, `tree`, `select`, `command`, `diff-view`,
`emojiGroups`). `shadcn-nsh init` and `add` install the packages an item declares, `lucide` among them, with the
package manager the nearest lock file names (a workspace member's is its workspace's).

The looks follow their components: `menuItemLabel`, `menuItemNote` and `menuItemGlyph` take
`{ variant: "default" | "destructive" }`, `paginationItemClass` takes `{ variant: "default" |
"outline" }`, and `segmentedLook` / `switchLook` take `sm` / `default`.

New, and only added:

- Three composite components with every part shadcn has: `card` (`Card`, `CardHeader`, `CardTitle`,
  `CardDescription`, `CardAction`, `CardContent`, `CardFooter`), `field` (`FieldSet`, `FieldLegend`,
  `FieldGroup`, `Field`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`,
  `FieldSeparator`, `FieldError`; `orientation` vertical / horizontal / responsive) and `item`
  (`ItemGroup`, `ItemSeparator`, `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`,
  `ItemActions`, `ItemHeader`, `ItemFooter`; `variant` default / outline / muted, `size` default / sm).
- `Radio` takes `size` (`sm` / `default` / `lg`) as `Checkbox` does, from one table of scales: 0.8,
  1, 1.25 (`ChoiceSize`).
- `IconButton` and `RoundButton` take `size` (`sm` / `default` / `lg`); its default is the size they
  already had, so nothing moves on its own. `RoundButton`'s `side` still sets an exact diameter.
- Every `tone` prop is one type, `Tone | (() => Tone)`: a value, or a function read where the control
  draws (`Badge`, `Meter`, `Stat`, `Status`, `Progress`, `DiffHunkActions`).
- `Button`, `Link`, `Toggle`, `Checkbox`, `Radio`, `MenuItem` and `SplitButtonSegment` take the text of a string child as the control's name for screen readers, unless `accessibilityLabel` says otherwise; children drawn as given derive nothing.
- `Input` takes `variant`: `default` is the sunk field it always was, `ghost` is the same text
  and placeholder with no fill and no edge at rest, keeping the focus ring, the invalid edge and
  the disabled look. `inputLook` takes the same option (`InputVariant`).
- `Pressable` (`pressable`), a region that takes presses and adds only their feedback: the
  lightest hover fill, the press's sink, the keyboard's ring. No fill, padding, height or radius
  of its own, so a whole row, a picture or a paragraph can be the target; `pressableLook` is the
  look on its own, and a string child names the region as a button's does.
- Each control exports its own axis union (`ButtonVariant`, `BadgeVariant`, `ChoiceSize`, …), and a
  test holds them all to the vocabulary.
- `shadcn-nsh init --theme shadcn` installs shadcn's neutral palette and its flat finishes, the
  registry item `theme-shadcn`. `nsh-ui.json` records which theme an app has (`"theme"`; a file
  without it is on the default one) and `add` resolves a component's `theme` dependency to it, so
  `--overwrite` never writes the default theme back. No component API changes.

Behaviour, appearance and the `nsh/base` props underneath are unchanged: every component still draws
the same pixels as its look spread on the base control, which the render check compares.
