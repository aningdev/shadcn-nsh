# Changelog

## Unreleased

### Added

- **`BubbleText` puts a paragraph on a bubble in its ink.** `BubbleContent` drew a string child in
  the bubble's type and ink, but anything else — a list of paragraphs, markdown rendered into
  text — had no way to read the variant: on the web the ink is inherited, NSH has none and the
  variant lives in a context a caller cannot read. `BubbleText` is a `Text` that reads it from the
  `Bubble` around it, and a string child of `BubbleContent` now draws through it (#33).
- **`MessageAvatar` takes children.** An icon or an `Avatar` draws in the round muted slot at the
  bottom of the row; without children, `name` and `src` work as before. (#32)
- **The message scroller takes commands.** `MessageScrollerItem` takes `messageId`;
  `useMessageScroller()` returns `scrollToMessage(id, { align, animated })`, `scrollToStart` and
  `scrollToEnd` (with `atStart` / `atEnd`); `MessageScrollerProvider` shares them with controls
  outside the frame; and `MessageScrollerViewport` forwards its `ScrollRef` (#31).

### Changed

- **Each theme has its own docs page (#44).** `/docs/themes` keeps the overview and links to one page per palette, and each of those pages has the same sections.
- **One radius, three tiers (#38).** A theme now states one base, `radius`: `radius-control` is
  0.8× it and `radius-card` is 1.4×, each rounded to whole points, and `check:theme` rejects a tier
  that is not. In the default theme controls go from 7 to 8 points and cards from 12 to 14, and a
  dialog takes the card tier (16 → 14); the shadcn theme's base goes from 8 to 10, its controls and
  cards staying 8 and 14. `radius-popover` is gone — a dialog uses `radius-card`, with no alias.
  Phone sheets and menu rows take their corners from the theme too, and every corner that reads a
  theme radius now has the continuous curve, applied in one place by `rounded()`.
- **The docs site is at https://shadcn-nsh.aning.dev.** It was at
  `https://aningdev.github.io/shadcn-nsh/`; the README and every docs link point at the new
  address.

### Fixed

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
