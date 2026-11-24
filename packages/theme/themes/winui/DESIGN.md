---
version: alpha
name: "WinUI 3"
description: "WinUI 3 theme (Windows 11, winui3/release/2.7.0)."
colors:
  scrim: "#0000004d"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#f3f3f3"
    foreground: "#1a1a1a"
    card: "#fbfbfb"
    card-foreground: "#1a1a1a"
    popover: "#f9f9f9"
    popover-foreground: "#1a1a1a"
    primary: "#005fb8"
    primary-foreground: "#ffffff"
    secondary: "#fbfbfb"
    secondary-foreground: "#1a1a1a"
    muted: "#eeeeee"
    muted-foreground: "#5c5c5c"
    accent: "#eaeaea"
    accent-foreground: "#1a1a1a"
    destructive: "#c42b1c"
    border: "#868686"
    input: "#868686"
    ring: "#1a1a1a"
    chart-1: "#005fb8"
    chart-2: "#0f7b0f"
    chart-3: "#9d5d00"
    chart-4: "#c42b1c"
    chart-5: "#868686"
    sidebar: "#f3f3f3"
    sidebar-foreground: "#1a1a1a"
    sidebar-primary: "#005fb8"
    sidebar-primary-foreground: "#ffffff"
    sidebar-accent: "#eaeaea"
    sidebar-accent-foreground: "#1a1a1a"
    sidebar-border: "#e5e5e5"
    sidebar-ring: "#1a1a1a"
    inset: "#ededed"
    raised: "#fbfbfb"
    field: "#fbfbfb"
    line: "#e5e5e5"
    hover: "#f6f6f6"
    faint: "#868686"
    brand: "#003e92"
    brand-edge: "#00396e"
    track: "#ededed"
    knob: "#5c5c5c"
    info: "#0078d4"
    warn: "#9d5d00"
    up: "#0f7b0f"
    brand-tint: "#dbe4ed"
    inverse: "#f9f9f9"
    inverse-foreground: "#1a1a1a"
    inverse-brand: "#ffffff"
    info-tint: "#f5f5f5"
    warn-tint: "#fff4ce"
    destructive-tint: "#fde7e9"
    up-tint: "#dff6dd"
    down-tint: "#fde7e9"
  dark:
    background: "#202020"
    foreground: "#ffffff"
    card: "#2b2b2b"
    card-foreground: "#ffffff"
    popover: "#2c2c2c"
    popover-foreground: "#ffffff"
    primary: "#60cdff"
    primary-foreground: "#000000"
    secondary: "#2d2d2d"
    secondary-foreground: "#ffffff"
    muted: "#1c1c1c"
    muted-foreground: "#cccccc"
    accent: "#323232"
    accent-foreground: "#ffffff"
    destructive: "#ff99a4"
    border: "#9a9a9a"
    input: "#9a9a9a"
    ring: "#ffffff"
    chart-1: "#60cdff"
    chart-2: "#6ccb5f"
    chart-3: "#fce100"
    chart-4: "#ff99a4"
    chart-5: "#9a9a9a"
    sidebar: "#202020"
    sidebar-foreground: "#ffffff"
    sidebar-primary: "#60cdff"
    sidebar-primary-foreground: "#000000"
    sidebar-accent: "#323232"
    sidebar-accent-foreground: "#ffffff"
    sidebar-border: "#323232"
    sidebar-ring: "#ffffff"
    inset: "#1d1d1d"
    raised: "#2d2d2d"
    field: "#2d2d2d"
    line: "#323232"
    hover: "#323232"
    faint: "#969696"
    brand: "#99ebff"
    brand-edge: "#53b1dc"
    track: "#1d1d1d"
    knob: "#cccccc"
    info: "#60cdff"
    warn: "#fce100"
    up: "#6ccb5f"
    brand-tint: "#263136"
    inverse: "#282828"
    inverse-foreground: "#ffffff"
    inverse-brand: "#000000"
    info-tint: "#272727"
    warn-tint: "#433519"
    destructive-tint: "#442726"
    up-tint: "#393d1b"
    down-tint: "#442726"
typography:
  caption:
    fontSize: 11px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  detail:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  body:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  title:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  headline:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0px
  display:
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0px
rounded:
  control: 4px
  container: 8px
  modal: 8px
spacing:
  hit: 0px
  density:
    pad: 12px
    gap: 8px
  item:
    inset: 4px
    pad: 11px
  control:
    padding: 6px
    gap: 8px
    dot: 12px
  height:
    sm: 24px
    md: 32px
    lg: 40px
  stroke:
    hairline: 1px
    control: 1px
  focus:
    width: 2px
    offset: 0px
  icon:
    sm: 12px
    md: 16px
    lg: 20px
motion:
  enter:
    duration: 250ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
  fast:
    duration: 83ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
  default:
    duration: 167ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
  slow:
    duration: 250ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
  state:
    duration: 83ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
components:
  button-primary:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.density.gap}"
  button-secondary:
    backgroundColor: "{colors.light.raised}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.density.gap}"
  button-secondary-hover:
    backgroundColor: "{colors.light.hover}"
  button-secondary-pressed:
    backgroundColor: "{colors.light.muted}"
  card:
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.card-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.density.pad}"
  card-inset:
    backgroundColor: "{colors.light.inset}"
    textColor: "{colors.light.foreground}"
    rounded: "{rounded.control}"
    padding: "{spacing.control.padding}"
  input-field:
    backgroundColor: "{colors.light.inset}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.control.padding}"
  badge-chip:
    backgroundColor: "{colors.light.secondary}"
    textColor: "{colors.light.secondary-foreground}"
    typography: "{typography.caption}"
    rounded: "{rounded.control}"
  menu-popover:
    backgroundColor: "#f9f9f9d9"
    textColor: "{colors.light.popover-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.control.padding}"
  dialog:
    backgroundColor: "{colors.light.background}"
    textColor: "{colors.light.card-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "{colors.light.inverse}"
    textColor: "{colors.light.inverse-foreground}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
  toast-inverse:
    backgroundColor: "{colors.light.inverse}"
    textColor: "{colors.light.inverse-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
  switch-track:
    backgroundColor: "{colors.light.inset}"
    rounded: "{rounded.control}"
  switch-track-on:
    backgroundColor: "{colors.light.primary}"
  switch-knob:
    backgroundColor: "{colors.light.knob}"
  switch-knob-checked:
    backgroundColor: "{colors.light.primary-foreground}"
  slider-handle:
    backgroundColor: "{colors.light.knob}"
  tabs-thumb:
    backgroundColor: "{colors.light.raised}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  toggle-on:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.primary-foreground}"
    rounded: "{rounded.control}"
  glass-overlay:
    backgroundColor: "#f9f9f9d9"
    textColor: "{colors.light.popover-foreground}"
    rounded: "{rounded.container}"
---

# WinUI 3

## Overview

WinUI 3 theme (Windows 11, winui3/release/2.7.0).

WinUI 3 (`winui3/release/2.7.0`): Windows 11 fill and stroke resources composited over `SolidBackgroundFillColorBase` (`#F3F3F3` light / `#202020` dark) with `#0078D4` accent, double focus strokes, and deterministic timing curves.

## Colors

- **Shared (C-layer):** Appearance-invariant C-layer color roles shared by light and dark modes.
- **Light:** Adaptive A-layer and B-layer color roles for light appearance.
- **Dark:** Adaptive A-layer and B-layer color roles for dark appearance.

### Surface

- **`scrim`** (`#0000004d`): Translucent backdrop scrim behind modals and overlays (WinUI SmokeFillColorDefault #4D000000).
- **`media`** (`#10131a`): Ground behind photographs and videos; invariant across appearances.
- **`background`** (light `#f3f3f3`, dark `#202020`): Window base surface (WinUI SolidBackgroundFillColorBase).
- **`card`** (light `#fbfbfb`, dark `#2b2b2b`): Elevated card background (WinUI CardBackgroundFillColorDefault composited over base).
- **`popover`** (light `#f9f9f9`, dark `#2c2c2c`): Acrylic flyout/popover fallback surface (WinUI AcrylicInAppFillColorDefaultFallback).
- **`secondary`** (light `#fbfbfb`, dark `#2d2d2d`): Standard control fill (WinUI ControlFillColorDefault composited over base).
- **`muted`** (light `#eeeeee`, dark `#1c1c1c`): Recessed neutral surface (WinUI SolidBackgroundFillColorSecondary composited over base).
- **`accent`** (light `#eaeaea`, dark `#323232`): Subtle hover/selection fill (WinUI SubtleFillColorSecondary over the base in light; in dark, where that step sits under the fill floor, ControlFillColorSecondary).
- **`sidebar`** (light `#f3f3f3`, dark `#202020`): NavigationView expanded pane background matching window base.
- **`sidebar-accent`** (light `#eaeaea`, dark `#323232`): Sidebar active item fill (WinUI SubtleFillColorSecondary).
- **`inset`** (light `#ededed`, dark `#1d1d1d`): Inset well fill (WinUI ControlAltFillColorSecondary composited over base).
- **`raised`** (light `#fbfbfb`, dark `#2d2d2d`): Raised control fill (WinUI ControlFillColorDefault composited over base).
- **`field`** (light `#fbfbfb`, dark `#2d2d2d`): Text input surface (WinUI ControlFillColorDefault composited over base).
- **`hover`** (light `#f6f6f6`, dark `#323232`): Pointer hover fill (WinUI ControlFillColorSecondary composited over base).
- **`track`** (light `#ededed`, dark `#1d1d1d`): Switch and slider track (WinUI ControlAltFillColorSecondary).
- **`knob`** (light `#5c5c5c`, dark `#cccccc`): Unchecked switch thumb (WinUI TextFillColorSecondary).
- **`inverse`** (light `#f9f9f9`, dark `#282828`): TeachingTip/toast surface (WinUI SolidBackgroundFillColorTertiary composited over base).

### Ink

- **`on-media`** (`#ffffff`): White ink over photographs and dark media surfaces; invariant across appearances.
- **`foreground`** (light `#1a1a1a`, dark `#ffffff`): Primary text and icon ink (WinUI TextFillColorPrimary composited over base).
- **`card-foreground`** (light `#1a1a1a`, dark `#ffffff`): Primary ink on card surfaces (WinUI TextFillColorPrimary).
- **`popover-foreground`** (light `#1a1a1a`, dark `#ffffff`): Primary ink on popover surfaces (WinUI TextFillColorPrimary).
- **`secondary-foreground`** (light `#1a1a1a`, dark `#ffffff`): Ink on secondary controls (WinUI TextFillColorPrimary).
- **`muted-foreground`** (light `#5c5c5c`, dark `#cccccc`): Secondary label ink (WinUI TextFillColorSecondary composited over base).
- **`accent-foreground`** (light `#1a1a1a`, dark `#ffffff`): Ink on subtle accent fills (WinUI TextFillColorPrimary).
- **`sidebar-foreground`** (light `#1a1a1a`, dark `#ffffff`): Sidebar primary ink (WinUI TextFillColorPrimary).
- **`sidebar-accent-foreground`** (light `#1a1a1a`, dark `#ffffff`): Sidebar active item ink (WinUI TextFillColorPrimary).
- **`faint`** (light `#868686`, dark `#969696`): Tertiary label ink (WinUI TextFillColorTertiary composited over base).
- **`inverse-foreground`** (light `#1a1a1a`, dark `#ffffff`): Ink on inverse surface (WinUI TextFillColorPrimary).

### Brand

- **`primary`** (light `#005fb8`, dark `#60cdff`): Accent button fill (WinUI AccentFillColorDefault: Dark1 light / Light2 dark from SystemAccentColor).
- **`primary-foreground`** (light `#ffffff`, dark `#000000`): Ink on accent fills (WinUI TextOnAccentFillColorPrimary).
- **`sidebar-primary`** (light `#005fb8`, dark `#60cdff`): Sidebar primary accent matching AccentFillColorDefault.
- **`sidebar-primary-foreground`** (light `#ffffff`, dark `#000000`): Sidebar primary ink matching TextOnAccentFillColorPrimary.
- **`brand`** (light `#003e92`, dark `#99ebff`): Accent text/link/icon ink (WinUI AccentTextFillColorPrimary: Dark2 light / Light3 dark).
- **`brand-edge`** (light `#00396e`, dark `#53b1dc`): Accent button bottom bevel stroke (WinUI ControlStrokeColorOnAccentSecondary composited over primary).
- **`brand-tint`** (light `#dbe4ed`, dark `#263136`): 10% accent wash composited opaque over window base.
- **`inverse-brand`** (light `#ffffff`, dark `#000000`): Action ink on inverse surface matching TextOnAccentFillColorPrimary.

### Status

- **`destructive`** (light `#c42b1c`, dark `#ff99a4`): Critical/error status ink (WinUI SystemFillColorCritical).
- **`chart-1`** (light `#005fb8`, dark `#60cdff`): First chart series color matching WinUI primary accent.
- **`chart-2`** (light `#0f7b0f`, dark `#6ccb5f`): Second chart series color (WinUI SystemFillColorSuccess).
- **`chart-3`** (light `#9d5d00`, dark `#fce100`): Third chart series color (WinUI SystemFillColorCaution).
- **`chart-4`** (light `#c42b1c`, dark `#ff99a4`): Fourth chart series color (WinUI SystemFillColorCritical).
- **`chart-5`** (light `#868686`, dark `#9a9a9a`): Fifth chart series color (WinUI ControlStrongFillColorDefault).
- **`info`** (light `#0078d4`, dark `#60cdff`): Informational semantic color (WinUI SystemFillColorAttentionBrush).
- **`warn`** (light `#9d5d00`, dark `#fce100`): Caution semantic color (WinUI SystemFillColorCaution).
- **`up`** (light `#0f7b0f`, dark `#6ccb5f`): Success semantic color (WinUI SystemFillColorSuccess).
- **`info-tint`** (light `#f5f5f5`, dark `#272727`): Informational wash (WinUI SystemFillColorAttentionBackground composited over base).
- **`warn-tint`** (light `#fff4ce`, dark `#433519`): Caution wash (WinUI SystemFillColorCautionBackground composited over base).
- **`destructive-tint`** (light `#fde7e9`, dark `#442726`): Critical wash (WinUI SystemFillColorCriticalBackground composited over base).
- **`up-tint`** (light `#dff6dd`, dark `#393d1b`): Success wash (WinUI SystemFillColorSuccessBackground composited over base).
- **`down-tint`** (light `#fde7e9`, dark `#442726`): Negative trend wash (WinUI SystemFillColorCriticalBackground composited over base).

### Chrome

- **`border`** (light `#868686`, dark `#9a9a9a`): Standard control hairline border (WinUI ControlStrokeColorDefault composited over base).
- **`input`** (light `#868686`, dark `#9a9a9a`): Input and check control outline (WinUI ControlStrongStrokeColorDefault composited over base).
- **`ring`** (light `#1a1a1a`, dark `#ffffff`): Outer keyboard focus stroke (WinUI FocusStrokeColorOuter).
- **`sidebar-border`** (light `#e5e5e5`, dark `#323232`): Sidebar separator stroke (WinUI DividerStrokeColorDefault).
- **`sidebar-ring`** (light `#1a1a1a`, dark `#ffffff`): Sidebar focus stroke (WinUI FocusStrokeColorOuter).
- **`line`** (light `#e5e5e5`, dark `#323232`): Hairline divider stroke (WinUI DividerStrokeColorDefault).

## Typography

WinUI 3 type weights (400 and 600 only); sizes follow the shared scale (ADR 0009).

- The family is the app's `font-sans` (`font-mono` for code); the sizes are the one shared scale, which the user's system font size scales (ADR 0009).

- **`caption`** (11px (touch: 12px), weight 400, line-height 16px, letter-spacing 0px): Small captions and segmented counter labels.
- **`detail`** (12px (touch: 13px), weight 400, line-height 16px, line-height 20px on touch, letter-spacing 0px): Sidebar section labels, counts, and supporting metadata.
- **`body`** (13px (touch: 15px), weight 400, line-height 20px, letter-spacing 0px): Standard body copy, list rows, and dialog content.
- **`label`** (14px (touch: 15px), weight 400, line-height 20px, letter-spacing 0px): Control labels, form labels, and interactive triggers.
- **`title`** (16px, weight 600, line-height 24px, letter-spacing 0px): Card and section headings.
- **`headline`** (20px (touch: 22px), weight 600, line-height 28px, letter-spacing 0px): Page-level headings.
- **`display`** (26px (touch: 28px), weight 600, line-height 32px, line-height 36px on touch, letter-spacing 0px): Large display numerals and hero headings.

## Layout

Ergonomic sizing scales for pointer input.

- **Hit target:** Minimum hit target size (0 disables padding expansion).
- **Density:** Page-level padding and gap.
- **List rows:** WinUI 3 menu rows: the fill 4px in from the flyout's edge (MenuFlyoutItemMargin 4,2,4,2) and the text 11px inside it (MenuFlyoutItemThemePadding 11,8,11,9; ComboBoxItemThemePadding 11,5,11,7), the same with a pen or a finger (microsoft-ui-xaml MenuFlyout_themeresources.xaml).
- **Control geometry:** Control internal spacing and switch size tier.
- **Control heights:** Standard control heights (sm, md, lg).
- **Switch size tier (pointer):** `regular`.
- **Icons:** Standard icon dimensions (sm, md, lg).

- **Pointer tier:** WinUI 3 desktop pointer input-tier overrides (Standard 40px ListViewItemMinHeight, 32px controls, 12/16/20px icons).
- **Touch tier:** WinUI 3 touch input-tier overrides (40px hit target and controls, 16/20/24px icons).

## Elevation & Depth

WinUI 3 ThemeShadow depths (2/8/16/32/128) paired with composited `ControlStrokeColorDefault` / `SurfaceStrokeColorDefault` borders and `material.windows` blur on `glass`, `menu`, and `tooltip` (`AcrylicInAppFillColorDefault` 0.85 light / 0.96 dark).

- **Strokes:** Border stroke widths.
  - `stroke.hairline` (1px): Hairline width for dividers, container edges (cards, drawers, overlays) and outlined variants.
  - `stroke.control` (1px): Interactive control border width.
- **Focus indicator (`style: "double"`):** WinUI 3 double focus stroke (2px outer FocusStrokeColorOuter + 1px inner FocusStrokeColorInner, 0px offset).
  - `focus.width` (2px): 2px outer focus stroke width per WinUI 3.
  - `focus.offset` (0px): Focus ring outward offset from control bounds.
- **State overlays (hover=0, focus=0, pressed=0, dragged=0):** State-layer ink opacities for hover, focus, pressed, and dragged states.

## Shapes

WinUI 3 corner radius scale: ControlCornerRadius 4px (control) and OverlayCornerRadius 8px (container and modal).

Circular corner curve (WinUI 3 has no continuous squircle curve; geometry.md). (`curve: "circular"`, `corners.button: "radius"`).

Semantic corner radius roles by layer, referencing base dimension.radius.* tokens.

- **`control`** (4px): Corner radius for in-page elements: buttons, fields, rows, chips, badges, wells, color areas, and kbd.
- **`container`** (8px): Corner radius for containers and overlays: cards, menus, popovers, tooltips, list panels, toasts, and frames.
- **`modal`** (8px): Corner radius for modal surfaces: dialogs, sheets, and drawers.

**Control dimensions** (no DESIGN.md field; they decide how a control's own parts are drawn): WinUI 3 control dimensions: TextBox's box-underline, inset selection controls, a hairline track and a ring knob (docs/specs/theme-contract-v2.md §11.2).
- **`field`**: `box-underline`
- **`choice`**: `inset`
- **`track`**: `hairline`
- **`handle`**: `ring`

## Motion & Micro-interaction

Interactive timing roles (a duration and an easing): fast, default, slow, and the state fade.

- **`enter`** (250ms, `cubic-bezier(0, 0, 0, 1)`): WinUI 3 250ms entrance transition with Direct Entrance decelerate curve (motion.md).
- **`fast`** (83ms, `cubic-bezier(0, 0, 0, 1)`): WinUI 3 ControlFasterAnimationDuration (83ms, decelerate; ToggleSwitch_themeresources.xaml:321).
- **`default`** (167ms, `cubic-bezier(0, 0, 0, 1)`): WinUI 3 ControlFastAnimationDuration (167ms, decelerate; Common_themeresources_any.xaml).
- **`slow`** (250ms, `cubic-bezier(0, 0, 0, 1)`): WinUI 3 ControlNormalAnimationDuration (250ms, decelerate; motion.md).
- **`state`** (83ms, `cubic-bezier(0, 0, 0, 1)`): WinUI 3 ControlFasterAnimationDuration (83ms) with ControlFastOutSlowInKeySpline (Common_themeresources_any.xaml).
- **Press** (`press-scale: 1`, `pressed-opacity: 1`): Interaction state opacities and press scale.
- **Timing curves:** Named timing curves shared across themes.

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted: this theme defines visual tokens, surface finishes, typography metrics, and motion physics only; product copy, tone, capitalization, and terminology belong to the host application.

## Components

The neutral of each field a finish role can have, written once for the roles that have it: a flat surface states no gradient, an opaque one no backdrop blur and no material, a layer no height of its own, a press that keeps the resting colours states no swap, and a top or bottom edge with no colour of its own takes the role's border color. A theme that states one writes the token (its own finishes.shared, or an appearance's) and it wins; the extension only says what the neutral is where no token states it, and a role carries only the fields it lists in `finishFields`.

- **`finish.card`**: A surface that holds content: a card, a section.
- **`finish.inset`**: A well cut into a surface: an inset, a field, a track, a groove.
- **`finish.channel`**: The channel a group of choices sits in: a segmented control's track.
- **`finish.raised`** (backdropFilter: `none`): A control on a surface: a button, a chip, a pill.
- **`finish.plate`**: A labelled block chosen inside a well: the selected tab, a segmented control's thumb.
- **`finish.overlay`** (backdropFilter: `none`; material: `"acrylic"`): A panel floating over the page: a menu, a toast.
- **`finish.modal`**: A surface the page waits for: a dialog, a sheet.
- **`finish.inverse`** (backdropFilter: `none`): The page's inverse: an inverse surface, a tooltip.
- **`finish.glass`** (backdropFilter: `blur(30px)`): A translucent surface: what is behind it shows through.
- **`finish.accent`**: The accent's own surface, with its ink.
- **`finish.fill`**: A run's fill: a progress bar's bar, a slider's range, a meter's column.
- **`finish.knob`**: A knob: a switch's thumb, a slider's handle. Its checked state, `checked-*`, is the knob while its control is on.
- **`finish.hover`**: A control under the pointer.
- **`finish.pressed`**: A control held down.
- **`finish.disabled`**: A control that cannot be used.
- **Disabled handling** (content=0.36, fill=true): WinUI 3 disabled styling: 0.36 TextFillColorDisabled content with fill: true container override.

## Do's and Don'ts

- **Do:** Read all colors, radii, typography, and surface finishes through theme roles (`colors.*`, `shape.*`, `font.*`, `finish.*`) rather than literals in component code.
- **Do:** Read theme getters inside JSX render expressions or reactive effects so runtime theme switching (`selectTheme`) and light/dark appearance changes take effect on the next frame.
- **Do:** Use `rounded(shape.<role>, inset)` for concentric nested radii inside cards, switches, and segmented controls.
- **Do:** Use `4px` `ControlCornerRadius` for `control` and `8px` `OverlayCornerRadius` for `container` and `modal` with `shape.curve: "circular"`.
- **Do:** Use `focus.style: "double"` (2px outer `FocusStrokeColorOuter` + 1px inner `FocusStrokeColorInner`) and WinUI timing motion (`decelerate` / `point-to-point`).
- **Do:** Use underlined tabs and fields with leading navigation bar indicators.
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never add a finish field a role does not use: the fields of `finish.<role>` are the ones `packages/theme/finish-fields.ts` lists, and every theme states them the same way.
- **Don't:** Do not substitute continuous squircle corners for WinUI 3's circular corners.
