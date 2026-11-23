# Changelog

## Unreleased

### Added

- **Fields can draw a box with a stronger bottom edge, and `winui` fields do (#249).** `lib/indicator`'s `fieldPresets` takes a third `indicator`, `box-underline`: a `stroke.control` box in `colors.border` (`ControlStrokeColorDefault` in `winui`) whose bottom edge is `colors.input` (`ControlStrongStrokeColorDefault`), unchanged under the pointer and, with the keys, the bottom edge alone at `focus.width` of the accent (`destructive` when invalid) while the box keeps its color and no ring is drawn — WinUI's `TextBox` (`TextControlElevationBorderBrush`, `TextControlBorderThemeThicknessFocused` `1,1,1,2`) without the focus fill no role holds. `NumberInput`, `TimeField` (and the date picker's time row) and `OtpInput` read the preset too instead of hard-coding a `border` box, so `material`'s stepper, time well and OTP cells take the field's top-rounded, bottom-line frame and `winui`'s take the box. The helpers are renamed for the three values: `fieldRestEdge` and `fieldFocusEdge` (styles), `fieldFocusClass` (`underlineFocusClass`), `fieldEdgeClass` and `fieldCornerClass` (classes), `fieldIndicator` (`fieldUnderline`); `fieldRestColor` and `underlineFocusClass` are gone. Because the preset is the theme's at runtime, `timeFieldClass` is a function (`timeFieldClass()`) and `numberInputClasses.frame` a getter. `default`, `shadcn`, `solid-glass` and `apple` render pixel-identical; `winui`'s `Input`, `InputGroup`, `Select`, `Combobox`, `DatePicker`, `NumberInput` and `TimeField` are boxed where they were underlined.

- **Theme control geometry for `material` and `winui` `Progress`, `Spinner`, `Tabs`, and `Calendar` (#233, #235).** `semantics.json` adds `dimension.progress`, `dimension.spinner`, and `dimension.tabs` (shared) plus tiered `dimension.calendar` (`pointer`/`touch`), read via new `@shadcn-nsh/theme` getters `progressGeometry()`, `spinnerGeometry()`, `tabsGeometry()`, and `calendarGeometry()`. `Progress` renders a `4 dp` bar on `{slider-track}` (`SecondaryContainer`) without borders in `material` and a `3 px` bar centered over a `1 px` `ControlStrongStrokeColorDefault` hairline track in `winui`; `Spinner` drops the background ring (`has-track: false`) in both `material` and `winui` and uses `4 dp` / `40 dp` (`stroke-share: 10`) proportions in `material`; underline `Tabs` draws a label-width `3 px` indicator with top-only corners (`3 px 3 px 0 0`) in `material` and a `1.5 px` pill-capped `3 px` bar in `winui`; and `Calendar` renders `40×40` circular cells (`cell-shape: "pill"`) in both themes with `1 px` `primary`-outlined today cells in `material` and `primary`-filled today cells plus `2 px` accent-outlined selected cells in `winui`, while keeping `default`, `shadcn`, `solid-glass`, and `apple` pixel-identical. **Breaking for theme authors:** custom themes require `dimension.progress`, `dimension.spinner`, `dimension.tabs`, and `dimension.calendar`.

- **Theme control geometry and state roles for `material` and `winui` `Switch`, `Slider`, `Checkbox`, and `RadioGroup` (#233, #235).** `theme.json` adds one B-layer colour token (`slider-track`: `{color.brand-tint}` M3 `SecondaryContainer` in `material`, `{color.input}` `ControlStrongFillColorDefault` in `winui`, and `{color.track}` elsewhere, exposed as `colors.sliderTrack`); `semantics.json` adds `dimension.checkbox` (shared) and tiered `dimension.switch`, `dimension.slider`, and `dimension.radio` (`pointer`/`touch`), read via new `@shadcn-nsh/theme` getters `checkboxGeometry()`, `switchGeometry()`, `sliderGeometry()`, and `radioGeometry()`. `Switch` renders `52×32 dp` (`2 dp` off / `0` on outline, `16 → 24 → 28 dp` handle expansion) in `material` and `40×20 px` (`1 px` off / `0` on stroke, `12 → 14 → 17×14 px` thumb stretch) in `winui`; `Slider` renders a `4×44 dp` bar handle (`2 dp` pressed) on a `16 dp` `SecondaryContainer`/`Primary` track in `material` and an `18 px` outer ring with a `12 px` accent inner dot (`14` hover / `10` pressed) on a `4 px` track in `winui`; `Checkbox` and `RadioGroup` render `material` `18 dp` / `20 dp` outlined controls (`2 dp` stroke, `10 dp` inner dot, `40 dp` circular state-layer overlay target) and `winui` `ControlAltFillColorSecondary` rest wells with scaling radio inner dots (`12 → 14 → 10 px`), while keeping `default`, `shadcn`, `solid-glass`, and `apple` pixel-identical. **Breaking for theme authors:** custom themes require the `slider-track` colour token plus `dimension.checkbox`, `dimension.switch`, `dimension.slider`, and `dimension.radio`.

- **Theme roles and finishes for native Material and WinUI control states, card elevation, dialogs, and sheet grabbers (#233, #235).** `theme.json` adds ten B-layer colour tokens (`dialog`, `disabled`, `disabled-foreground`, `selected-foreground`, `pressed-foreground`, `accent-pressed`, `on-accent-pressed`, `card-edge`, `bevel`, `accent-bevel`); `semantics.json` adds `dimension.grabber`, `state["accent-pressed-opacity"]`, replaces `state.disabled.container` with `state.disabled.fill` (`boolean`), adds directional `border-top-color` / `border-bottom-color` finish fields, and adds four finishes (`section`, `disabled`, `accentPressed`, `grabber`). `Button` and `Toggle` render `finish.disabled` + `colors.disabledForeground` when `state.disabled.fill` is `true` (keeping whole-view `opacity: dimmed.disabled` when `false`), honour `colors.selectedForeground` on selected states, apply `finish.accentPressed` with `state["accent-pressed-opacity"]` and `colors.onAccentPressed` on pressed accent buttons, and support `pressed-foreground` and directional 1 px bevel borders without changing `default`, `shadcn`, `solid-glass`, or `apple`; `Card` and `sectionSurface()` read `finish.section` (keeping `finish.card` for `Sidebar`); `DialogContent` reads `finish.dialog` backed by `{dialog}` (`SurfaceContainerHigh` in `material`); and `sheetGrabber()` reads `dimension.grabber` + `finish.grabber` (`32×4` `OnSurfaceVariant` @ `0.40` in `material`). **Breaking for theme authors:** custom themes require the new tokens, finishes, `dimension.grabber`, `state["accent-pressed-opacity"]`, and `state.disabled.fill` (`boolean`, replacing `state.disabled.container`).
- **Per-theme `DESIGN.md` generated from DTCG 2025.10 sources (#246).** `bun run tokens:build` (via `scripts/tokens/design-md.ts`) now emits a Google Labs `DESIGN.md` (version `alpha`) per theme from `packages/theme/tokens/` and the compiled pointer-tier `light`/`dark` resolutions (`packages/theme/DESIGN.md` for the build-time `theme` item at the app root, and `packages/theme/themes/<id>/DESIGN.md` under `themes/<id>/` for each `theme-<id>` item). Color tokens carry `$extensions["dev.aning.shadcn-nsh"].role` (`surface` / `ink` / `brand` / `status` / `chrome`), theme/shared guidance and Do's and Don'ts come from root `$extensions["dev.aning.shadcn-nsh"].designMd`, `tokens:build --check` keeps all 7 files synced with sources, `@google/design.md` validates 0 lint errors and compiled value equality is tested in `scripts/tokens/build.test.ts`, and `init --theme <name>` / `add` ship `DESIGN.md` alongside `theme.json` and `{light,dark}.tokens.json`.
- **Per-appearance DTCG 2025.10 `.tokens.json` files shipped per theme (#237).** `bun run tokens:build` now emits standalone `light.tokens.json` and `dark.tokens.json` files (resolved per appearance at the `pointer` tier, with in-file `{...}` aliases preserved and 6-digit `hex` fallbacks on every color) alongside each theme's `theme.json` and `semantics.json` (`packages/theme/{light,dark}.tokens.json` for the build-time `theme` item at the app root, and `packages/theme/themes/<id>/{light,dark}.tokens.json` under `themes/<id>/` for each `theme-<id>` item). They are meant for importing directly into Figma Variables as Light/Dark modes, Tokens Studio, or Style Dictionary v4. These files are generated snapshots describing the theme as shipped — `lib/ui/theme.ts` does not read them at runtime, and they do not automatically follow later edits to `theme.json` or `semantics.json`.
- **A `winui` theme (WinUI 3 for Windows 11, #225, #240).** `winui` is WinUI 3 (`winui3/release/2.7.0`) as a theme: WinUI 3 fill and stroke resources composited over `SolidBackgroundFillColorBase` (`#F3F3F3` light / `#202020` dark, `#0078D4` default Windows accent, `brand` mapped to `AccentTextFillColorPrimary`, light `info` to `SystemAccentColor`, `brand-edge` composited over `primary`, `popover` to `AcrylicInAppFillColorDefault` fallback `#F9F9F9`/`#2C2C2C`, `dialog` border to `SurfaceStrokeColorDefault`), `inverse-muted` mapped to `TextFillColorSecondary` (`TeachingTip` keeps `SolidBackgroundFillColorTertiary`), `4 px` `ControlCornerRadius` for controls/fields/chips/insets and `8 px` `OverlayCornerRadius` for cards/overlays/dialogs/sheets with `circular` corners, `Segoe UI Variable` (`{font-sans}`) and `Consolas` (`font-mono`), `double` focus rings (`2 px` outer `FocusStrokeColorOuter` + `1 px` inner `FocusStrokeColorInner`), WinUI timing motion (`83`/`167`/`250`/`333 ms` with `decelerate` and `point-to-point`), `40 px` Standard list density (`density.pointer.row`), derived `shadow2/8/16/32/128` elevations, `underline` tab and field indicators, `bar` sidebar navigation indicators, and `material.windows` blur on `glass` (`0.85` light / `0.96` dark), `menu`, and `tooltip`. Generated from `scripts/theme/winui.ts` via `scripts/theme/generate-winui.ts`. `nativeTheme()` now returns `winui` on Windows, `registry.json` gains `theme-winui` (`theme-native` depends on it), `init --theme winui` installs it, the docs site switcher and `/docs/themes/winui` cover it, and `test:install` verifies it.
- **A `material` theme (Material 3 Expressive, #224).** `material` is Material 3 Expressive as a theme: tonal surfaces (`#6750A4` baseline with light `on*Container` Tone 30 and inverse Snackbar/Tooltip roles), capsule controls and 12/28 dp circular corners (`corners.field: "top"`), 48 dp touch / 44 dp pointer targets, 8/10/10/16% state-layer overlays with press ripples (`state.ripple: true`), `outline` focus rings (3 dp, 2 dp offset), Expressive springs with `emphasized-decelerate` enter timing, `underline` tab/field indicators, and `material.android.elevation` (1/3/6 dp) on elevated surfaces. Generated from `scripts/theme/m3.ts` via `scripts/theme/generate-material.ts`. `nativeTheme()` now returns `material` on Android, `registry.json` gains `theme-material` (`theme-native` depends on it), `init --theme material` installs it, the docs site switcher and `/docs/themes/material` cover it, and `test:install` verifies it.
- **`inverse-muted` colour role and `stroke.surface` outline width (#224).** `theme.json` adds `inverse-muted` (exposed as `colors.inverseMuted`, reading `var(--muted-foreground)` in `default`, `shadcn`, `solid-glass`, and `apple`, and `var(--inverse-foreground)` / `InverseOnSurface` in `material`) for secondary ink on `finish.inverse` (`Toast` description/spinner/close icon and `tooltipNote`). `semantics.json` adds `stroke.surface` (exposed as `stroke.surface`: `1` in `default`/`shadcn`/`solid-glass`, `0.5` in `apple`, `0` in `material`) for outline-free elevated/tonal surfaces (`Card`, `sectionSurface`, `insetSurface`, `Sheet`, floating/inset `Sidebar`, `Dialog`, `Popup`, `Listbox`, `Toast`, `Plot` tooltip, `RefreshIndicator`), leaving `stroke.hairline` for dividers and outlined variants. A theme you wrote needs the `inverse-muted` token (`check:theme` says so).
- **Cross-platform theme primitives for Material & WinUI 3 (#231).** `@shadcn-nsh/theme` and `packages/ui` now support: `focus.style: "double"` (a 1 px `ring-halo` line against the edge and the `focus.width` outline of `ring` just outside it, leaving `borderColor` untouched as `"outline"` does); `Spring | Timing` union on `motion.{press,settle,control,move}` (reactive across `selectTheme()`, dispatched via `animate()`, `follow()`, and `Roll` without changing existing caller behavior); M3 and WinUI 3 timing curves (`"standard"`, `"emphasized-decelerate"`, `"emphasized-accelerate"`, `"decelerate"`, `"accelerate"`, `"point-to-point"`); ink-aware `stateLayer(kind, ink?, under?)` gradient stacking and overlay-guarded `hovered(ink?, under?)` on accent, brand, destructive, and inverse surfaces; `state.ripple` press ripples on pressable looks and `material.android` (`ripple` + `elevation`) via `platformMaterial()`. All four shipped themes keep their existing values and look unchanged.
- **Themes can mark the selected tab, row and field (#227).** `semantics.json`'s `indicator` and `shape.corners.field` keys are read now: `indicator.tabs: "underline"` makes `TabsList` draw an underline instead of the pill's capsule (a `variant` still wins); `indicator.nav: "bar"` makes a selected `SidebarMenuButton` / `SidebarMenuSubButton` draw a short accent bar at its leading edge in place of the fill; `indicator.field: "underline"` makes `Input`, `Textarea`, `InputGroup`, `Select`, `DatePicker`, `Combobox` and `CodeEditor` draw a bottom line (muted at rest, `focus.width` of the accent while focused, no ring); `shape.corners.field: "top"` rounds a field's top corners only. The shared logic is the new `lib/indicator` (`fieldCorners`, `fieldEdgeWidths`, `fieldRestColor`, `navBar`, `navBarStyle`). Every shipped theme keeps `pill` / `fill` / `box` / `all`, so nothing changes on screen.
- **New colour roles and finishes for inverse surfaces, dialogs and tooltips (#227).** `theme.json` gains `inverse`, `inverse-foreground`, `inverse-brand` and `on-brand-tint`; `semantics.json` gains `dialog`, `tooltip` and `inverse`, and `@shadcn-nsh/theme` exposes them as `colors.inverse*`, `colors.onBrandTint` and `finish.dialog` / `tooltip` / `inverse`. `DialogContent` reads `finish.dialog`, `Tooltip` `finish.tooltip` and `inverse-foreground`, `Toast` `finish.inverse`, `inverse-foreground` and `inverse-brand` (the action's label), and a tinted `Bubble` `on-brand-tint`. The four shipped themes state them with the values the surfaces had, so they look as before; a theme you wrote needs the new keys (`check:theme` says which).

- **`PopoverContent` takes `class` and `style` for its surface (#216).** They go over `popoverLook` on the panel, as shadcn's `className` on the content does, so a panel that brings its own frame (an emoji panel) can drop the popover's padding: `style={{ padding: 0, overflow: "hidden" }}`.
- **An `apple` theme and `nativeTheme()` (#200).** `apple` is Apple's system palette and HIG metrics as a theme: capsule controls, 20-point cards, hairline edges, `systemBlue`, and Liquid Glass (`material.apple`) on the `glass`, `menu` and `raised` finishes, so a popover, toast or carousel button is glass on macOS 26+ and iOS 26+; the other finishes stay flat. It is generated by `scripts/theme/generate-apple.ts`. `nativeTheme()` from `themes/native` returns `apple` on iOS and macOS and the default theme elsewhere, for `selectTheme(nativeTheme())`. Registry gains `theme-apple` and `theme-native`, `init --theme` accepts `apple` and `native`, the docs site's theme switcher lists Apple, and `test:install` installs both. `check:theme` lets a theme whose `radius-control` is `999px` (a capsule) keep `radius-card` at or above `radius` instead of holding it to the 0.8× / 1.4× rule. No tokens or finishes were added. The native-themes spec is corrected: Mica is the window's `backdrop` (an app concern, with a recipe on the Theme page), and Android's blur and `borderRadius` transitions are supported, so only the accent color and the reduce-transparency / increase-contrast signals remain upstream gaps.
- **A finish can ask for the platform's own material (#199).** Every finish in `finishes.json` has `material`: `null` (every theme the library ships), or `apple: { glass, tint }`, `ios: { backdrop }`, `macos: { backdrop, blending, state }` and `windows: { backdrop }` with NSH's values. `themed()` adds `glassEffect` and `glassTintColor` to the finish's style for `apple` and never `material` itself; `platformMaterial(role)` from `@shadcn-nsh/theme` returns the `ios`, `macos` and `windows` props, reactive to `selectTheme` and the appearance, and `PopIn` (popover, hover card, navigation menu), `Toast`, `CodeEditorFindBar` and the glass `CarouselPrevious` / `CarouselNext` spread it. `check:theme` requires `material` on every finish and holds its values to the allow-list. Nothing changes on screen; the `Finish` type gains `material`, so a theme you wrote needs `"material": null` on each finish.
- **`Button` and `IconButton` take an `icon` (#214).** A lucide node, drawn in the look's size and tint (the variant, the size and the state; an icon button's accent while selected). A `Button`'s `busy` spinner takes the icon's place, and a new icon or the spinner grows in on `motion.control` (at once with reduced motion). NSH has no CSS cascade for an icon child to read its button's size and color from, so this is the prop shadcn does without. A child that changes beside other children (`{count()}`) is now drawn as the label's text too, where it was left as a bare string.
- **The docs site shows the version it documents (#197).** The nav carries `v<version>` next to the name on every page; while `CHANGELOG.md`'s `Unreleased` has entries the site, which deploys from `main`, is ahead of that release and the label reads `v<version>+`.

### Changed

- **Links in `default` and `solid-glass` are dark enough to read (#278).** `brand`, the link and small-mark ink, reaches WCAG AA (4.5:1) on the page in light mode: `default` `oklch(0.552 0.154 133.7)` → `oklch(0.533 0.154 133.7)` (`#4a840a` → `#447e00`), `solid-glass` `oklch(0.68 0.13 165)` → `oklch(0.49 0.12 165)` (its `brand-muted` wash keeps the lighter teal). Dark mode is unchanged.
- **Breaking (#266): the 27 finishes became the twelve layers a component is drawn on, and what a finish casts became one shadow scale per appearance.** `semantics.json`'s `finishes` now states twelve roles — `card`, `inset`, `raised`, `overlay`, `modal`, `inverse`, `glass`, `accent`, `knob`, `hover`, `pressed`, `disabled` — each with the same fields: a `foreground` (the ink on it, so no component carries a `?? colors.x` fallback), a `shadow` that names the parts of the theme's scale (`["{shadow.edge.surface}", "{shadow.sm}"]`) instead of writing a shadow, and optionally `gradient`, `backdropFilter` and the three border colours. The scale is DTCG `shadow` tokens in each theme's `light.tokens.json` and `dark.tokens.json` (`sm`, `md`, `lg`, `xl`, `inset`, `edge.surface`, `edge.accent`: at most four elevation steps, at most seven parts, a part a theme does not have is `$extensions.none` and a finish naming it skips it), compiles to `semantics.json`'s `elevation.{light,dark}` beside the finishes — never into `theme.json` — and `@shadcn-nsh/theme` reads it as `elevation("sm" | "md" | "lg" | "xl")`, beside `shape()` and `font`. `gradient` is now optional: a theme that paints flat leaves it out instead of writing a same-colour gradient. The fold: `section` → `card`; `field`, `track`, `groove` → `inset`; `chip`, `pill` → `raised`; `menu` → `overlay`; `tooltip` → `inverse`; `light`, `fill`, `on` → `accent`; `accentPressed` → `pressed`, whose accent press is `{ ...finish.accent, opacity: ACCENT_PRESS_OPACITY }` (`0.88`); `knobOn`, `handle`, `thumb` → `knob`, with what differs per control in its preset (`switch`'s `knobLook`, the slider's handle, segmented and tabs' thumb); `grabber` → the sheet's own preset (`alpha(colors.mutedForeground, 0.4)`). **Visible changes:** tooltips draw `inverse` (a dark bubble in `default`, `shadcn` and `solid-glass`, and `winui`'s tooltip takes the inverse fill); a progress bar, a switch that is on, and every selected surface read `accent` (the citrus progress gradient and `shadcn`'s `chart-1`/`chart-3` fills are gone — `port:render` shows the progress bar 15/255 apart with a colour under the old gradient); `material`'s and `shadcn`'s `pressed` lose their shadow (their scale has no `inset`); `apple`'s `raised`, `glass` and `hover` pick up the `0 1px 3px / 0.2` cast the knob had; `winui`'s knob and thumb lose their 2 px shadow (its `sm` is `none`; the strokes carry the shape) while `material`'s knob gains M3's level 1; `winui`'s tooltip follows `inverse`. `default`'s card keeps its exact `0 1px 0 / 0.04` as `md`.
  - in `semantics.json`: replace the finish roles with the twelve, give each a `foreground`, make `shadow` a list of `{shadow.*}` references, add `elevation.{light,dark}` (the scale, with `edge.{surface,accent}` where the theme has them), and drop every single-colour gradient;
  - in `theme.json`: nothing — the scale lives beside the finishes, and `elevation()` reads it;
  - in code: `finish.section` → `finish.card`, `finish.field`/`finish.track`/`finish.groove` → `finish.inset`, `finish.chip`/`finish.pill` → `finish.raised`, `finish.menu` → `finish.overlay`, `finish.tooltip` → `finish.inverse`, `finish.light`/`finish.fill`/`finish.on` → `finish.accent`, `finish.knobOn`/`finish.handle`/`finish.thumb` → `finish.knob`, `finish.accentPressed` → `{ ...finish.accent, opacity: ACCENT_PRESS_OPACITY }`, `finish.grabber` → your sheet's own preset, drop `?? colors.x` after a finish's `foreground`, and read `platformMaterial("overlay")` where you had `"menu"`.

- **Breaking (#265): heights, spacing, icons, type and springs each became one short scale; `stroke.surface` and `duration.shake` are gone and every theme declares both font families.** `semantics.json` drops `dimension.size.density.row` and `dimension.size.control.{row,control,check,tabs,line,clear}`: a row, a tab strip and a value line all read `dimension.size.height.lg` (`controlSize.row` / `.line` / `.tabs` are that height), `controlSize.control` and `.clear` read `dimension.icon.md`, and `.check` reads `dimension.icon.sm`. Heights are three 4-grid steps per tier (`default` 24/28/32 with a pointer and 32/40/48 on touch — 34 and 36 round to the grid; `apple` 24/28/32 and 32/44/56; `material` 32/40/56 both; `winui` 24/32/40 and 32/40/48) and icons are three steps as well (12/16/20 and 16/20/24 everywhere but `material`'s 16/20/24 on both tiers). Spacing reads `density.{pad,gap}` and `control.{padding,gap}`, every value drawn from `4, 8, 12, 16, 24, 32`: `default`'s 14-point card padding is 12 and its 6-point control padding 8, and `winui` keeps its official 6 (the single exception the lint is told about, with its source in `theme-roles.md`'s `theme-lint: scales` table). The type ramp no longer descends — `default`'s `title` was 13, under `label`'s 14, and is 16 — and line heights are whole points: DTCG's `lineHeight` is a multiple of the font size, so the generators state points, the DTCG source stores the ratio and `tokens:build` works the points back out (`font.lineHeight(role)` still returns points). Springs are three, named by speed (`fast` / `default` / `slow`) instead of by use (`press` / `settle` / `control` / `move`), each theme keeping its own tokens — `default` and `apple` 1218/70, 520/34, 320/30; `material` `FastSpatial` 800/33.94, `DefaultSpatial` 380/31.19, `SlowSpatial` 200/22.63; `winui` 83, 167 and 250 ms `decelerate`. `stroke.surface` folds into `stroke.hairline` (`material`'s surfaces lose the edge by writing `border-color: transparent` in their finishes, not by a 0 width) and `duration.shake` becomes a 500 ms constant in `packages/ui/lib/motion.tsx`. Every theme declares `font-sans` (the generic `system-ui`; WinUI's Segoe stack) beside `font-mono`, and the 7 typography composites carry `fontFamily: {font.family.sans}` — `typography.fontFamily`, its group extension and `font.family()` are gone, because NSH draws text in `font-sans` itself; a theme whose family is generic therefore has no `font-sans` token at all, and `check:theme` exempts it much as it exempts `radius`. `check:theme` gains `checkScales`: heights and icons must be three ascending 4-grid steps, spacing must come from the six values with at most three per tier, sizes must not descend and line heights must be whole numbers at least the size. **Visible changes:** a row, a tab strip and a value line now all equal the tallest height on the tier, so `default`'s rows go 36 → 32 with a pointer and stay 48 on touch, `apple`'s rows 44 → 56 and its tabs 36 → 56 on touch, `material`'s rows and tabs 48 → 56, and `winui`'s tab strips and value lines 32 → 40 with a pointer and 40 → 48 on touch (its rows stay 40); `default`'s card padding drops from 14 to 12 with a pointer and 16 to 12 on touch, its control padding grows 6 → 8, and its icons grow (`sm`/`md`/`lg` 12/14/15 → 12/16/20 with a pointer, 14/16/18 → 16/20/24 on touch), as do `apple`'s (12/14/16 → 12/16/20, 15/17/20 → 16/20/24) and `material`'s `sm` (18 → 16); `material`'s presses and slides move on M3's own `DefaultSpatial` spring and its panels settle on `SlowSpatial`, and `winui`'s panels settle in 250 ms. **To migrate a copied app / custom theme:**
  - in `semantics.json`: remove `dimension.size.density.row` and `dimension.size.control.{row,control,check,tabs,line,clear}`, keep `density.{pad,gap,surface}` and `control.{padding,gap,dot,switch}`, and make sure `dimension.size.height.{sm,md,lg}` and `dimension.icon.{sm,md,lg}` are three 4-grid steps per tier; drop `dimension.stroke.surface` (surfaces read `stroke.hairline`, or `border-color: transparent` in the finish), drop the `duration` group, and rename `motion.{press,settle,control,move}` to `motion.{fast,default,slow}`; write `lineHeight` as whole points and each role's `fontFamily` as `{font.family.sans}`;
  - in `theme.json`: add `font-sans` beside `font-mono`;
  - in code: replace `controlSize.row`-less reads of removed tokens with `controlSize.row` / `.line` / `.tabs` (all `height.lg`), move `stroke.surface` reads to `stroke.hairline`, `font.family()` to `mono()`/nothing (NSH draws `font-sans`), `motion.control` to `.fast`, `motion.press` and `motion.move` to `.default`, `motion.settle` to `.slow`, and read the shake from your own constant instead of `motion.shake`.

- **Breaking (#264): the six roles a control state needed folded into the `disabled` and `accentPressed` finishes, with the press alpha in the fill.** `theme.json` drops `bevel`, `accent-bevel`, `disabled`, `disabled-foreground`, `accent-pressed` and `on-accent-pressed`; `colors` and `colorRole` drop their getters (`colors.bevel`, `colors.accentBevel`, `colors.disabled`, `colors.disabledForeground`, `colors.accentPressed`, `colors.onAccentPressed`), and `state` drops `state["accent-pressed-opacity"]`. `finish.disabled` now states its own `background` (`{raised}` in `default`, `shadcn`, `solid-glass` and `apple`, `oklch(from {foreground} l c h / 0.1)` in `material`, `ControlFillColorDisabled` in `winui`) and its own `foreground` (`{muted-foreground}` / `oklch(from {foreground} l c h / 0.38)` / `TextFillColorDisabled`); `finish.accentPressed` carries the press in its fill (`oklch(from {primary} l c h / 0.88)`, `AccentFillColorTertiary` 80 % over the base in `winui`, plain `{primary}` in `material`, whose press is a state layer) and its own `foreground` (`{primary-foreground}` / `TextOnAccentFillColorSecondary`). A bevel is a finish border: `raised` and `hover`'s bottom and `light`, `accent` and `on`'s top and sides read `{border}` / `{brand-edge}` in the five themes and WinUI's own `ControlStrokeColorSecondary` / `ControlStrokeColorOnAccentDefault` composites in `winui`. `Button` and `Toggle` draw a disabled label with `finish.disabled.foreground` (and `Toggle`'s closed outline with its `borderColor`) instead of the two roles, and a pressed accent button spreads `finish.accentPressed` without the whole-view `opacity`, so the fill carries the 88 % alone and its border and shadow paint at full strength: **in `default`, `shadcn`, `solid-glass` and `apple` the accent button's shadow no longer fades while pressed** (`solid-glass` also keeps its `brand-edge` edge at full alpha), `material` and `winui` render identical. **To migrate a copied app / custom theme:** in `theme.json` remove the six keys; in `semantics.json` drop `state["accent-pressed-opacity"]`, give `disabled` a `background` and a `foreground`, and give `accentPressed` a `background` with its alpha and a `foreground`; in code replace `colors.disabled` / `colors.disabledForeground` with `finish.disabled.background` / `finish.disabled.foreground`, and `colors.onAccentPressed` with `finish.accentPressed.foreground` (a relative `oklch(from {token} …)` fill needs `alias()` only through `finish`, never written out by hand).

- **Breaking (#263): thirteen colour roles that named a component folded into the roles they already equaled, finish `dialog` became `modal`, and `state` gained `rest-opacity`.** `theme.json` drops `dialog`, `code`, `chart-foreground`, `brand-fill`, `on-brand`, `scrollbar-thumb`, `scrollbar-thumb-hover`, `window-close`, `window-minimize`, `window-zoom`, `window-control-ink`, `window-control-edge` and `window-control-off`; `colors` and `colorRole` drop their getters, and the `windowControls` export is gone. A dialog's face is the `modal` finish (`finish.dialog` → `finish.modal`): `default`, `shadcn`, `solid-glass` and `apple` state `{card}` with the menu's shadow, `material` keeps its own `SurfaceContainerHigh` fill, `winui` `{background}` with its 128 px shadow and `SurfaceStrokeColorDefault` edge — the value every theme already drew. Code reads `foreground` (`CodeBlock`, the chat markdown's code, the dock), a light chart tile's ink reads `foreground` (`on-media` already covered dark tiles), and the accent's fill and ink read `primary` / `primary-foreground`, which all six themes already aliased (`carousel`, `checkbox`, `radio-group`, `slider`, `switch`, `toast`, `button`, `tailwind`, and the demos' own `colors.brandFill` / `colors.onBrand`). The scrollbar's thumb reads `alpha(colors.mutedForeground, dimmed.rest)` — the new `state["rest-opacity"]` (`0.5`) — instead of the two `scrollbar-thumb*` tokens, and its hover now only widens the thumb: **the thumb no longer darkens under the pointer, in every theme.** The macOS traffic lights' three hues, their 50 % black glyph ink and 12 % black edge are written out in `packages/ui/title-bar.tsx` (`lightTone`, `lightInk`, `lightEdge`), since a window's close, minimize and zoom keep Apple's colours whatever the theme (`ARCHITECTURE.md` P3 records the exception); an unfocused bar draws their disc in `colors.foreground` at 14 %. Five shipped themes render pixel-identical; `default`'s code ink loses its softer tone (`oklch(0.29661 0.01168 264.381)` → `oklch(0.18636 0.01318 264.182)` light, `oklch(0.89621 0.00927 258.337)` → `oklch(0.95193 0.00289 264.542)` dark), and in every theme the scrollbar's thumb no longer darkens under the pointer. **To migrate a copied app / custom theme:** in `theme.json` remove the thirteen keys; in `semantics.json` rename the `dialog` finish to `modal` and add `state["rest-opacity"]: 0.5`; in code replace `finish.dialog` with `finish.modal`, `colors.code` / `colors.chartForeground` with `colors.foreground`, `colors.brandFill` with `colors.primary`, `colors.onBrand` with `colors.primaryForeground`, `dimmed.pressed` with `dimmed.rest` for a passive indicator, and any `windowControls` read with your own window chrome.

- **Breaking (#262): seven colour roles folded into existing roles and finish `foreground`.** `theme.json` drops `down`, `on-brand-tint`, `selected-foreground`, `pressed-foreground`, `inverse-muted`, `card-edge`, and `slider-track`; `colors` and `colorRole` drop their getters. A data loss reads `destructive` (tone `down` still resolves to it, and `down-tint` stays); `Bubble`, `Button`, `Toggle`, and `Checkbox` state layers read `accent-foreground`; a selected `Button`/`Toggle` label reads `finish.on.foreground`, a pressed one `finish.pressed.foreground`, and a pressed accent one keeps `colors.onAccentPressed`; `Toast` and `tooltipNote` read `finish.inverse.foreground`; `Card` and `sectionSurface` read their finish's `border-color` (`winui` `CardStrokeColorDefault`, `material` transparent); and `Slider`/`Progress` presets carry `trackRole` (`track`, `brand-tint`, or `input`). The six themes' `sidebar-*` values become aliases of the roles they equal (`sidebar-accent` → `accent`, `sidebar-accent-foreground` → `accent-foreground`, `sidebar-border` → `border`/`line`, and so on), except where light and dark differ. `Finish` and `FinishStyle` gain `foreground`, read as the text style key `color`; `themed()` exposes it from a non-enumerable getter so `{...finish.on}` still spreads only view styles. **`tooltipNote` is now a function** returning `TextStyle`: migrate `class={tooltipNote}` to `style={tooltipNote()}`. All six shipped themes render pixel-identical; a custom theme needs the seven roles removed, `foreground` on `pressed`, `on` and `inverse`, and `border-color` on `card` and `section`.

- **Breaking (#253): corner radius roles collapsed from 8 family-named tokens to 3 layer roles plus `shape.corners.button`.** `theme.json`'s `cssVars.theme` and DTCG `dimension.radius` drop `radius-field`, `radius-chip`, `radius-card`, `radius-overlay`, `radius-dialog`, and `radius-sheet` (and DTCG `dimension.radius.base`), keeping `radius-control`, `radius-container`, and `radius-modal`, while the A-layer `radius` slot in `theme.json` is now compiled from `radius-control` (which shifts Tailwind `rounded-*` utilities in apps that previously relied on `radius` being `10px`). `semantics.json` replaces `dimension.shape.{control,field,chip,card,overlay,dialog,sheet,inset}` with `dimension.shape.{control,container,modal}` (`"{radius-control}"`, `"{radius-container}"`, `"{radius-modal}"`), removes `dimension.size.control.corner` (moved into `checkboxPresets.corner` in `packages/ui/checkbox.tsx`), and adds `shape.corners.button: "full" | "radius"` (`shape.button` resolves to `999` for capsule buttons when `"full"`, else `shape.control`). Nested surfaces derive their radii concentrically via `rounded(outer, inset)` (`Math.max(outer - inset, 0)`) instead of reading `shape.inset`. **Visible changes:** in `material` and `apple`, `shape.control` is now `4px` and `8px` respectively so inputs, `Select` / `Combobox` triggers, listbox rows, chips, badges, wells, and `ColorPicker` areas are no longer pills, while buttons (`Button`, `IconButton`, `SplitButton`, `Toggle`, `ButtonGroup`, `Pagination`, `Calendar` header buttons) remain capsules via `shape.button`; cards, menus, popovers, rich tooltips, list panels, and toasts share `shape.container` (`12px` in `default` / `shadcn` / `apple` / `material`, `14px` in `solid-glass`, `8px` in `winui`), and dialogs, sheets, and drawers share `shape.modal` (`14px` in `default` / `shadcn`, `20px` in `solid-glass`, `26px` in `apple`, `28px` in `material`, `8px` in `winui`). On the design-tool side, exported `{light,dark}.tokens.json` snapshots and `DESIGN.md` omit `dimension.radius.base`, `dimension.size.control.corner`, and the 8 old `dimension.shape.*` keys, emitting `dimension.radius.{control,container,modal}`, `dimension.shape.{control,container,modal}`, and `shape.$extensions["dev.aning.shadcn-nsh"].corners.button` instead. **To migrate a copied app / custom theme:**
  - in custom `theme.json`: remove `radius-field`, `radius-chip`, `radius-card`, `radius-overlay`, `radius-dialog`, and `radius-sheet`, keep `radius-control`, `radius-container`, and `radius-modal`, and set `radius` equal to `radius-control`;
  - in custom `semantics.json`: replace `dimension.shape.{field,chip,card,overlay,dialog,sheet,inset}` with `dimension.shape.{control,container,modal}` (`"{radius-control}"`, `"{radius-container}"`, `"{radius-modal}"`), remove `dimension.size.control.corner`, and add `shape.corners: { "button": "radius" }` (or `"full"` for capsule buttons);
  - in code: replace removed `shape` getters from `@shadcn-nsh/theme` (`shape.field` / `shape.chip` / `shape.inset` → `shape.control`, `shape.card` / `shape.overlay` → `shape.container`, `shape.dialog` / `shape.sheet` → `shape.modal`, button-like controls → `shape.button`, nested surfaces → `rounded(outer, inset)`), remove any reads of `style().dimension.size.control.*.corner` or `controlSize.corner` (use `checkboxPresets` in `components/ui/checkbox.tsx`), and update Tailwind `rounded-(--radius-card|field|chip|overlay|dialog|sheet)` classes to `rounded-(--radius-control|container|modal)`.

- Select, combobox and command rows mark the highlighted row with the brand tint alone, as shadcn/ui and M3 menus do; the `brand/30` outline around it is gone, and rows keep their size (#253).

- **Breaking (#261): control geometry, indicator choices, and grabber sizing moved from themes into component presets behind `controls`.** `semantics.json` removes `dimension.{checkbox,switch,slider,radio,progress,spinner,tabs,calendar,grabber}`, `dimension.stroke.indicator`, `shape.corners` (`shape.corners.field`), and the `indicator` group (`indicator.{tabs,nav,field}`), replacing them with `controls: "base" | "material" | "winui"` (exported reactively from `@shadcn-nsh/theme` as `controls()` with `type Controls`). Each owning component (`checkbox.tsx`, `switch.tsx`, `slider.tsx`, `radio-group.tsx`, `progress.tsx`, `spinner.tsx`, `tabs.tsx`, `calendar.tsx`, `sheet.tsx`, `sidebar.tsx`) and shared field indicator helper (`lib/indicator.ts` for `input`, `select`, `combobox`, and `code-editor`) now carries its own `Record<Controls, …>` preset table. On the design-tool side, exported `{light,dark}.tokens.json` snapshots and `DESIGN.md` follow the same schema: per-control geometry (`dimension.{checkbox..calendar,grabber}`), `dimension.stroke.indicator`, `shape.corners.field`, and `indicator` are no longer exported, and `controls` is emitted instead. All 6 shipped themes render pixel-identical. **To migrate a copied app / custom theme:**
  - in custom `semantics.json`: drop `dimension.{checkbox,switch,slider,radio,progress,spinner,tabs,calendar,grabber}`, `dimension.stroke.indicator`, `shape.corners` (`field`), and `indicator` (`tabs`, `nav`, `field`), and add `"controls": "base"` (or `"material"` / `"winui"`);
  - in code: replace deleted getters and helpers from `@shadcn-nsh/theme` (`checkboxGeometry`, `switchGeometry`, `sliderGeometry`, `radioGeometry`, `progressGeometry`, `spinnerGeometry`, `tabsGeometry`, `calendarGeometry`, `stroke.indicator`, `style().dimension.grabber`, `style().indicator.*`, `style().shape.corners.field`, `*Dim` interfaces, and `ChoiceWell`) with `controls()` (and `ChoiceWell` from `components/ui/checkbox.tsx`, `navBar` / `navBarStyle` from `components/ui/sidebar.tsx`), or pick `"base" | "material" | "winui"` via `controls` / override the component's style or preset table directly in your copied app.

- **Breaking:** **`semantics.json` and `theme.ts` use DTCG 2025.10 names (#237).** The compiled semantics file now names its fields the way the DTCG source in `packages/theme/tokens/` does. Every shipped theme renders the same as before. **To migrate a copied app:**
  - in code: `font.line(role)` → `font.lineHeight(role)` (still points), `font.tracking(role)` → `font.letterSpacing(role)`, `TypeRole` → `TypographyRole`, `Timing.easing` → `Timing.timingFunction`. The `finish.*` getters still return NSH style keys (`backgroundColor`, `boxShadow` …);
  - in `style()` / `semantics.json`: `type` → `typography` (`size` → `fontSize`, `line` → `lineHeight` as a ratio, `weight` → numeric `fontWeight`, `tracking` → `letterSpacing`, `family` → `fontFamily`); the `shape` radii, `size`, `stroke`, `focus` and `icon.size` move under `dimension` (`dimension.icon`), and `shape` keeps `curve` and `corners`; `state.pressScale` → `state["press-scale"]`, `state.pressedOpacity` → `state["pressed-opacity"]`; `motion.shake` → `duration.shake`, `motion.enter` → `transition.enter`; timing roles use `timingFunction` instead of `easing`;
  - in finishes: `backgroundColor` → `background`, `backgroundImage` → `gradient`, `boxShadow` → `shadow`, `borderColor` → `border-color`;
  - an unedited `lib/ui/semantics.json`: `shadcn-nsh add theme --overwrite` (or `init --theme <name> --overwrite`) replaces it. An edited one: move its keys to the new names by hand.

- **Breaking:** **design-semantics standard: `theme.json` tokens and `semantics.json` (#228).** Theme data is split into flat NSH base tokens (`theme.json`: colors, all eight `radius-*` lengths, and fonts) and the cross-platform semantic layer (`semantics.json`: tiered sizes and type scale, enums, motion, and split `finishes`, referencing base tokens with `{token}`), so every value lives once and host `setThemeOverrides` reaches `shape.*` and `font.family()`. Every shipped theme stays pixel-identical. **To migrate a copied app:**
  - rename `lib/ui/finishes.json` to `lib/ui/semantics.json` (and any `themes/<name>/finishes.json` to `semantics.json`, updating `themes/<name>/index.ts` to pass `semantics` instead of `finishes` on `AppTheme`);
  - add the five new `radius-*` tokens (`radius-field`, `radius-chip`, `radius-overlay`, `radius-dialog`, `radius-sheet`) to `theme.json`'s `cssVars.theme`;
  - change `shape.*` (`control`, `field`, `chip`, `card`, `overlay`, `dialog`, `sheet`, `inset`) in `semantics.json` to `"{radius-…}"` token references;
  - change `var(--x)` references inside `semantics.json` finishes (including `oklch(from var(--x) l c h / a)` and `material.apple.tint`) to `{x}`;
  - restructure `finishes` into `shared` plus sparse `light` / `dark` overrides (`finishes: { shared, light, dark }`);
  - move top-level `press.scale` into `state.pressScale` (the `press.scale` getter in `lib/ui/theme.ts` stays and reads it);
  - `withFamily()` is gone — declare `font-sans` in `theme.json`'s `cssVars.theme` and set `type.family` to `"{font-sans}"` (or `null` for the system font), read reactively via `font.family()`;
  - `shadcn-nsh add` (and `init --theme` without `--overwrite`) now key-merges `semantics.json` alongside `theme.json` — adding missing style keys, finish roles, and finish fields while keeping values the app already set — and `diff` compares both files by key; run `shadcn-nsh add theme --overwrite` (or `init --theme <name> --overwrite`) to replace `lib/ui/theme.ts` and `lib/ui/semantics.json` if you have not customized them.

- **The home page answers the first questions (#210).** The hero says "NSH components you copy into your app"; "See it running" gains a Desktop | Phone switch and an Open in new tab button over the showcase app; "Why shadcn-nsh" and "Start with one component" give way to an FAQ (official or not, shadcn/ui and React, copying and updates, platforms, NSH version, themes, AI assistants, license) that ends with a Get started link.
- **The home page runs the showcase app (#208).** “See it running” embeds the showcase app itself, the Gallery shell and its scenes with the theme and appearance switched inside it, in place of the theme demo and a link. The separate `/showcase` page is gone; the app is packaged to `public/showcase/`.

### Fixed

- **`apple` popups blur what is behind them where Liquid Glass is not drawn (#251).** The `menu`, `raised` and `inverse` finishes asked for `glassEffect` over a translucent fill with no `backdropFilter`, so below iOS / macOS 26 (and on other platforms) a `Select`, `Combobox`, `Popover`, menu or toast showed the text behind it unblurred. They now carry `blur(30px)`, which NSH draws when glass is not available. `menu`, `raised` and `inverse` state `backdropFilter` in every shipped theme (`"none"` outside `apple`, so nothing else changes on screen), and `check:theme` rejects a finish that asks for `apple` glass over a translucent fill without a blur. **Breaking for theme authors:** a custom theme needs `backdropFilter` on `menu`, `raised` and `inverse`.
- **`Select`, `DatePicker` and `Combobox` keep hearing presses after a runtime theme switch (#203).** A `selectTheme` that changed `control.line` remounted their base root, which then ignored the next press. `apple`'s pointer `control.line` is back to the HIG value, 28.
- **`SplitViewTrigger`'s icon follows the appearance and the theme (#202).** It read its glyph once at mount, so the icon kept the mount-time color after a switch to dark or a `selectTheme`.

## 0.9.0 — the Gallery's parts, style roles in themes, and `lib/ui`

### Added

- **Toolbar overflow (`ToolbarItem`, `ToolbarOverflow`, and `ToolbarGroup` `priority` / `fold`) (#187).** A bar with `ToolbarOverflow` measures each `ToolbarItem` with `onLayout` and folds lower-priority tools—or whole `fold="unit"` `ToolbarGroup`s—into the `"⋯"` menu in bar order, grouped by the group's `accessibilityLabel`, while owning the rules between visible units, hiding on the first frame until measured, and keeping unmeasured items visible. Bars without `ToolbarOverflow` are unchanged, and the showcase's Toolbar formatting scene drops its hand-written width table for the new parts.
- **`iconImage` turns an icon into an image (#149).** A native menu takes an image, not a view:
  `iconImage(icon, { weight, ink })` from `lib/icons` writes a lucide node as an SVG `data:` URL,
  stroked in `currentColor` so a menu draws it in its own text color, or in a fixed `ink` where a
  template image's `tintColor` recolors it instead — which is how `CheckMark` draws its check now.
  The icons page shows `Menu.popup`'s items with it, and the showcase's System scene drops its own
  copy of the conversion.
- **`title-bar` (#181).** The bar a desktop window drags by, the buttons a frameless window draws for itself, and the edges that resize it: `TitleBar` is a hidden title bar's drag region — `TITLE_BAR_HEIGHT` (40) tall, or the height the system's bar has, padded clear of the system's buttons by `titleBar().left` and `.right` — and draws nothing where the app has no window of its own; `WindowControls` (`variant` `traffic-lights` for macOS's three discs at the leading end, `caption` for Windows' and Linux's cells at the trailing one) puts each button on `desktop`'s `windowControl`, so the platform carries out the press, shows the glyphs while the pointer is over them, and turns the lights grey while the window is in the background; `WindowResizeEdges` is a frameless window's eight resize strips, last in the window's root. `titleBarLook()`, `TRAFFIC_LIGHT` and `CAPTION_BUTTON` are exported. The page has **Traffic lights**, **Caption buttons** and **Your own window controls**; the showcase's Windows scene draws its document window's bar, buttons and edges with the parts instead of by hand.
- **`CodeEditor` gains a find bar (#180).** `CodeEditorFindBar({ editor, search, onSearchChange, result, onClose })` is the query field with its count, the three modes (`Aa`, `W`, `.*` for case, whole word and regular expression), previous and next, and a replacement row that runs the editor's own `replace` and `replaceAll`, saying how many a Replace all rewrote for a moment. The bar edits **the same object the app hands the editor's `search`** and reads the `result` the editor reports from `onSearchChange`, so a query set elsewhere reads in it; it takes the editor's `ref` because replacing is a ref call. Where it sits and whether it is open are the app's — it is the editor's sibling in the same `View` — and Escape and `mod+f` stay the app's `keymap`. The showcase's Editor scene drops its own 116-line bar for it, and the page has **Composition** and **Find and replace**.
- **`collapsing-header` (#182).** A page's header that shrinks into a bar as the page scrolls: `CollapsingHeader({ scroll, expandedHeight, collapsedHeight })` takes the scroll view's `scrollValue`, and its parts — `CollapsingHeaderBackdrop` (a picture travelling at half the scroll, stretching on over-scroll), `CollapsingHeaderDescription`, `CollapsingHeaderBar` and `CollapsingHeaderTitle` (scaling into the bar) — follow it in animated styles, with no JS per frame. Reduced motion drops the picture's travel and stretch; a terminal snaps the heights to whole rows and draws no picture. `collapsingHeaderLook()` is exported, its `heights` giving the bar a list's `stickyHeaderOffset` takes. The page has **A week's page**, **An action in the bar** and **A header with no picture**; the showcase's Collapsing header scene uses it in place of its own drawing.
- **`refresh-indicator` (#174).** The round chip a pull to refresh draws over a scroll view: `RefreshIndicator({ pull, refreshing, height })` takes the `AnimatedValue` the scroll view feeds through `pullValue`; its opacity, travel and scale follow the pull on the UI thread, the arrow turns over past half of `height`, and a ring spins while `refreshing` (it stands still with reduced motion). The call site keeps `refreshIndicator`, `pullValue`, `onRefresh` and `refreshing`. `refreshIndicatorLook()` and `REFRESH_INDICATOR_HEIGHT` are exported. The page has **Pull to refresh** and **The system spinner**; the showcase's List scene uses it in place of its own drawing.
- **Item shows a long list, and Tree a large one (#174).** Item's `### A long list` puts contacts in `ItemGroup` rows inside a `List` with a heading per letter that sticks; Tree's `### A large tree` is a hundred folders of a hundred files, virtualized. No component API changes; each demo's reference draws the same scene.
- **`ProgressSteps` and `ProgressStep` mark steps on a bar (#175).** Under a `Progress`, each step is `done` (a check that pops in), `current` (a ring and a dot) or `upcoming`, with its label under the mark; reduced motion lands each at once. `progressStepsLook()`, `ProgressStepMark` and `progressStepSize()` are exported. `### Steps` shows a bar to the current step with Back and Next; the showcase's Progress scene uses them.
- **Chips and a bubble's tail are recipes (#175).** `### Chips` on `toggle` (a single-select capsule row: `ToggleGroup inset={false}`, a `gap`, `borderRadius: 999` on each `Toggle`) and `### A tail` on `bubble` (`borderBottomEndRadius` on `BubbleContent`) answer what shadcn/ui does with a class at the call site; no API was added.

- **Plot shows a sparkline, bars with a donut, and candles over volume (#167).** `### A sparkline` puts a
  104 × 38 line in a watchlist row: a wash under it, yesterday's close dashed, the newest point
  ringed. `### Bars and a donut` pairs stacked bands with a baseline and a hole holding the total.
  `### Candles with volume` draws a close←open bar and a low←high rule over a second plot of the same
  days' volume, on its own axis.
- **Stat shows a trend beside a figure (#167).** `### A trend beside a figure` sets a composite
  figure and its change in the line's tone beside the day's sparkline.
- **NavStack shows a large title and a guarded back (#167).** `### A large title` keeps the large
  title in the scroll and shows the small one in a header of the app's own; `### Asking before
  leaving` turns `popOnBack` off while a draft has text, asks in an `AlertDialog`, and pops only on
  Discard.
- **Sheet shows detents and a draft its footer applies (#167).** `### Detents` rests comments at
  medium with the grabber and a composer's footer; `### A draft the footer applies` edits filters as
  a draft with `Reset` and `Show N results` in the footer, and closing discards it.
  No component API changes; each demo's reference draws the same scene.
- **Six docs pages show eight examples at work (#166).** `Command` gains `### A long list` (5,000
  files in fifty folders, searched by name and by extension, the count under the field coming from
  `matchedCount()`); `Pagination` gains `### A jump menu` (an elided run that opens a menu of the
  pages it hides); `Carousel` gains `### Autoplay` (a timer the app owns, on hold under the pointer,
  on focus and while dragging); `Toolbar` gains `### A formatting bar` (the history graying out at
  its ends, the block as a menu whose trigger is one of the bar's items); `RichEditor` gains
  `### A formatting toolbar` (every control reading the caret, disabled where its command cannot
  run), `### A link bubble` (`bubbleMenu`, filled by the app while the caret is in a link, with
  edit, open and remove) and `### A node in the text` (a `mention` node drawn by the app's own
  component); `CodeEditor` gains `### Hover and quick fixes` (`onHover`'s word box anchoring an
  `Overlay` that carries the diagnostics there and their fixes). No component API changes; each
  demo's reference draws the same scene.
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
- **A `media` ground the theme owns (#156).** `theme.json`'s shared values gain `media` (`oklch(0.1869 0.0151 266.766)`, `#10131a`), the ground a photograph, a film or a shader panel sits on: it is dark in light and in dark, and the same in all three themes, so `colors.media` under `colors.onMedia` reads the same wherever it is used (18.6:1). The showcase's Shader scene draws its panels, its Code rain chip and its photo tiles on it in either appearance, and `ImageViewer`'s ground is it; `docs/specs/theme-roles.md`'s C layer states the pair.
- **`image-viewer` (#169).** One image full screen, open while `image` (`{ src, alt? }`, the shape `TextView`'s `onImagePress` reports) is set: `ImageViewer` is a `Dialog` as a page (`dialogPage`) over the theme's `media` ground, the image fitted, a pinch to 4×, a double tap or click to 2.5×, a drag to pan and a swipe down to close (`onClose` also on the close button, Escape and a press on the ground); the `alt` text is the caption, in `on-media` ink. `imageViewerLook()` is exported. There are no `ImageViewerClose` or `ImageViewerCaption` parts: both are always drawn. `TextView`'s page gains `### Images that open`, and the showcase's chat and TextView scenes use it in place of their own lightboxes.
- **`dialogPage()` fills the window when passed as `style` (#169).** It now sets `width` and `maxHeight` too, so the card's width and height cap no longer survive under it: a lightbox that passes it to `DialogContent` covers the window instead of a 360-point column.
- **`code-block` (#160).** Code, a command's output or a log in a block, after shadcn/ui's `CodeBlock`: `CodeBlock` (`variant` `default | destructive`, `size` `default | sm`), `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockActions`, `CodeBlockCopyButton` (a ghost `IconButton` that writes `value` to the clipboard and shows a check for two seconds, its `accessibilityLabel` "Copy" then "Copied"), `CodeBlockContent` (a string or lines; `lineNumbers`, `startLine`, `wrap`; sideways scroll without a bar), `CodeBlockLine` (`variant` `default | highlighted | added | removed`) and `CodeBlockFooter`. The code is plain mono: no tokenizer, so no highlighting. The showcase's AI Chat draws a code tool's result with it instead of by hand.
- **`trace` (#168).** An agent's steps, one line each, after shadcn/ui's `Trace`: `Trace`, `TraceLine` (`status` `running | pending | error`; with `onPress` it is a pressable), `TraceIcon` (a `Spinner` while the line is `running`), `TraceTitle` (pulses while `running`, still with reduced motion), `TraceDescription`, `TraceCollapsible` (`open`, `defaultOpen`, `onOpenChange`, as `Collapsible`), `TraceCollapsibleTrigger` (a trailing chevron that turns as it opens) and `TraceCollapsibleContent`. The page's demo plays a streaming turn — reasoning that counts and opens, a tool call that goes queued → running → done and opens onto a `CodeBlock`, sources, a failed step. The showcase's AI Chat draws its reasoning and tool rows with it instead of by hand.
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

- **Breaking:** **shared library files install under `lib/ui/` instead of `lib/` (#192).** `init` and `add` now place `theme.ts`, `finishes.json`, and every `registry:lib` module (`press.ts`, `motion.tsx`, `icons.tsx`, …) under `lib/ui/` (`DEFAULT_CONFIG().aliases.lib` is `./lib/ui` and `aliases.theme` is `./lib/ui/theme`), keeping the app's `lib/` clear of library files. **To migrate:** move the installed library files from `lib/` into `lib/ui/` and update `@/lib/<name>` imports in your app to `@/lib/ui/<name>`, or re-run `shadcn-nsh init` / `shadcn-nsh add --overwrite` (and update `nsh-ui.json`'s `aliases.lib` / `aliases.theme` if present).

- **`ImageViewer`'s ground is the `media` role (#156).** The viewer fills the window with `colors.media` and writes on it in `on-media`, instead of stacking the theme's `scrim` over the dialog's: the same near-black in either appearance, at full strength rather than a wash. Apps that spread `imageViewerLook().ground` follow; an app that set its own `backdropStyle` on the viewer keeps it, under the ground.
- **Components read the theme's type roles (#154).** Font weight, and the font size wherever a role has the same size in both tiers, now come from `finishes.json`'s `type` through `font.size`, `font.weight`, `font.line` and `font.tracking` (exported from `@shadcn-nsh/theme`), so `selectTheme` restyles text on the next frame. `type.family` is written into `font-sans` when a theme is selected. Nothing changes on screen: the default `type.*.line` values are the line heights the components drew, and sizes with no matching role stay in code with a comment.
- **Components read the theme's shape, state, stroke, focus and size roles (#154).** Corners come from `shape` by what the component is (`control`, `field`, `chip`, `card`, `overlay`, `dialog`, `sheet`, `inset`), line widths from `stroke` (`hairline`, `control`, `indicator`), the pressed and disabled fades from `state`, a button's height and icon from `size.height` and `icon.size`, and the touch target from `size.hit`; `@shadcn-nsh/theme` exports `shape`, `stroke`, `dimmed`, `stateLayer`, `controlHeight`, `iconSize` and `hitTarget` for them, so `selectTheme` restyles them on the next frame. `rounded(radius, inset)` takes an `inset` for concentric corners (the outer radius less the inset, never below 0). A theme whose `state.overlay` is above 0 gets its hover as a wash of the text color (`hovered()`). Nothing changes on screen: the default values are the numbers the components drew.
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

- **`radius`, `TOUCH_TARGET` and `stroke.focus` (#154).** `radius.control`, `radius.card` and `radius.inset` are `shape.control`, `shape.card` and `shape.inset`; the touch target is `hitTarget()` (`size.hit`); the focus ring's width is `focus.width` alone, so the duplicate `stroke.focus` key is gone from every theme's `finishes.json`.
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

- **The docs link `code-block`, `toast` and `trace` to their shadcn/ui pages (#176).** The table of shadcn/ui's components now reads `registry/bases/base/ui`, shadcn's current set, so these pages show `shadcn/ui ↗` and the coverage page lists `questionnaire` as missing. `form`, which that set no longer has, is gone from it.
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
