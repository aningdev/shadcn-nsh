---
version: alpha
name: "NSH Gallery UI"
description: "Default NSH Gallery UI theme."
colors:
  scrim: "#00000073"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#f6f6f9"
    foreground: "#101319"
    card: "#ffffff"
    card-foreground: "#101319"
    popover: "#f8f8fb"
    popover-foreground: "#101319"
    primary: "#c6ef6a"
    primary-foreground: "#13160c"
    secondary: "#f3f4f7"
    secondary-foreground: "#101319"
    muted: "#eeeff2"
    muted-foreground: "#5f636a"
    accent: "#e8eaec"
    accent-foreground: "#101319"
    destructive: "#d43a4a"
    border: "#cacbcd"
    input: "#c1c2c4"
    ring: "#a3a8b2"
    chart-1: "#8fc21f"
    chart-2: "#3a3d43"
    chart-3: "#7d828b"
    chart-4: "#b4b8bf"
    chart-5: "#dedfe2"
    sidebar: "#ecedf0"
    sidebar-foreground: "#101319"
    sidebar-primary: "#c6ef6a"
    sidebar-primary-foreground: "#13160c"
    sidebar-accent: "#ffffff"
    sidebar-accent-foreground: "#101319"
    sidebar-border: "#dedee1"
    sidebar-ring: "#a3a8b2"
    inset: "#f1f2f5"
    raised: "#f3f4f7"
    glass-edge: "#cacbcd"
    field: "#ffffff"
    line: "#e4e4e7"
    hover: "#1013190d"
    ring-halo: "#a3a8b224"
    faint: "#9a9da3"
    brand: "#447e00"
    brand-edge: "#9cc43a"
    track: "#e9eaed"
    knob: "#ffffff"
    info: "#3d63d1"
    warn: "#b26a00"
    up: "#138a5a"
    brand-tint: "#8cc01d29"
    inverse: "#f8f8fb"
    inverse-foreground: "#101319"
    inverse-brand: "#13160c"
    info-tint: "#3d63d11a"
    warn-tint: "#b26a001c"
    destructive-tint: "#d43a4a1a"
    up-tint: "#138a5a1a"
    down-tint: "#d43a4a1a"
    violet: "#6e56c4"
  dark:
    background: "#16191f"
    foreground: "#eeeff1"
    card: "#1f2228"
    card-foreground: "#eeeff1"
    popover: "#1f2228"
    popover-foreground: "#eeeff1"
    primary: "#c4ec6a"
    primary-foreground: "#13160c"
    secondary: "#33353b"
    secondary-foreground: "#eeeff1"
    muted: "#2a2d33"
    muted-foreground: "#9a9ea5"
    accent: "#303339"
    accent-foreground: "#eeeff1"
    destructive: "#ff6170"
    border: "#31343a"
    input: "#393c42"
    ring: "#5d636e"
    chart-1: "#c8f26d"
    chart-2: "#e5e6e9"
    chart-3: "#9ea2aa"
    chart-4: "#686c74"
    chart-5: "#43464c"
    sidebar: "#101319"
    sidebar-foreground: "#eeeff1"
    sidebar-primary: "#c4ec6a"
    sidebar-primary-foreground: "#13160c"
    sidebar-accent: "#25282e"
    sidebar-accent-foreground: "#eeeff1"
    sidebar-border: "#24272d"
    sidebar-ring: "#5d636e"
    inset: "#1a1d23"
    raised: "#33353b"
    glass-edge: "#31343a"
    field: "#16191f"
    line: "#2d3036"
    hover: "#eeeff10d"
    ring-halo: "#5d636e24"
    faint: "#6b6f76"
    brand: "#c8f26d"
    brand-edge: "#283c008c"
    track: "#33363c"
    knob: "#e4e5e8"
    info: "#7ea8ff"
    warn: "#ffb547"
    up: "#45d49a"
    brand-tint: "#c8f26d24"
    inverse: "#1f2228"
    inverse-foreground: "#eeeff1"
    inverse-brand: "#13160c"
    info-tint: "#7ea8ff29"
    warn-tint: "#ffb54729"
    destructive-tint: "#ff617029"
    up-tint: "#45d49a29"
    down-tint: "#ff617029"
    violet: "#b9a2ff"
typography:
  caption:
    fontFamily: system-ui
    fontSize: 11px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  detail:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  body:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  title:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  headline:
    fontFamily: system-ui
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
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
  modal: 14px
spacing:
  hit: 0px
  density:
    pad: 12px
    gap: 12px
    surface: 10px
  control:
    padding: 8px
    gap: 8px
    dot: 6px
  height:
    sm: 24px
    md: 28px
    lg: 32px
  stroke:
    hairline: 1px
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
    backgroundColor: "{colors.light.popover}"
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
    padding: "{spacing.density.surface}"
  input-field:
    backgroundColor: "{colors.light.field}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.control.padding}"
  badge-chip:
    backgroundColor: "{colors.light.raised}"
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
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.card-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "{colors.light.popover}"
    textColor: "{colors.light.inverse-foreground}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
  toast-inverse:
    backgroundColor: "{colors.light.inverse}"
    textColor: "{colors.light.inverse-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
  switch-track:
    backgroundColor: "{colors.light.track}"
    rounded: "{rounded.control}"
  switch-track-on:
    backgroundColor: "#a2d33c"
  switch-knob:
    backgroundColor: "#ffffff"
  switch-knob-on:
    backgroundColor: "#ffffff"
  slider-handle:
    backgroundColor: "#ffffff"
  tabs-thumb:
    backgroundColor: "#ffffff"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  toggle-on:
    backgroundColor: "#dbdce0"
    textColor: "{colors.light.foreground}"
    rounded: "{rounded.control}"
  glass-overlay:
    backgroundColor: "#f8f8fbcc"
    textColor: "{colors.light.popover-foreground}"
    rounded: "{rounded.container}"
---

# NSH Gallery UI

## Overview

Default NSH Gallery UI theme.

NSH Gallery UI default theme: graphite dark and paper light surfaces with citrus lime (`#c6ef6a`) brand fill, continuous squircle corners, spring motion physics, and layered surface finishes.

## Colors

- **Shared (C-layer):** Appearance-invariant C-layer color roles shared by light and dark modes.
- **Light:** Adaptive A-layer and B-layer color roles for light appearance.
- **Dark:** Adaptive A-layer and B-layer color roles for dark appearance.

### Surface

- **`scrim`** (`#00000073`): Translucent backdrop scrim behind modals and sheets.
- **`media`** (`#10131a`): Ground behind photographs and videos; invariant across appearances.
- **`background`** (light `#f6f6f9`, dark `#16191f`): Primary application page canvas background.
- **`card`** (light `#ffffff`, dark `#1f2228`): Elevated surface background for cards and panels.
- **`popover`** (light `#f8f8fb`, dark `#1f2228`): Floating surface background for menus, popovers, and tooltips.
- **`secondary`** (light `#f3f4f7`, dark `#33353b`): Secondary control surface fill.
- **`muted`** (light `#eeeff2`, dark `#2a2d33`): Subdued container and subtle background surface.
- **`accent`** (light `#e8eaec`, dark `#303339`): Subtle highlight fill for hovered or active items.
- **`sidebar`** (light `#ecedf0`, dark `#101319`): Navigation sidebar panel background.
- **`sidebar-accent`** (light `#ffffff`, dark `#25282e`): Selected or active row fill in the sidebar.
- **`inset`** (light `#f1f2f5`, dark `#1a1d23`): Recessed well surface nested inside a card.
- **`raised`** (light `#f3f4f7`, dark `#33353b`): Raised control surface resting on a card.
- **`field`** (light `#ffffff`, dark `#16191f`): Input well surface below card and inset layers.
- **`hover`** (light `#1013190d`, dark `#eeeff10d`): Pointer hover overlay fill on interactive items.
- **`track`** (light `#e9eaed`, dark `#33363c`): Inactive track background for switches, sliders, and progress bars.
- **`knob`** (light `#ffffff`, dark `#e4e5e8`): Switch thumb fill in the off state.
- **`inverse`** (light `#f8f8fb`, dark `#1f2228`): High-contrast surface for toasts and tooltips.

### Ink

- **`on-media`** (`#ffffff`): White ink over photographs and dark media surfaces; invariant across appearances.
- **`foreground`** (light `#101319`, dark `#eeeff1`): Default high-contrast text and icon ink on page surfaces.
- **`card-foreground`** (light `#101319`, dark `#eeeff1`): Primary text and icon ink on card surfaces.
- **`popover-foreground`** (light `#101319`, dark `#eeeff1`): Primary text and icon ink on popover surfaces.
- **`secondary-foreground`** (light `#101319`, dark `#eeeff1`): Text and icon ink on secondary control surfaces.
- **`muted-foreground`** (light `#5f636a`, dark `#9a9ea5`): Secondary and supporting text and icon ink.
- **`accent-foreground`** (light `#101319`, dark `#eeeff1`): Text and icon ink on accent surfaces.
- **`sidebar-foreground`** (light `#101319`, dark `#eeeff1`): Primary text and icon ink inside the sidebar.
- **`sidebar-accent-foreground`** (light `#101319`, dark `#eeeff1`): Text and icon ink on active sidebar rows.
- **`faint`** (light `#9a9da3`, dark `#6b6f76`): Low-emphasis text for placeholders, units, and tertiary labels.
- **`inverse-foreground`** (light `#101319`, dark `#eeeff1`): Primary text ink on inverse surfaces.

### Brand

- **`primary`** (light `#c6ef6a`, dark `#c4ec6a`): Primary brand action fill.
- **`primary-foreground`** (`#13160c`): Text and icon ink on primary brand action fills.
- **`sidebar-primary`** (light `#c6ef6a`, dark `#c4ec6a`): Primary action highlight color in the sidebar.
- **`sidebar-primary-foreground`** (`#13160c`): Text and icon ink on sidebar-primary highlights.
- **`brand`** (light `#447e00`, dark `#c8f26d`): Accent ink for text, icons, and active rules.
- **`brand-edge`** (light `#9cc43a`, dark `#283c008c`): Hairline border on primary accent-filled controls.
- **`brand-tint`** (light `#8cc01d29`, dark `#c8f26d24`): Translucent brand-accent wash behind selected rows and tinted bubbles.
- **`inverse-brand`** (`#13160c`): Accent action color on inverse surfaces.

### Status

- **`destructive`** (light `#d43a4a`, dark `#ff6170`): Semantic danger color for destructive actions and errors.
- **`chart-1`** (light `#8fc21f`, dark `#c8f26d`): Primary chart series color.
- **`chart-2`** (light `#3a3d43`, dark `#e5e6e9`): Second chart series color.
- **`chart-3`** (light `#7d828b`, dark `#9ea2aa`): Third chart series color.
- **`chart-4`** (light `#b4b8bf`, dark `#686c74`): Fourth chart series color.
- **`chart-5`** (light `#dedfe2`, dark `#43464c`): Fifth chart series color.
- **`info`** (light `#3d63d1`, dark `#7ea8ff`): Informational semantic status color.
- **`warn`** (light `#b26a00`, dark `#ffb547`): Warning semantic status color.
- **`up`** (light `#138a5a`, dark `#45d49a`): Positive trend and growth semantic color.
- **`info-tint`** (light `#3d63d11a`, dark `#7ea8ff29`): Translucent informational status background tint.
- **`warn-tint`** (light `#b26a001c`, dark `#ffb54729`): Translucent warning status background tint.
- **`destructive-tint`** (light `#d43a4a1a`, dark `#ff617029`): Translucent destructive status background tint.
- **`up-tint`** (light `#138a5a1a`, dark `#45d49a29`): Translucent positive trend background tint.
- **`down-tint`** (light `#d43a4a1a`, dark `#ff617029`): Translucent negative trend background tint.
- **`violet`** (light `#6e56c4`, dark `#b9a2ff`): Accent data-visualization and link color.

### Chrome

- **`border`** (light `#cacbcd`, dark `#31343a`): Standard hairline border color for containers and controls.
- **`input`** (light `#c1c2c4`, dark `#393c42`): Border and stroke color for form fields and control edges.
- **`ring`** (light `#a3a8b2`, dark `#5d636e`): Focus indicator ring stroke color.
- **`sidebar-border`** (light `#dedee1`, dark `#24272d`): Sidebar divider and toolbar hairline border color.
- **`sidebar-ring`** (light `#a3a8b2`, dark `#5d636e`): Focus indicator ring color inside the sidebar.
- **`glass-edge`** (light `#cacbcd`, dark `#31343a`): Hairline border on glass, pill, and floating overlay surfaces.
- **`line`** (light `#e4e4e7`, dark `#2d3036`): Hairline divider and grid rule inside recessed wells.
- **`ring-halo`** (light `#a3a8b224`, dark `#5d636e24`): Translucent outer halo around focused controls.

## Typography

Semantic typography roles referencing tier-specific font.size and font.line-height.

- **Font stacks:** Font family stacks.
  - `sans` (`system-ui`): The UI's font: the platform's own sans-serif.
  - `mono` (`monospace`): Monospace font family for code blocks and numeric readouts.
  - Every role's `fontFamily` is `{font.family.sans}`.

- **`caption`** (11px (touch: 12px), weight 400, line-height 16px, letter-spacing 0px): Small captions and segmented counter labels.
- **`detail`** (12px (touch: 13px), weight 400, line-height 16px, line-height 20px on touch, letter-spacing 0px): Sidebar section labels, counts, and supporting metadata.
- **`body`** (13px (touch: 15px), weight 400, line-height 20px, letter-spacing 0px): Standard body copy, list rows, and dialog content.
- **`label`** (14px (touch: 15px), weight 500, line-height 20px, letter-spacing 0px): Control labels, form labels, and interactive triggers.
- **`title`** (16px, weight 600, line-height 24px, letter-spacing 0px): Card and section headings.
- **`headline`** (20px (touch: 22px), weight 600, line-height 28px, letter-spacing 0px): Page-level headings.
- **`display`** (26px (touch: 28px), weight 600, line-height 32px, line-height 36px on touch, letter-spacing 0px): Large display numerals and hero headings.

## Layout

Ergonomic sizing scales for pointer input.

- **Hit target:** Minimum hit target size (0 disables padding expansion).
- **Density:** Page-level padding, gap, and surface spacing metrics.
- **Control geometry:** Control internal spacing and switch size tier.
- **Control heights:** Standard control heights (sm, md, lg).
- **Switch size tier (pointer):** `small`.
- **Icons:** Standard icon dimensions (sm, md, lg).

- **Pointer tier:** Default pointer input-tier metrics.
- **Touch tier:** Default touch input-tier metrics.

## Elevation & Depth

Tactile layered elevation: inner top-edge highlights (`inset`), 1px hairline borders, contact + cast drop shadows (`card`, `menu`, `modal`, `inverse`), and translucent frosted glass (`glass` with 80% popover alpha).

- **Strokes:** Border stroke widths.
  - `stroke.hairline` (1px): Hairline width for dividers, container edges (cards, drawers, overlays) and outlined variants.
  - `stroke.control` (1px): Interactive control border width.
- **Focus indicator (`style: "halo"`):** Focus ring geometry and style enum.
  - `focus.width` (3px): Focus ring stroke width.
  - `focus.offset` (0px): Focus ring outward offset from control bounds.
- **State overlays (hover=0, focus=0, pressed=0, dragged=0):** State-layer ink opacities for hover, focus, pressed, and dragged states.

## Shapes

Corner radius roles by layer (8px control, 12px container, 14px modal) referenced by semantic shape roles.

Non-dimensional corner curve and button capsule flag. (`curve: "continuous"`, `corners.button: "radius"`).

Semantic corner radius roles by layer, referencing base dimension.radius.* tokens.

- **`control`** (8px): Corner radius for in-page elements: buttons, fields, rows, chips, badges, wells, color areas, and kbd.
- **`container`** (12px): Corner radius for containers and overlays: cards, menus, popovers, tooltips, list panels, toasts, and frames.
- **`modal`** (14px): Corner radius for modal surfaces: dialogs, sheets, and drawers.

## Motion & Micro-interaction

Interactive spring and timing physics roles: fast, default, slow.

- **`enter`** (420ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): Default surface entrance transition.
- **`fast`** (spring: stiffness=1218, damping=70 — omitted from YAML `motion` because DESIGN.md `Motion` only accepts `duration`/`delay`/`timingFunction`): Quickest response: small control toggles and thumbs.
- **`default`** (spring: stiffness=520, damping=34 — omitted from YAML `motion` because DESIGN.md `Motion` only accepts `duration`/`delay`/`timingFunction`): Everyday feedback: presses, releases and modest movement.
- **`slow`** (spring: stiffness=320, damping=30 — omitted from YAML `motion` because DESIGN.md `Motion` only accepts `duration`/`delay`/`timingFunction`): Slowest: large surfaces and long-travel layout movement.
- **Press & ripple** (`press-scale: 0.97`, `pressed-opacity: 0.7`, `ripple: false`): Interaction state opacities, press scale, and ripple switch.
- **Timing curves:** Named timing curves shared across themes.

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted: this theme defines visual tokens, surface finishes, typography metrics, and motion physics only; product copy, tone, capitalization, and terminology belong to the host application.

## Components

Appearance-invariant surface finish recipes (background, gradient, border, shadow, blur, material).

- **`finish.card`**: The card face: an inner highlight, a hairline, a contact shadow and a cast one.
- **`finish.section`**: The flat surface a section's content or card sits on (no shadow by default).
- **`finish.inset`**: The well inside a card: sunk by its inner shadow alone.
- **`finish.field`**: A field well: its edge and its inner shadow.
- **`finish.raised`** (backdropFilter: `none`): A control on a card: a gradient, an inner highlight, a hard shadow, an edge.
- **`finish.hover`**: The step the surface takes under the pointer.
- **`finish.pressed`**: The step it takes while pressed.
- **`finish.disabled`**: A disabled control's container and its ink.
- **`finish.light`**: The main action brightest step: the accent gradient.
- **`finish.accent`**: The accent face (the same as light).
- **`finish.accentPressed`**: The accent control surface while pressed: the accent's own fill at 88 % and ink, so the border and shadow stay full.
- **`finish.track`**: A groove: an inner shadow and an edge.
- **`finish.fill`**: The filled run: a slider, a progress bar, a switch that is on.
- **`finish.knob`**: A switch knob, off.
- **`finish.knobOn`**: A switch knob, on.
- **`finish.handle`**: A slider handle (kept apart from knob).
- **`finish.pill`**: The upstream capsule, left to the app.
- **`finish.thumb`**: The chosen segment of a segmented control or a tag.
- **`finish.on`**: A chosen switch or box, and the mark on it.
- **`finish.chip`**: A chosen value label inside a field: a fill, an inner highlight and an edge.
- **`finish.glass`** (backdropFilter: `blur(20px)`): Glass: a translucent fill and a blur.
- **`finish.menu`** (backdropFilter: `none`): A floating surface: a menu, a popover.
- **`finish.modal`**: A modal face: the card colour with the menu shadow.
- **`finish.grabber`**: The drag handle pill at the top of a bottom sheet.
- **`finish.tooltip`**: A tooltip face: the popover pane, without a shadow.
- **`finish.inverse`** (backdropFilter: `none`): The inverse surface: a toast face.
- **`finish.groove`**: A groove cut inside a menu.
- **Disabled handling** (content=0.5, fill=false): Disabled content opacity multiplier and whether containers switch to a dedicated disabled fill.

## Do's and Don'ts

- **Do:** Read all colors, radii, typography, and surface finishes through theme roles (`colors.*`, `shape.*`, `font.*`, `finish.*`) rather than literals in component code.
- **Do:** Read theme getters inside JSX render expressions or reactive effects so runtime theme switching (`selectTheme`) and light/dark appearance changes take effect on the next frame.
- **Do:** Use `rounded(shape.<role>, inset)` for concentric nested radii inside cards, switches, and segmented controls.
- **Do:** Preserve the citrus accent (`primary` / `primary-foreground`) for primary actions, active runs, and focus highlights.
- **Do:** Use `inset` wells inside cards and `raised` surfaces for controls sitting on cards, paired with continuous squircle corners (`shape.curve: "continuous"`).
- **Do:** Apply tactile spring press feedback (`state.press-scale: 0.97`, `motion.default` / `motion.slow`).
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never delete finish fields or alter the merged finish key set across appearances or themes.
- **Don't:** Do not flatten shadows or remove inner highlights on `card`, `raised`, `inset`, or `pill` finishes.
- **Don't:** Do not merge distinct semantic finishes (`light` vs `accent`, `thumb` vs `raised`, `knob` vs `handle`).
