---
version: alpha
name: Apple
description: "Apple theme (Apple HIG / UIKit system palette and Liquid Glass)."
colors:
  scrim: "#00000066"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#f2f2f7"
    foreground: "#000000"
    card: "#ffffff"
    card-foreground: "#000000"
    popover: "#ffffff"
    popover-foreground: "#000000"
    primary: "#007aff"
    primary-foreground: "#ffffff"
    secondary: "#efeff0"
    secondary-foreground: "#000000"
    muted: "#efeff0"
    muted-foreground: "#8a8a8e"
    accent: "#f4f4f5"
    accent-foreground: "#000000"
    destructive: "#ff3b30"
    border: "#dcdcdd"
    input: "#c6c6c8"
    ring: "#007aff"
    chart-1: "#007aff"
    chart-2: "#34c759"
    chart-3: "#ff9500"
    chart-4: "#af52de"
    chart-5: "#ff3b30"
    sidebar: "#f2f2f7"
    sidebar-foreground: "#000000"
    sidebar-primary: "#007aff"
    sidebar-primary-foreground: "#ffffff"
    sidebar-accent: "#f4f4f5"
    sidebar-accent-foreground: "#000000"
    sidebar-border: "#dcdcdd"
    sidebar-ring: "#007aff"
    inset: "#f4f4f5"
    raised: "#efeff0"
    glass-edge: "#dcdcdd"
    field: "#efeff0"
    line: "#dcdcdd"
    hover: "#0000000f"
    ring-halo: "#007aff4d"
    faint: "#c5c5c7"
    brand: "#007aff"
    brand-edge: "#dcdcdd"
    track: "#e9e9eb"
    knob: "#ffffff"
    info: "#007aff"
    warn: "#ff9500"
    up: "#34c759"
    brand-tint: "#007aff1f"
    inverse: "#ffffff"
    inverse-foreground: "#000000"
    inverse-brand: "#ffffff"
    info-tint: "#007aff1f"
    warn-tint: "#ff95001f"
    destructive-tint: "#ff3b301f"
    up-tint: "#34c7591f"
    down-tint: "#ff3b301f"
    violet: "#af52de"
  dark:
    background: "#000000"
    foreground: "#ffffff"
    card: "#1c1c1e"
    card-foreground: "#ffffff"
    popover: "#2c2c2e"
    popover-foreground: "#ffffff"
    primary: "#0a84ff"
    primary-foreground: "#ffffff"
    secondary: "#323236"
    secondary-foreground: "#ffffff"
    muted: "#323236"
    muted-foreground: "#98989f"
    accent: "#2c2c30"
    accent-foreground: "#ffffff"
    destructive: "#ff453a"
    border: "#353538"
    input: "#3e3e41"
    ring: "#0a84ff"
    chart-1: "#0a84ff"
    chart-2: "#30d158"
    chart-3: "#ff9f0a"
    chart-4: "#bf5af2"
    chart-5: "#ff453a"
    sidebar: "#1c1c1e"
    sidebar-foreground: "#ffffff"
    sidebar-primary: "#0a84ff"
    sidebar-primary-foreground: "#ffffff"
    sidebar-accent: "#2c2c30"
    sidebar-accent-foreground: "#ffffff"
    sidebar-border: "#353538"
    sidebar-ring: "#0a84ff"
    inset: "#2c2c30"
    raised: "#323236"
    glass-edge: "#353538"
    field: "#323236"
    line: "#353538"
    hover: "#ffffff0f"
    ring-halo: "#0a84ff4d"
    faint: "#5a5a5f"
    brand: "#0a84ff"
    brand-edge: "#353538"
    track: "#39393d"
    knob: "#ffffff"
    info: "#0a84ff"
    warn: "#ff9f0a"
    up: "#30d158"
    brand-tint: "#0a84ff1f"
    inverse: "#2c2c2e"
    inverse-foreground: "#ffffff"
    inverse-brand: "#ffffff"
    info-tint: "#0a84ff1f"
    warn-tint: "#ff9f0a1f"
    destructive-tint: "#ff453a1f"
    up-tint: "#30d1581f"
    down-tint: "#ff453a1f"
    violet: "#bf5af2"
typography:
  caption:
    fontFamily: system-ui
    fontSize: 10px
    fontWeight: 400
    lineHeight: 13px
    letterSpacing: 0px
  detail:
    fontFamily: system-ui
    fontSize: 11px
    fontWeight: 400
    lineHeight: 14px
    letterSpacing: 0px
  body:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  label:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
  title:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0px
  headline:
    fontFamily: system-ui
    fontSize: 22px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: 0px
  display:
    fontFamily: system-ui
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0px
rounded:
  control: 8px
  container: 12px
  modal: 26px
spacing:
  hit: 0px
  density:
    pad: 16px
    gap: 12px
  item:
    inset: 4px
    pad: 8px
  control:
    padding: 8px
    gap: 8px
    dot: 6px
  height:
    sm: 24px
    md: 28px
    lg: 32px
  stroke:
    hairline: 0.5px
    control: 1px
  focus:
    width: 3px
    offset: 0px
  icon:
    sm: 12px
    md: 16px
    lg: 20px
motion:
  enter:
    duration: 420ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.333333, 1, 0.666667, 1)"
  state:
    duration: 120ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.333333, 1, 0.666667, 1)"
components:
  button-primary:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.density.gap}"
  button-secondary:
    backgroundColor: "#efeff0b8"
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
    backgroundColor: "#ffffffb8"
    textColor: "{colors.light.popover-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.control.padding}"
  dialog:
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.card-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "#ffffffb8"
    textColor: "{colors.light.inverse-foreground}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
  toast-inverse:
    backgroundColor: "#ffffffb8"
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
    backgroundColor: "#efeff0b8"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  toggle-on:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.primary-foreground}"
    rounded: "{rounded.control}"
  glass-overlay:
    backgroundColor: "#ffffffb8"
    textColor: "{colors.light.popover-foreground}"
    rounded: "{rounded.container}"
---

# Apple

## Overview

Apple theme (Apple HIG / UIKit system palette and Liquid Glass).

Apple Human Interface Guidelines / UIKit system palette (`systemBlue`, `systemGroupedBackground`, `label`) with Retina 0.5px hairlines, capsule buttons, continuous corners, and Liquid Glass on floating and raised surfaces.

## Colors

- **Shared (C-layer):** Appearance-invariant C-layer color roles shared by light and dark modes.
- **Light:** Adaptive A-layer and B-layer color roles for light appearance.
- **Dark:** Adaptive A-layer and B-layer color roles for dark appearance.

### Surface

- **`scrim`** (`#00000066`): Translucent backdrop scrim behind modals and sheets (40% black).
- **`media`** (`#10131a`): Ground behind photographs and videos; invariant across appearances.
- **`background`** (light `#f2f2f7`, dark `#000000`): Grouped page canvas background (UIKit systemGroupedBackground).
- **`card`** (light `#ffffff`, dark `#1c1c1e`): Elevated list and card surface (UIKit systemBackground).
- **`popover`** (light `#ffffff`, dark `#2c2c2e`): Floating popover and sheet surface (UIKit secondarySystemBackground / popover).
- **`secondary`** (light `#efeff0`, dark `#323236`): Secondary control surface fill.
- **`muted`** (light `#efeff0`, dark `#323236`): Subdued container fill (UIKit tertiarySystemFill composited over card).
- **`accent`** (light `#f4f4f5`, dark `#2c2c30`): Subtle hover/selection fill (UIKit quaternarySystemFill composited over card).
- **`sidebar`** (light `#f2f2f7`, dark `#1c1c1e`): Sidebar surface matching Apple system sidebar/grouped background.
- **`sidebar-accent`** (light `#f4f4f5`, dark `#2c2c30`): Selected or active row fill in the sidebar.
- **`inset`** (light `#f4f4f5`, dark `#2c2c30`): Inset surface (UIKit quaternarySystemFill composited over card).
- **`raised`** (light `#efeff0`, dark `#323236`): Raised control surface (UIKit tertiarySystemFill composited over card).
- **`field`** (light `#efeff0`, dark `#323236`): Form input background (UIKit tertiarySystemFill composited over card).
- **`hover`** (light `#0000000f`, dark `#ffffff0f`): Pointer hover tint (6% foreground ink over transparent).
- **`track`** (light `#e9e9eb`, dark `#39393d`): Switch and slider track (UIKit secondarySystemFill composited over card).
- **`knob`** (`#ffffff`): Switch knob and slider handle (pure white).
- **`inverse`** (light `#ffffff`, dark `#2c2c2e`): High-contrast surface for toasts and tooltips.

### Ink

- **`on-media`** (`#ffffff`): White ink over photographs and dark media surfaces; invariant across appearances.
- **`foreground`** (light `#000000`, dark `#ffffff`): Primary label ink (UIKit label).
- **`card-foreground`** (light `#000000`, dark `#ffffff`): Primary text and icon ink on card surfaces.
- **`popover-foreground`** (light `#000000`, dark `#ffffff`): Primary text and icon ink on popover surfaces.
- **`secondary-foreground`** (light `#000000`, dark `#ffffff`): Text and icon ink on secondary control surfaces.
- **`muted-foreground`** (light `#8a8a8e`, dark `#98989f`): Secondary label ink (UIKit secondaryLabel composited over card).
- **`accent-foreground`** (light `#000000`, dark `#ffffff`): Text and icon ink on accent surfaces.
- **`sidebar-foreground`** (light `#000000`, dark `#ffffff`): Primary text and icon ink inside the sidebar.
- **`sidebar-accent-foreground`** (light `#000000`, dark `#ffffff`): Text and icon ink on active sidebar rows.
- **`faint`** (light `#c5c5c7`, dark `#5a5a5f`): Tertiary label ink for placeholders and quiet captions (UIKit tertiaryLabel).
- **`inverse-foreground`** (light `#000000`, dark `#ffffff`): Primary text ink on inverse surfaces.

### Brand

- **`primary`** (light `#007aff`, dark `#0a84ff`): System accent blue (UIKit systemBlue).
- **`primary-foreground`** (`#ffffff`): Text and icon ink on primary brand action fills.
- **`sidebar-primary`** (light `#007aff`, dark `#0a84ff`): Primary action highlight color in the sidebar.
- **`sidebar-primary-foreground`** (`#ffffff`): Text and icon ink on sidebar-primary highlights.
- **`brand`** (light `#007aff`, dark `#0a84ff`): Inline brand accent ink (UIKit systemBlue).
- **`brand-edge`** (light `#dcdcdd`, dark `#353538`): Hairline border on primary accent-filled controls.
- **`brand-tint`** (light `#007aff1f`, dark `#0a84ff1f`): Translucent brand wash (12% brand over transparent).
- **`inverse-brand`** (`#ffffff`): Accent action color on inverse surfaces.

### Status

- **`destructive`** (light `#ff3b30`, dark `#ff453a`): System destructive red (UIKit systemRed).
- **`chart-1`** (light `#007aff`, dark `#0a84ff`): First chart series color (UIKit systemBlue).
- **`chart-2`** (light `#34c759`, dark `#30d158`): Second chart series color (UIKit systemGreen).
- **`chart-3`** (light `#ff9500`, dark `#ff9f0a`): Third chart series color (UIKit systemOrange).
- **`chart-4`** (light `#af52de`, dark `#bf5af2`): Fourth chart series color (UIKit systemPurple).
- **`chart-5`** (light `#ff3b30`, dark `#ff453a`): Fifth chart series color (UIKit systemRed).
- **`info`** (light `#007aff`, dark `#0a84ff`): Informational semantic color (UIKit systemBlue).
- **`warn`** (light `#ff9500`, dark `#ff9f0a`): Warning semantic color (UIKit systemOrange).
- **`up`** (light `#34c759`, dark `#30d158`): Positive trend semantic color (UIKit systemGreen).
- **`info-tint`** (light `#007aff1f`, dark `#0a84ff1f`): Translucent informational wash (12% info over transparent).
- **`warn-tint`** (light `#ff95001f`, dark `#ff9f0a1f`): Translucent warning wash (12% warn over transparent).
- **`destructive-tint`** (light `#ff3b301f`, dark `#ff453a1f`): Translucent destructive wash (12% destructive over transparent).
- **`up-tint`** (light `#34c7591f`, dark `#30d1581f`): Translucent positive wash (12% up over transparent).
- **`down-tint`** (light `#ff3b301f`, dark `#ff453a1f`): Translucent negative wash (12% destructive over transparent).
- **`violet`** (light `#af52de`, dark `#bf5af2`): Accent purple ink (UIKit systemPurple).

### Chrome

- **`border`** (light `#dcdcdd`, dark `#353538`): Hairline separator (UIKit separator hairline composited over card).
- **`input`** (light `#c6c6c8`, dark `#3e3e41`): Input control border (UIKit separator composited over card).
- **`ring`** (light `#007aff`, dark `#0a84ff`): Focus ring color matching UIKit systemBlue.
- **`sidebar-border`** (light `#dcdcdd`, dark `#353538`): Sidebar divider and toolbar hairline border color.
- **`sidebar-ring`** (light `#007aff`, dark `#0a84ff`): Focus indicator ring color inside the sidebar.
- **`glass-edge`** (light `#dcdcdd`, dark `#353538`): Hairline border on glass, pill, and floating overlay surfaces.
- **`line`** (light `#dcdcdd`, dark `#353538`): Inset divider hairline (UIKit hairline composited over card).
- **`ring-halo`** (light `#007aff4d`, dark `#0a84ff4d`): Outer keyboard focus halo (30% ring color over transparent).

## Typography

Semantic typography roles referencing tier-specific font.size and font.line-height.

- **Font stacks:** Font family stacks.
  - `sans` (`system-ui`): Primary sans-serif font family stack.
  - `mono` (`monospace`): Monospace font family for code blocks and numeric readouts.
  - Every role's `fontFamily` is `{font.family.sans}`.

- **`caption`** (10px (touch: 12px), weight 400, line-height 13px, line-height 16px on touch, letter-spacing 0px): Small captions and segmented counter labels.
- **`detail`** (11px (touch: 13px), weight 400, line-height 14px, line-height 18px on touch, letter-spacing 0px): Sidebar section labels, counts, and supporting metadata.
- **`body`** (13px (touch: 17px), weight 400, line-height 16px, line-height 22px on touch, letter-spacing 0px): Standard body copy, list rows, and dialog content.
- **`label`** (13px (touch: 17px), weight 500, line-height 16px, line-height 22px on touch, letter-spacing 0px): Control labels, form labels, and interactive triggers.
- **`title`** (13px (touch: 17px), weight 600, line-height 16px, line-height 22px on touch, letter-spacing 0px): Card and section headings.
- **`headline`** (22px, weight 600, line-height 26px, line-height 28px on touch, letter-spacing 0px): Page-level headings.
- **`display`** (26px (touch: 34px), weight 600, line-height 32px, line-height 41px on touch, letter-spacing 0px): Large display numerals and hero headings.

## Layout

Ergonomic sizing scales for pointer input.

- **Hit target:** Minimum hit target size (0 disables padding expansion).
- **Density:** Page-level padding and gap.
- **List rows:** A list's rows in a popup or a palette: inset, the container's edge to the row's fill; pad, the fill's edge to its text. shadcn's select and menus: 4 (SelectContent p-1) and 8 (SelectItem pl-2).
- **Control geometry:** Control internal spacing and switch size tier.
- **Control heights:** Standard control heights (sm, md, lg).
- **Switch size tier (pointer):** `regular`.
- **Icons:** Standard icon dimensions (sm, md, lg).

- **Pointer tier:** Apple macOS pointer input-tier overrides (Apple HIG Layout and Typography).
- **Touch tier:** Apple iOS touch input-tier overrides (Apple HIG Layout and Typography).

## Elevation & Depth

Apple Liquid Glass and Retina hairline depth: `glass`, `menu`, and `raised` finishes request `material.apple` (`glass: "regular"`) with iOS backdrop fallback (`ios.backdrop`) and 0.5px borders; other surfaces stay flat with subtle shadows.

- **Strokes:** Border stroke widths.
  - `stroke.hairline` (0.5px): Retina 0.5px hairline divider width per Apple HIG.
  - `stroke.control` (1px): Interactive control border width.
- **Focus indicator (`style: "halo"`):** Focus ring geometry and style enum.
  - `focus.width` (3px): Focus ring stroke width.
  - `focus.offset` (0px): Focus ring outward offset from control bounds.
- **State overlays (hover=0, focus=0, pressed=0, dragged=0):** State-layer ink opacities for hover, focus, pressed, and dragged states.

## Shapes

Apple HIG corner radius scale (8px control, 12px container, 26px modal; capsule buttons via shape.corners.button).

Non-dimensional corner curve and button capsule flag. (`curve: "continuous"`, `corners.button: "full"`).

Semantic corner radius roles by layer, referencing base dimension.radius.* tokens.

- **`control`** (8px): Corner radius for in-page elements: buttons, fields, rows, chips, badges, wells, color areas, and kbd.
- **`container`** (12px): Corner radius for containers and overlays: cards, menus, popovers, tooltips, list panels, toasts, and frames.
- **`modal`** (26px): Corner radius for modal surfaces: dialogs, sheets, and drawers.

**Control dimensions** (no DESIGN.md field; they decide how a control's own parts are drawn): Control dimensions: the six behaviour-named axes a theme decides for its controls (selection, field, choice, track, handle, group). Themes override only the axes that differ.
- **`selection`**: `plate`
- **`field`**: `box`
- **`choice`**: `well`
- **`track`**: `sunk`
- **`handle`**: `circle`
- **`group`**: `capsule`

## Motion & Micro-interaction

Interactive spring and timing physics roles: fast, default, slow, and the state fade.

- **`enter`** (420ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): Default surface entrance transition.
- **`fast`** (spring: stiffness=1218, damping=70 — omitted from YAML `motion` because DESIGN.md `Motion` only accepts `duration`/`delay`/`timingFunction`): Quickest response: small control toggles and thumbs.
- **`default`** (spring: stiffness=520, damping=34 — omitted from YAML `motion` because DESIGN.md `Motion` only accepts `duration`/`delay`/`timingFunction`): Everyday feedback: presses, releases and modest movement.
- **`slow`** (spring: stiffness=320, damping=30 — omitted from YAML `motion` because DESIGN.md `Motion` only accepts `duration`/`delay`/`timingFunction`): Slowest: large surfaces and long-travel layout movement.
- **`state`** (120ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): State fade: how fast hover, press and choice states come and go (upstream nsh-gallery-ui's hover wash, 120 ms ease-out).
- **Press & ripple** (`press-scale: 1`, `pressed-opacity: 0.7`, `ripple: false`): Interaction state opacities, press scale, and ripple switch.
- **Timing curves:** Named timing curves shared across themes.

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted: this theme defines visual tokens, surface finishes, typography metrics, and motion physics only; product copy, tone, capitalization, and terminology belong to the host application.

## Components

The neutral fields of every finish role, written once: a flat surface states no gradient, an opaque one no backdrop blur and no material, a layer no height of its own, a press that keeps the resting colours states no swap, and a top or bottom edge with no colour of its own takes the role's border color. A theme that states one writes the token (its own finishes.shared, or an appearance's) and it wins; the extension only says what the neutral is where no token states it, so a compiled finish carries every field in every theme.

- **`finish.card`** (backdropFilter: `none`): A surface that holds content: a card, a section.
- **`finish.inset`** (backdropFilter: `none`): A well cut into a surface: an inset, a field, a track, a groove.
- **`finish.channel`** (backdropFilter: `none`): The channel a group of choices sits in: a segmented control's track.
- **`finish.raised`** (backdropFilter: `blur(30px)`; material: `"glass"`): A control on a surface: a button, a chip, a pill.
- **`finish.plate`** (backdropFilter: `none`): A labelled block chosen inside a well: the selected tab, a segmented control's thumb.
- **`finish.overlay`** (backdropFilter: `blur(30px)`; material: `"glass"`): A panel floating over the page: a menu, a toast.
- **`finish.modal`** (backdropFilter: `none`): A surface the page waits for: a dialog, a sheet.
- **`finish.inverse`** (backdropFilter: `blur(30px)`; material: `"glass"`): The page's inverse: an inverse surface, a tooltip.
- **`finish.glass`** (backdropFilter: `blur(30px)`; material: `"glass"`): A translucent surface: what is behind it shows through.
- **`finish.accent`** (backdropFilter: `none`): The accent's own surface, with its ink.
- **`finish.fill`** (backdropFilter: `none`): A run's fill: a progress bar's bar, a slider's range, a meter's column.
- **`finish.knob`** (backdropFilter: `none`): A knob: a switch's thumb, a slider's handle. Its checked state, `checked-*`, is the knob while its control is on.
- **`finish.hover`** (backdropFilter: `none`): A control under the pointer.
- **`finish.pressed`** (backdropFilter: `none`): A control held down.
- **`finish.disabled`** (backdropFilter: `none`): A control that cannot be used.
- **Disabled handling** (content=0.3, fill=false): UIKit disabled content opacity multiplier (0.3); containers keep resting fills.

## Do's and Don'ts

- **Do:** Read all colors, radii, typography, and surface finishes through theme roles (`colors.*`, `shape.*`, `font.*`, `finish.*`) rather than literals in component code.
- **Do:** Read theme getters inside JSX render expressions or reactive effects so runtime theme switching (`selectTheme`) and light/dark appearance changes take effect on the next frame.
- **Do:** Use `rounded(shape.<role>, inset)` for concentric nested radii inside cards, switches, and segmented controls.
- **Do:** Use `999px` capsule corners on button-like controls (`shape.corners.button: "full"`) alongside `8px` controls/fields, `12px` containers, and `26px` modals with `shape.curve: "continuous"`.
- **Do:** Respect pointer (macOS: 13px body, 32px density row) vs touch (iOS: 17px body, 44px hit target) metrics.
- **Do:** Keep `material.apple` on `glass`, `menu`, and `raised` finishes and spread `platformMaterial()` on native views.
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never delete finish fields or alter the merged finish key set across appearances or themes.
- **Don't:** Do not replace Retina `0.5px` `stroke.hairline` with thick borders or `circular` corners.
- **Don't:** Do not set `macos.backdrop` when Liquid Glass `glassEffect` is active on macOS 26+.
