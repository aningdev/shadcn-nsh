---
version: alpha
name: Material
description: "Material 3 Expressive theme (material-web v34.0.21 / Compose M3 1.5.0)."
colors:
  scrim: "#00000052"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#fef7ff"
    foreground: "#1d1b20"
    card: "#f7f2fa"
    card-foreground: "#1d1b20"
    popover: "#f3edf7"
    popover-foreground: "#1d1b20"
    primary: "#6750a4"
    primary-foreground: "#ffffff"
    secondary: "#e8def8"
    secondary-foreground: "#4a4458"
    muted: "#e6e0e9"
    muted-foreground: "#49454f"
    accent: "#e8def8"
    accent-foreground: "#4a4458"
    destructive: "#b3261e"
    border: "#cac4d0"
    input: "#79747e"
    ring: "#625b71"
    chart-1: "#6750a4"
    chart-2: "#7d5260"
    chart-3: "#138a5a"
    chart-4: "#b26a00"
    chart-5: "#1e63d2"
    sidebar: "#fef7ff"
    sidebar-foreground: "#1d1b20"
    sidebar-primary: "#6750a4"
    sidebar-primary-foreground: "#ffffff"
    sidebar-accent: "#e8def8"
    sidebar-accent-foreground: "#4a4458"
    sidebar-border: "#cac4d0"
    sidebar-ring: "#625b71"
    inset: "#f3edf7"
    raised: "#f7f2fa"
    field: "#e6e0e9"
    line: "#cac4d0"
    hover: "#1d1b2014"
    faint: "#79747e"
    brand: "#6750a4"
    brand-edge: "#cac4d0"
    focus-inner: "#f7f2fa"
    track: "#e6e0e9"
    knob: "#79747e"
    info: "#1e63d2"
    warn: "#b26a00"
    up: "#138a5a"
    brand-tint: "#e8def8"
    inverse: "#322f35"
    inverse-foreground: "#f5eff7"
    inverse-brand: "#d0bcff"
    info-tint: "#1e63d21f"
    warn-tint: "#b26a001f"
    destructive-tint: "#f9dedc"
    up-tint: "#138a5a1f"
  dark:
    background: "#141218"
    foreground: "#e6e0e9"
    card: "#1d1b20"
    card-foreground: "#e6e0e9"
    popover: "#211f26"
    popover-foreground: "#e6e0e9"
    primary: "#d0bcff"
    primary-foreground: "#381e72"
    secondary: "#4a4458"
    secondary-foreground: "#e8def8"
    muted: "#36343b"
    muted-foreground: "#cac4d0"
    accent: "#4a4458"
    accent-foreground: "#e8def8"
    destructive: "#f2b8b5"
    border: "#49454f"
    input: "#938f99"
    ring: "#ccc2dc"
    chart-1: "#d0bcff"
    chart-2: "#efb8c8"
    chart-3: "#45d49a"
    chart-4: "#ffb547"
    chart-5: "#81b3fc"
    sidebar: "#141218"
    sidebar-foreground: "#e6e0e9"
    sidebar-primary: "#d0bcff"
    sidebar-primary-foreground: "#381e72"
    sidebar-accent: "#4a4458"
    sidebar-accent-foreground: "#e8def8"
    sidebar-border: "#49454f"
    sidebar-ring: "#ccc2dc"
    inset: "#211f26"
    raised: "#1d1b20"
    field: "#36343b"
    line: "#49454f"
    hover: "#e6e0e914"
    faint: "#938f99"
    brand: "#d0bcff"
    brand-edge: "#49454f"
    focus-inner: "#1d1b20"
    track: "#36343b"
    knob: "#938f99"
    info: "#81b3fc"
    warn: "#ffb547"
    up: "#45d49a"
    brand-tint: "#4a4458"
    inverse: "#e6e0e9"
    inverse-foreground: "#322f35"
    inverse-brand: "#6750a4"
    info-tint: "#81b3fc1f"
    warn-tint: "#ffb5471f"
    destructive-tint: "#8c1d18"
    up-tint: "#45d49a1f"
typography:
  caption:
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.5px
  detail:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.4px
  body:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.25px
  label:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0.1px
  title:
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0.15px
  headline:
    fontSize: 20px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0px
  display:
    fontSize: 26px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: 0px
rounded:
  control: 4px
  container: 12px
  modal: 28px
spacing:
  hit: 0px
  density:
    pad: 16px
    gap: 12px
  item:
    inset: 0px
    pad: 12px
  control:
    padding: 8px
    gap: 8px
  height:
    sm: 24px
    md: 32px
    lg: 40px
  stroke:
    hairline: 1px
    control: 1px
  focus:
    width: 3px
    offset: 2px
  icon:
    sm: 12px
    md: 16px
    lg: 20px
motion:
  fast:
    duration: 150ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.2, 0, 0, 1)"
  default:
    duration: 250ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.2, 0, 0, 1)"
  slow:
    duration: 400ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.05, 0.7, 0.1, 1)"
  state:
    duration: 100ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.2, 0, 0, 1)"
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
    backgroundColor: "{colors.light.raised}"
  button-secondary-pressed:
    backgroundColor: "{colors.light.raised}"
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
    backgroundColor: "{colors.light.popover}"
    textColor: "{colors.light.popover-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.control.padding}"
  dialog:
    backgroundColor: "#ece6f0"
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
    backgroundColor: "{colors.light.popover}"
    textColor: "{colors.light.popover-foreground}"
    rounded: "{rounded.container}"
---

# Material

## Overview

Material 3 Expressive theme (material-web v34.0.21 / Compose M3 1.5.0).

Material 3 Expressive (`material-web` v34.0.21 / Compose Material 3 1.5.0) built from the `#6750A4` baseline with tonal surface containers, Expressive Tone 30 `on*Container` roles, state-layer overlays, and M3 duration and easing motion.

## Colors

- **Shared (C-layer):** Appearance-invariant C-layer color roles shared by light and dark modes.
- **Light:** Adaptive A-layer and B-layer color roles for light appearance.
- **Dark:** Adaptive A-layer and B-layer color roles for dark appearance.

### Surface

- **`scrim`** (`#00000052`): Translucent backdrop scrim behind modals and sheets (M3 scrim at 32% opacity).
- **`media`** (`#10131a`): Ground behind photographs and videos; invariant across appearances.
- **`background`** (light `#fef7ff`, dark `#141218`): Primary page surface (M3 surface role, material-web v34.0.21).
- **`card`** (light `#f7f2fa`, dark `#1d1b20`): Elevated card container background (M3 surfaceContainerLow).
- **`popover`** (light `#f3edf7`, dark `#211f26`): Floating popover and menu container background (M3 surfaceContainer).
- **`secondary`** (light `#e8def8`, dark `#4a4458`): Secondary tonal container fill (M3 secondaryContainer).
- **`muted`** (light `#e6e0e9`, dark `#36343b`): Muted/highest surface container fill (M3 surfaceContainerHighest).
- **`accent`** (light `#e8def8`, dark `#4a4458`): Tonal accent fill (M3 secondaryContainer).
- **`sidebar`** (light `#fef7ff`, dark `#141218`): Sidebar canvas background (M3 surface).
- **`sidebar-accent`** (light `#e8def8`, dark `#4a4458`): Sidebar active item fill (M3 secondaryContainer).
- **`inset`** (light `#f3edf7`, dark `#211f26`): Inset container surface (M3 surfaceContainer).
- **`raised`** (light `#f7f2fa`, dark `#1d1b20`): Raised control surface (M3 surfaceContainerLow).
- **`field`** (light `#e6e0e9`, dark `#36343b`): Filled text field background (M3 surfaceContainerHighest).
- **`hover`** (light `#1d1b2014`, dark `#e6e0e914`): M3 hover state-layer ink (8% foreground over transparent, StateTokens.kt).
- **`track`** (light `#e6e0e9`, dark `#36343b`): Switch and slider track fill (M3 surfaceContainerHighest).
- **`knob`** (light `#79747e`, dark `#938f99`): Unchecked switch thumb fill (M3 outline).
- **`inverse`** (light `#322f35`, dark `#e6e0e9`): Inverse surface for snackbars and tooltips (M3 inverseSurface).

### Ink

- **`on-media`** (`#ffffff`): White ink over photographs and dark media surfaces; invariant across appearances.
- **`foreground`** (light `#1d1b20`, dark `#e6e0e9`): Default text and icon ink on surfaces (M3 onSurface).
- **`card-foreground`** (light `#1d1b20`, dark `#e6e0e9`): Primary text and icon ink on card surfaces.
- **`popover-foreground`** (light `#1d1b20`, dark `#e6e0e9`): Primary text and icon ink on popover surfaces.
- **`secondary-foreground`** (light `#4a4458`, dark `#e8def8`): Text and icon ink on secondary containers (M3 Expressive onSecondaryContainer, Tone 30 in light).
- **`muted-foreground`** (light `#49454f`, dark `#cac4d0`): Secondary supporting text and icon ink (M3 onSurfaceVariant).
- **`accent-foreground`** (light `#4a4458`, dark `#e8def8`): Text and icon ink on accent fills (M3 Expressive onSecondaryContainer).
- **`sidebar-foreground`** (light `#1d1b20`, dark `#e6e0e9`): Primary text and icon ink inside the sidebar.
- **`sidebar-accent-foreground`** (light `#4a4458`, dark `#e8def8`): Sidebar active item text ink (M3 Expressive onSecondaryContainer).
- **`faint`** (light `#79747e`, dark `#938f99`): Quiet caption/placeholder ink (M3 outline).
- **`inverse-foreground`** (light `#f5eff7`, dark `#322f35`): Ink on inverse surfaces (M3 inverseOnSurface).

### Brand

- **`primary`** (light `#6750a4`, dark `#d0bcff`): Primary brand action fill (M3 primary).
- **`primary-foreground`** (light `#ffffff`, dark `#381e72`): Text and icon ink on primary fills (M3 onPrimary).
- **`sidebar-primary`** (light `#6750a4`, dark `#d0bcff`): Primary action highlight color in the sidebar.
- **`sidebar-primary-foreground`** (light `#ffffff`, dark `#381e72`): Text and icon ink on sidebar-primary highlights.
- **`brand`** (light `#6750a4`, dark `#d0bcff`): Inline brand accent ink, aliased to {color.primary}.
- **`brand-edge`** (light `#cac4d0`, dark `#49454f`): Brand container outline (M3 outlineVariant).
- **`brand-tint`** (light `#e8def8`, dark `#4a4458`): Opaque selected chip/tile fill (M3 secondaryContainer).
- **`inverse-brand`** (light `#d0bcff`, dark `#6750a4`): Brand action ink on inverse surfaces (M3 inversePrimary).

### Status

- **`destructive`** (light `#b3261e`, dark `#f2b8b5`): Error and destructive action color (M3 error).
- **`chart-1`** (light `#6750a4`, dark `#d0bcff`): First chart series color (M3 primary).
- **`chart-2`** (light `#7d5260`, dark `#efb8c8`): Second chart series color (M3 tertiary).
- **`chart-3`** (light `#138a5a`, dark `#45d49a`): Third chart series color (the theme's positive `up` tone).
- **`chart-4`** (light `#b26a00`, dark `#ffb547`): Fourth chart series color (the theme's `warn` tone).
- **`chart-5`** (light `#1e63d2`, dark `#81b3fc`): Fifth chart series color (the theme's `info` tone).
- **`info`** (light `#1e63d2`, dark `#81b3fc`): Informational semantic color (Material Blue).
- **`warn`** (light `#b26a00`, dark `#ffb547`): Warning semantic status color.
- **`up`** (light `#138a5a`, dark `#45d49a`): Positive trend and growth semantic color.
- **`info-tint`** (light `#1e63d21f`, dark `#81b3fc1f`): Translucent informational wash (12% info over transparent).
- **`warn-tint`** (light `#b26a001f`, dark `#ffb5471f`): Translucent warning wash (12% warn over transparent).
- **`destructive-tint`** (light `#f9dedc`, dark `#8c1d18`): Tonal error container background (M3 errorContainer).
- **`up-tint`** (light `#138a5a1f`, dark `#45d49a1f`): Translucent positive wash (12% up over transparent).

### Chrome

- **`border`** (light `#cac4d0`, dark `#49454f`): Hairline divider and container border color (M3 outlineVariant).
- **`input`** (light `#79747e`, dark `#938f99`): Input outline color (M3 outline).
- **`ring`** (light `#625b71`, dark `#ccc2dc`): Focus indicator ring color (M3 primary, the role M3 draws its focus indicator in).
- **`sidebar-border`** (light `#cac4d0`, dark `#49454f`): Sidebar divider border (M3 outlineVariant).
- **`sidebar-ring`** (light `#625b71`, dark `#ccc2dc`): Focus indicator ring color inside the sidebar.
- **`line`** (light `#cac4d0`, dark `#49454f`): Inset divider hairline (M3 outlineVariant).
- **`focus-inner`** (light `#f7f2fa`, dark `#1d1b20`): The line inside a focus ring, hugging the control: the surface's own color where a theme draws one.

## Typography

Material 3 Expressive type weights; sizes follow the shared scale (ADR 0009).

- The family is the app's `font-sans` (`font-mono` for code); the sizes are the one shared scale, which the user's system font size scales (ADR 0009).

- **`caption`** (11px (touch: 12px), weight 500, line-height 16px, letter-spacing 0.5px): Small captions and segmented counter labels.
- **`detail`** (12px (touch: 13px), weight 400, line-height 16px, line-height 20px on touch, letter-spacing 0.4px): Sidebar section labels, counts, and supporting metadata.
- **`body`** (13px (touch: 15px), weight 400, line-height 20px, letter-spacing 0.25px): Standard body copy, list rows, and dialog content.
- **`label`** (14px (touch: 15px), weight 500, line-height 20px, letter-spacing 0.1px): Control labels, form labels, and interactive triggers.
- **`title`** (16px, weight 500, line-height 24px, letter-spacing 0.15px): Card and section headings.
- **`headline`** (20px (touch: 22px), weight 400, line-height 28px, letter-spacing 0px): Page-level headings.
- **`display`** (26px (touch: 28px), weight 400, line-height 32px, line-height 36px on touch, letter-spacing 0px): Large display numerals and hero headings.

## Layout

Ergonomic sizing scales for pointer input.

- **Hit target:** Minimum hit target size (0 disables padding expansion).
- **Density:** Page-level padding and gap.
- **List rows:** Material 3 menu rows: the fill spans the menu's width (inset 0; a DropdownMenuItem takes no horizontal margin) and the text sits 12dp in (DropdownMenuItemHorizontalPadding, androidx compose material3 Menu.kt).
- **Control geometry:** Control internal spacing.
- **Control heights:** Desktop control heights one step below the touch scale (24, 32, 40dp against M3's 32, 40, 56dp): the library's own desktop sizing, not an M3 density step (docs/decisions/0003-material-desktop-tier.md).
- **Icons:** Standard icon dimensions (sm, md, lg).

- **Pointer tier:** Material 3 Expressive desktop pointer input-tier overrides: control heights one step below the touch scale (24, 32, 40dp), glyphs 12, 16, 20dp, no hit padding (docs/decisions/0003-material-desktop-tier.md).
- **Touch tier:** Material 3 Expressive touch input-tier overrides (Compose InteractiveComponentSize 48dp hit target, ListTokens 56dp row).

## Elevation & Depth

Tonal surface stepping plus Material Web Level 1–3 shadows and `material.android.elevation` (1dp/3dp/6dp), no backdrop blur, and a line only where a well or a channel states one (`inset`, `channel`): every other finish draws no edge (`border-color: transparent`).

- **Strokes:** Border stroke widths.
  - `stroke.hairline` (1px): Hairline width for dividers, container edges (cards, drawers, overlays) and outlined variants.
  - `stroke.control` (1px): Interactive control border width.
- **Focus indicator (`style: "outline"`):** M3 focus indicator: 3px solid outline offset 2px (_md-sys-state-focus-indicator.scss).
  - `focus.width` (3px): Focus ring stroke width.
  - `focus.offset` (2px): 2px outward focus indicator offset per M3.
- **State overlays (hover=0.08, pressed=0.1):** M3 state-layer ink opacities: hover 0.08, pressed 0.10 (StateTokens.kt).

## Shapes

Material 3 Expressive corner scale (Compose tokens at `ac364f3c`: 4px CornerExtraSmall control, 12px CornerMedium/CornerLarge container, 28px CornerExtraLarge modal; capsule buttons via `shape.corners.button: "full"`).

M3 circular arc corners (ShapeTokens.kt). (`curve: "circular"`).

- **`control`** (4px): Corner radius for in-page controls, fields, rows, chips, badges, wells, color areas, and kbd.
- **`container`** (12px): Corner radius for cards, menus, popovers, tooltips, list panels, toasts, and frames.
- **`modal`** (28px): Corner radius for dialogs, sheets, and drawers.

## Motion & Micro-interaction

Interactive timing roles (a duration and an easing): fast, default, slow, and the state fade.

- **`fast`** (150ms, `cubic-bezier(0.2, 0, 0, 1)`): M3 DurationShort3 (150ms) with the standard curve for control state (_md-sys-motion.scss).
- **`default`** (250ms, `cubic-bezier(0.2, 0, 0, 1)`): M3 DurationMedium1 (250ms) with the standard curve for presses and movement.
- **`slow`** (400ms, `cubic-bezier(0.05, 0.7, 0.1, 1)`): M3 DurationMedium4 (400ms) with the emphasized-decelerate curve for settling and panels.
- **`state`** (100ms, `cubic-bezier(0.2, 0, 0, 1)`): M3 DurationShort2 (100ms) with the standard curve (MotionTokens.DurationShort2, Easing.StandardCubicBezier; ExpressiveMotionTokens.kt).
- **Press** (`press-scale: 1`, `pressed-opacity: 1`): Interaction state opacities and press scale.
- **Timing curves:** Named timing curves shared across themes.

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted: this theme defines visual tokens, surface finishes, typography metrics, and motion physics only; product copy, tone, capitalization, and terminology belong to the host application.

## Components

The neutral of each field a finish role can have, written once for the roles that have it: a flat surface states no gradient, an opaque one no backdrop blur and no material, a layer no height of its own, a press that keeps the resting colours states no swap, and a top or bottom edge with no colour of its own takes the role's border color. A theme that states one writes the token (its own finishes.shared, or an appearance's) and it wins; the extension only says what the neutral is where no token states it, and a role carries only the fields it lists in `finishFields`.

- **`finish.card`** (elevation: 1): A surface that holds content: a card, a section.
- **`finish.inset`**: A well cut into a surface: an inset, a field, a track, a groove.
- **`finish.channel`**: The channel a group of choices sits in: a segmented control's track.
- **`finish.raised`** (backdropFilter: `none`): A control on a surface: a button, a chip, a pill.
- **`finish.plate`** (elevation: 0): A labelled block chosen inside a well: the selected tab, a segmented control's thumb.
- **`finish.overlay`** (backdropFilter: `none`; elevation: 3): A panel floating over the page: a menu, a toast.
- **`finish.modal`** (elevation: 6): A surface the page waits for: a dialog, a sheet.
- **`finish.inverse`** (backdropFilter: `none`; elevation: 6): The page's inverse: an inverse surface, a tooltip.
- **`finish.glass`** (backdropFilter: `none`; elevation: 3): A translucent surface: what is behind it shows through.
- **`finish.accent`**: The accent's own surface, with its ink.
- **`finish.fill`**: A run's fill: a progress bar's bar, a slider's range, a meter's column.
- **`finish.knob`**: A knob: a switch's thumb, a slider's handle. Its checked state, `checked-*`, is the knob while its control is on.
- **`finish.hover`** (elevation: 1): A control under the pointer.
- **`finish.pressed`** (elevation: 1): A control held down.
- **`finish.disabled`**: A control that cannot be used.
- **Disabled handling** (content=0.38, fill=undefined): M3 disabled controls: 0.38 content opacity, the disabled finish as their face (10% onSurface container) and its foreground as their ink (_md-comp-button-filled.scss).

## Do's and Don'ts

- **Do:** Read all colors, radii, typography, and surface finishes through theme roles (`colors.*`, `shape.*`, `font.*`, `finish.*`) rather than literals in component code.
- **Do:** Read theme getters inside JSX render expressions or reactive effects so runtime theme switching (`selectTheme`) and light/dark appearance changes take effect on the next frame.
- **Do:** Use `rounded(shape.<role>, inset)` for concentric nested radii inside cards, switches, and segmented controls.
- **Do:** Express interaction states via M3 state-layer ink overlays (`hover: 0.08`, `focus: 0.10`, `pressed: 0.10`, `dragged: 0.16`) with `state.press-scale: 1`.
- **Do:** Use `shape.curve: "circular"` with top-rounded underlined fields and underlined tabs.
- **Do:** Keep tonal and elevated containers edge-free through `border-color: transparent` in the finish, so depth comes from tonal steps and elevation; a well or channel keeps its hairline.
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never add a finish field a role does not use: the fields of `finish.<role>` are the ones `packages/theme/finish-fields.ts` lists, and every theme states them the same way.
- **Don't:** Do not add backdrop blur (`backdropFilter`) or a surface edge (`border-color`) to M3 tonal surfaces.
- **Don't:** Do not replace `outline` focus rings (`3px` width, `2px` offset) with halo rings.
