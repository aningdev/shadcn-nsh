---
version: alpha
name: "shadcn neutral"
description: "shadcn/ui neutral theme."
colors:
  scrim: "#00000080"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#ffffff"
    foreground: "#0a0a0a"
    card: "#ffffff"
    card-foreground: "#0a0a0a"
    popover: "#ffffff"
    popover-foreground: "#0a0a0a"
    primary: "#171717"
    primary-foreground: "#fafafa"
    secondary: "#f5f5f5"
    secondary-foreground: "#0a0a0a"
    muted: "#f5f5f5"
    muted-foreground: "#737373"
    accent: "#f5f5f5"
    accent-foreground: "#0a0a0a"
    destructive: "#e7000b"
    border: "#e5e5e5"
    input: "#e5e5e5"
    ring: "#a1a1a1"
    chart-1: "#d4d4d4"
    chart-2: "#737373"
    chart-3: "#525252"
    chart-4: "#404040"
    chart-5: "#262626"
    sidebar: "#fafafa"
    sidebar-foreground: "#0a0a0a"
    sidebar-primary: "#171717"
    sidebar-primary-foreground: "#fafafa"
    sidebar-accent: "#f5f5f5"
    sidebar-accent-foreground: "#0a0a0a"
    sidebar-border: "#e5e5e5"
    sidebar-ring: "#a1a1a1"
    inset: "#f5f5f5"
    raised: "#f5f5f5"
    glass-edge: "#e5e5e5"
    field: "#ffffff"
    line: "#e5e5e5"
    hover: "#f5f5f5"
    ring-halo: "#a1a1a180"
    faint: "#a1a1a1"
    brand: "#171717"
    brand-edge: "#e5e5e5"
    track: "#f5f5f5"
    knob: "#ffffff"
    info: "#737373"
    warn: "#525252"
    up: "#404040"
    brand-tint: "#1717171a"
    inverse: "#ffffff"
    inverse-foreground: "#0a0a0a"
    inverse-brand: "#fafafa"
    info-tint: "#7373731a"
    warn-tint: "#5252521a"
    destructive-tint: "#e7000b1a"
    up-tint: "#4040401a"
    down-tint: "#e7000b1a"
    violet: "#262626"
  dark:
    background: "#0a0a0a"
    foreground: "#fafafa"
    card: "#171717"
    card-foreground: "#fafafa"
    popover: "#171717"
    popover-foreground: "#fafafa"
    primary: "#e5e5e5"
    primary-foreground: "#171717"
    secondary: "#262626"
    secondary-foreground: "#fafafa"
    muted: "#262626"
    muted-foreground: "#a1a1a1"
    accent: "#262626"
    accent-foreground: "#fafafa"
    destructive: "#ff6467"
    border: "#ffffff1a"
    input: "#ffffff26"
    ring: "#737373"
    chart-1: "#d4d4d4"
    chart-2: "#737373"
    chart-3: "#525252"
    chart-4: "#404040"
    chart-5: "#262626"
    sidebar: "#171717"
    sidebar-foreground: "#fafafa"
    sidebar-primary: "#e5e5e5"
    sidebar-primary-foreground: "#171717"
    sidebar-accent: "#262626"
    sidebar-accent-foreground: "#fafafa"
    sidebar-border: "#ffffff1a"
    sidebar-ring: "#737373"
    inset: "#262626"
    raised: "#262626"
    glass-edge: "#ffffff1a"
    field: "#ffffff0b"
    line: "#ffffff1a"
    hover: "#262626"
    ring-halo: "#73737380"
    faint: "#a1a1a1"
    brand: "#e5e5e5"
    brand-edge: "#ffffff1a"
    track: "#262626"
    knob: "#fafafa"
    info: "#a1a1a1"
    warn: "#d4d4d4"
    up: "#e5e5e5"
    brand-tint: "#e5e5e51a"
    inverse: "#171717"
    inverse-foreground: "#fafafa"
    inverse-brand: "#171717"
    info-tint: "#a1a1a11a"
    warn-tint: "#d4d4d41a"
    destructive-tint: "#ff64671a"
    up-tint: "#e5e5e51a"
    down-tint: "#ff64671a"
    violet: "#fafafa"
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
    backgroundColor: "{colors.light.hover}"
  button-secondary-pressed:
    backgroundColor: "{colors.light.border}"
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
    backgroundColor: "{colors.light.muted}"
    textColor: "{colors.light.secondary-foreground}"
    typography: "{typography.caption}"
    rounded: "{rounded.control}"
  menu-popover:
    backgroundColor: "{colors.light.card}"
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
    backgroundColor: "{colors.light.primary}"
  switch-knob:
    backgroundColor: "{colors.light.knob}"
  switch-knob-on:
    backgroundColor: "{colors.light.background}"
  slider-handle:
    backgroundColor: "#ffffff"
  tabs-thumb:
    backgroundColor: "#ffffff"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  toggle-on:
    backgroundColor: "{colors.light.chart-1}"
    textColor: "{colors.light.foreground}"
    rounded: "{rounded.control}"
  glass-overlay:
    backgroundColor: "#ffffffcc"
    textColor: "{colors.light.popover-foreground}"
    rounded: "{rounded.container}"
---

# shadcn neutral

## Overview

shadcn/ui neutral theme.

shadcn/ui's neutral palette paired with flat surfaces (`state.press-scale: 1`) and Tailwind-style border/shadow lifts (`references/shadcn-ui` `new-york-v4`).

## Colors

- **Shared (C-layer):** Appearance-invariant C-layer color roles shared by light and dark modes.
- **Light:** Adaptive A-layer and B-layer color roles for light appearance.
- **Dark:** Adaptive A-layer and B-layer color roles for dark appearance.

### Surface

- **`scrim`** (`#00000080`): Translucent backdrop scrim behind modals and sheets (50% black).
- **`media`** (`#10131a`): Ground behind photographs and videos; invariant across appearances.
- **`background`** (light `#ffffff`, dark `#0a0a0a`): Primary application page canvas background.
- **`card`** (light `#ffffff`, dark `#171717`): Elevated surface background for cards and panels.
- **`popover`** (light `#ffffff`, dark `#171717`): Floating surface background for menus, popovers, and tooltips.
- **`secondary`** (light `#f5f5f5`, dark `#262626`): Secondary control surface fill.
- **`muted`** (light `#f5f5f5`, dark `#262626`): Subdued container and subtle background surface.
- **`accent`** (light `#f5f5f5`, dark `#262626`): Subtle highlight fill for hovered or active items.
- **`sidebar`** (light `#fafafa`, dark `#171717`): Navigation sidebar panel background.
- **`sidebar-accent`** (light `#f5f5f5`, dark `#262626`): Selected or active row fill in the sidebar.
- **`inset`** (light `#f5f5f5`, dark `#262626`): Recessed well surface nested inside a card.
- **`raised`** (light `#f5f5f5`, dark `#262626`): Raised control surface resting on a card.
- **`field`** (light `#ffffff`, dark `#ffffff0b`): Input well surface below card and inset layers.
- **`hover`** (light `#f5f5f5`, dark `#262626`): Pointer hover fill aliased to {color.accent} per shadcn hover:bg-accent.
- **`track`** (light `#f5f5f5`, dark `#262626`): Inactive track background for switches, sliders, and progress bars.
- **`knob`** (light `#ffffff`, dark `#fafafa`): Switch thumb fill in the off state.
- **`inverse`** (light `#ffffff`, dark `#171717`): High-contrast surface for toasts and tooltips.

### Ink

- **`on-media`** (`#ffffff`): White ink over photographs and dark media surfaces; invariant across appearances.
- **`foreground`** (light `#0a0a0a`, dark `#fafafa`): Default high-contrast text and icon ink on page surfaces.
- **`card-foreground`** (light `#0a0a0a`, dark `#fafafa`): Primary text and icon ink on card surfaces.
- **`popover-foreground`** (light `#0a0a0a`, dark `#fafafa`): Primary text and icon ink on popover surfaces.
- **`secondary-foreground`** (light `#0a0a0a`, dark `#fafafa`): Text and icon ink on secondary control surfaces.
- **`muted-foreground`** (light `#737373`, dark `#a1a1a1`): Secondary and supporting text and icon ink.
- **`accent-foreground`** (light `#0a0a0a`, dark `#fafafa`): Text and icon ink on accent surfaces.
- **`sidebar-foreground`** (light `#0a0a0a`, dark `#fafafa`): Primary text and icon ink inside the sidebar.
- **`sidebar-accent-foreground`** (light `#0a0a0a`, dark `#fafafa`): Text and icon ink on active sidebar rows.
- **`faint`** (`#a1a1a1`): Low-emphasis text for placeholders, units, and tertiary labels.
- **`inverse-foreground`** (light `#0a0a0a`, dark `#fafafa`): Primary text ink on inverse surfaces.

### Brand

- **`primary`** (light `#171717`, dark `#e5e5e5`): Primary brand action fill.
- **`primary-foreground`** (light `#fafafa`, dark `#171717`): Text and icon ink on primary brand action fills.
- **`sidebar-primary`** (light `#171717`, dark `#e5e5e5`): Primary action highlight color in the sidebar.
- **`sidebar-primary-foreground`** (light `#fafafa`, dark `#171717`): Text and icon ink on sidebar-primary highlights.
- **`brand`** (light `#171717`, dark `#e5e5e5`): Accent ink for text, icons, and active rules.
- **`brand-edge`** (light `#e5e5e5`, dark `#ffffff1a`): Hairline border aliased to {color.border} (shadcn draws no separate brand edge).
- **`brand-tint`** (light `#1717171a`, dark `#e5e5e51a`): Translucent brand-accent wash behind selected rows and tinted bubbles.
- **`inverse-brand`** (light `#fafafa`, dark `#171717`): Accent action color on inverse surfaces.

### Status

- **`destructive`** (light `#e7000b`, dark `#ff6467`): Semantic danger color for destructive actions and errors.
- **`chart-1`** (`#d4d4d4`): Primary chart series color.
- **`chart-2`** (`#737373`): Second chart series color.
- **`chart-3`** (`#525252`): Third chart series color.
- **`chart-4`** (`#404040`): Fourth chart series color.
- **`chart-5`** (`#262626`): Fifth chart series color.
- **`info`** (light `#737373`, dark `#a1a1a1`): Informational semantic status color mapped onto shadcn's neutral grey ramp.
- **`warn`** (light `#525252`, dark `#d4d4d4`): Warning semantic status color mapped onto shadcn's neutral chart ramp.
- **`up`** (light `#404040`, dark `#e5e5e5`): Positive trend color mapped onto shadcn's neutral ramp.
- **`info-tint`** (light `#7373731a`, dark `#a1a1a11a`): Translucent informational status background tint.
- **`warn-tint`** (light `#5252521a`, dark `#d4d4d41a`): Translucent warning status background tint.
- **`destructive-tint`** (light `#e7000b1a`, dark `#ff64671a`): Translucent destructive status background tint.
- **`up-tint`** (light `#4040401a`, dark `#e5e5e51a`): Translucent positive trend background tint.
- **`down-tint`** (light `#e7000b1a`, dark `#ff64671a`): Translucent negative trend background tint.
- **`violet`** (light `#262626`, dark `#fafafa`): Accent data-visualization and link color mapped onto shadcn's neutral ramp.

### Chrome

- **`border`** (light `#e5e5e5`, dark `#ffffff1a`): Standard hairline border color for containers and controls.
- **`input`** (light `#e5e5e5`, dark `#ffffff26`): Border and stroke color for form fields and control edges.
- **`ring`** (light `#a1a1a1`, dark `#737373`): Focus indicator ring stroke color.
- **`sidebar-border`** (light `#e5e5e5`, dark `#ffffff1a`): Sidebar divider and toolbar hairline border color.
- **`sidebar-ring`** (light `#a1a1a1`, dark `#737373`): Focus indicator ring color inside the sidebar.
- **`glass-edge`** (light `#e5e5e5`, dark `#ffffff1a`): Hairline border aliased to {color.border} (shadcn draws no separate glass edge).
- **`line`** (light `#e5e5e5`, dark `#ffffff1a`): Hairline divider and grid rule inside recessed wells.
- **`ring-halo`** (light `#a1a1a180`, dark `#73737380`): Translucent outer halo around focused controls.

## Typography

Semantic typography roles referencing tier-specific font.size and font.line-height.

- **Font stacks:** Font family stacks.
  - `sans` (`system-ui`): Primary sans-serif font family stack.
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

Flat elevation model: cards and floating surfaces sit on neutral background steps with subtle drop shadows and crisp 1px borders rather than inner specular highlights or glass blur.

- **Strokes:** Border stroke widths.
  - `stroke.hairline` (1px): Hairline width for dividers, container edges (cards, drawers, overlays) and outlined variants.
  - `stroke.control` (1px): Interactive control border width.
- **Focus indicator (`style: "halo"`):** Focus ring geometry and style enum.
  - `focus.width` (3px): Focus ring stroke width.
  - `focus.offset` (0px): Focus ring outward offset from control bounds.
- **State overlays (hover=0, focus=0, pressed=0, dragged=0):** State-layer ink opacities for hover, focus, pressed, and dragged states.

## Shapes

Base corner radius scale referenced by semantic shape roles.

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
- **Press & ripple** (`press-scale: 1`, `pressed-opacity: 0.7`, `ripple: false`): Interaction state opacities, press scale, and ripple switch.
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
- **Do:** Keep press interactions flat (`state.press-scale: 1`); signal hover and press via surface and opacity changes.
- **Do:** Preserve the 31 shadcn A-layer color slots (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar*`).
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never delete finish fields or alter the merged finish key set across appearances or themes.
- **Don't:** Do not add backdrop blur, specular rim highlights, or spring press shrink to flat shadcn finishes.
