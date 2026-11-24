---
version: alpha
name: "Solid Glass"
description: "Solid Glass theme."
colors:
  scrim: "#00000080"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#e4e6eb"
    foreground: "#0d0d0d"
    card: "#eff1f5"
    card-foreground: "#0d0d0d"
    popover: "#eff1f5"
    popover-foreground: "#0d0d0d"
    primary: "#161616"
    primary-foreground: "#fafafa"
    secondary: "#ffffff8c"
    secondary-foreground: "#0d0d0d"
    muted: "#292e3812"
    muted-foreground: "#5b5b5b"
    accent: "#292e3812"
    accent-foreground: "#0d0d0d"
    destructive: "#e7000b"
    border: "#292e3821"
    input: "#292e3821"
    ring: "#161616"
    chart-1: "#222323"
    chart-2: "#4e4e50"
    chart-3: "#6e6f71"
    chart-4: "#8e8f92"
    chart-5: "#aeb0b4"
    sidebar: "#e4e6eb"
    sidebar-foreground: "#0d0d0d"
    sidebar-primary: "#161616"
    sidebar-primary-foreground: "#fafafa"
    sidebar-accent: "#292e3812"
    sidebar-accent-foreground: "#0d0d0d"
    sidebar-border: "#292e3821"
    sidebar-ring: "#161616"
    inset: "#292e3812"
    raised: "#ffffff8c"
    field: "#eff1f5"
    line: "#292e3821"
    hover: "#292e3812"
    faint: "#9e9e9e"
    brand: "#161616"
    brand-edge: "#292e3821"
    track: "#292e3812"
    knob: "#eff1f5"
    info: "#0078cc"
    warn: "#d87400"
    up: "#0a924b"
    brand-tint: "#1616161f"
    inverse: "#eff1f5"
    inverse-foreground: "#0d0d0d"
    inverse-brand: "#fafafa"
    info-tint: "#0078cc1f"
    warn-tint: "#d874001f"
    destructive-tint: "#e7000b1f"
    up-tint: "#0a924b1f"
    down-tint: "#e7000b1f"
  dark:
    background: "#0d0d0d"
    foreground: "#fafafa"
    card: "#1d1d1d"
    card-foreground: "#fafafa"
    popover: "#1d1d1d"
    popover-foreground: "#fafafa"
    primary: "#ebebeb"
    primary-foreground: "#121212"
    secondary: "#ffffff12"
    secondary-foreground: "#fafafa"
    muted: "#ffffff12"
    muted-foreground: "#a4a4a4"
    accent: "#ffffff12"
    accent-foreground: "#fafafa"
    destructive: "#ff6467"
    border: "#ffffff1c"
    input: "#ffffff1c"
    ring: "#ebebeb"
    chart-1: "#e2e2e2"
    chart-2: "#b3b3b3"
    chart-3: "#8f8f8f"
    chart-4: "#6c6c6c"
    chart-5: "#484848"
    sidebar: "#0d0d0d"
    sidebar-foreground: "#fafafa"
    sidebar-primary: "#ebebeb"
    sidebar-primary-foreground: "#121212"
    sidebar-accent: "#ffffff12"
    sidebar-accent-foreground: "#fafafa"
    sidebar-border: "#ffffff1c"
    sidebar-ring: "#ebebeb"
    inset: "#ffffff12"
    raised: "#ffffff12"
    field: "#1d1d1d"
    line: "#ffffff1c"
    hover: "#ffffff12"
    faint: "#696969"
    brand: "#ebebeb"
    brand-edge: "#ffffff1c"
    track: "#ffffff12"
    knob: "#fafafa"
    info: "#449df0"
    warn: "#f79c40"
    up: "#4ac777"
    brand-tint: "#ebebeb1f"
    inverse: "#1d1d1d"
    inverse-foreground: "#fafafa"
    inverse-brand: "#121212"
    info-tint: "#449df01f"
    warn-tint: "#f79c401f"
    destructive-tint: "#ff64671f"
    up-tint: "#4ac7771f"
    down-tint: "#ff64671f"
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
    fontWeight: 500
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
  control: 11px
  container: 14px
  modal: 20px
spacing:
  hit: 0px
  density:
    pad: 12px
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
  state:
    duration: 120ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.333333, 1, 0.666667, 1)"
components:
  button-primary:
    backgroundColor: "#161616e0"
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
    backgroundColor: "#292e3842"
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
    backgroundColor: "{colors.light.card}"
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
    backgroundColor: "#161616e0"
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
    backgroundColor: "#161616e0"
    textColor: "{colors.light.primary-foreground}"
    rounded: "{rounded.control}"
  glass-overlay:
    backgroundColor: "{colors.light.raised}"
    textColor: "{colors.light.popover-foreground}"
    rounded: "{rounded.container}"
---

# Solid Glass

## Overview

Solid Glass theme.

Solid Glass (`deeplethe/solid-glass`, MIT): panes of smoky translucent glass with top-edge light rims, hairline glass borders, and ambient drop shadows (`state.press-scale: 1`).

## Colors

- **Shared (C-layer):** Appearance-invariant C-layer color roles shared by light and dark modes.
- **Light:** Adaptive A-layer and B-layer color roles for light appearance.
- **Dark:** Adaptive A-layer and B-layer color roles for dark appearance.

### Surface

- **`scrim`** (`#00000080`): Translucent backdrop scrim behind modals and sheets (50% black).
- **`media`** (`#10131a`): Ground behind photographs and videos; invariant across appearances.
- **`background`** (light `#e4e6eb`, dark `#0d0d0d`): Primary application page canvas background.
- **`card`** (light `#eff1f5`, dark `#1d1d1d`): Opaque composite of Solid Glass card pane over background canvas (no blur on card role).
- **`popover`** (light `#eff1f5`, dark `#1d1d1d`): Opaque composite of Solid Glass popover pane over background canvas.
- **`secondary`** (light `#ffffff8c`, dark `#ffffff12`): Secondary control surface fill.
- **`muted`** (light `#292e3812`, dark `#ffffff12`): Subdued container and subtle background surface.
- **`accent`** (light `#292e3812`, dark `#ffffff12`): Subtle highlight fill for hovered or active items.
- **`sidebar`** (light `#e4e6eb`, dark `#0d0d0d`): Opaque composite of Solid Glass panel pane over background canvas.
- **`sidebar-accent`** (light `#292e3812`, dark `#ffffff12`): Selected or active row fill in the sidebar.
- **`inset`** (light `#292e3812`, dark `#ffffff12`): Opaque composite of Solid Glass thinnest panel pane laid over card.
- **`raised`** (light `#ffffff8c`, dark `#ffffff12`): Raised control surface resting on a card.
- **`field`** (light `#eff1f5`, dark `#1d1d1d`): Input well surface below card and inset layers.
- **`hover`** (light `#292e3812`, dark `#ffffff12`): Pointer hover overlay fill on interactive items.
- **`track`** (light `#292e3812`, dark `#ffffff12`): Inactive track background for switches, sliders, and progress bars.
- **`knob`** (light `#eff1f5`, dark `#fafafa`): Switch thumb fill in the off state.
- **`inverse`** (light `#eff1f5`, dark `#1d1d1d`): High-contrast surface for toasts and tooltips.

### Ink

- **`on-media`** (`#ffffff`): White ink over photographs and dark media surfaces; invariant across appearances.
- **`foreground`** (light `#0d0d0d`, dark `#fafafa`): Default high-contrast text and icon ink on page surfaces.
- **`card-foreground`** (light `#0d0d0d`, dark `#fafafa`): Primary text and icon ink on card surfaces.
- **`popover-foreground`** (light `#0d0d0d`, dark `#fafafa`): Primary text and icon ink on popover surfaces.
- **`secondary-foreground`** (light `#0d0d0d`, dark `#fafafa`): Text and icon ink on secondary control surfaces.
- **`muted-foreground`** (light `#5b5b5b`, dark `#a4a4a4`): Secondary and supporting text and icon ink.
- **`accent-foreground`** (light `#0d0d0d`, dark `#fafafa`): Text and icon ink on accent surfaces.
- **`sidebar-foreground`** (light `#0d0d0d`, dark `#fafafa`): Primary text and icon ink inside the sidebar.
- **`sidebar-accent-foreground`** (light `#0d0d0d`, dark `#fafafa`): Text and icon ink on active sidebar rows.
- **`faint`** (light `#9e9e9e`, dark `#696969`): Low-emphasis text for placeholders, units, and tertiary labels.
- **`inverse-foreground`** (light `#0d0d0d`, dark `#fafafa`): Primary text ink on inverse surfaces.

### Brand

- **`primary`** (light `#161616`, dark `#ebebeb`): Primary brand action fill.
- **`primary-foreground`** (light `#fafafa`, dark `#121212`): Text and icon ink on primary brand action fills.
- **`sidebar-primary`** (light `#161616`, dark `#ebebeb`): Primary action highlight color in the sidebar.
- **`sidebar-primary-foreground`** (light `#fafafa`, dark `#121212`): Text and icon ink on sidebar-primary highlights.
- **`brand`** (light `#161616`, dark `#ebebeb`): Accent ink for text, icons, and active rules.
- **`brand-edge`** (light `#292e3821`, dark `#ffffff1c`): Primary button hairline mixed from --primary and --primary-edge.
- **`brand-tint`** (light `#1616161f`, dark `#ebebeb1f`): Static translucent teal brand wash (--brand-muted).
- **`inverse-brand`** (light `#fafafa`, dark `#121212`): Accent action color on inverse surfaces.

### Status

- **`destructive`** (light `#e7000b`, dark `#ff6467`): Semantic danger color for destructive actions and errors.
- **`chart-1`** (light `#222323`, dark `#e2e2e2`): Primary chart series color.
- **`chart-2`** (light `#4e4e50`, dark `#b3b3b3`): Second chart series color.
- **`chart-3`** (light `#6e6f71`, dark `#8f8f8f`): Third chart series color.
- **`chart-4`** (light `#8e8f92`, dark `#6c6c6c`): Fourth chart series color.
- **`chart-5`** (light `#aeb0b4`, dark `#484848`): Fifth chart series color.
- **`info`** (light `#0078cc`, dark `#449df0`): Informational semantic status color.
- **`warn`** (light `#d87400`, dark `#f79c40`): Warning semantic status color.
- **`up`** (light `#0a924b`, dark `#4ac777`): Positive trend and growth semantic color.
- **`info-tint`** (light `#0078cc1f`, dark `#449df01f`): Translucent informational status background tint.
- **`warn-tint`** (light `#d874001f`, dark `#f79c401f`): Translucent warning status background tint.
- **`destructive-tint`** (light `#e7000b1f`, dark `#ff64671f`): Translucent destructive status background tint.
- **`up-tint`** (light `#0a924b1f`, dark `#4ac7771f`): Translucent positive trend background tint.
- **`down-tint`** (light `#e7000b1f`, dark `#ff64671f`): Translucent negative trend background tint.

### Chrome

- **`border`** (light `#292e3821`, dark `#ffffff1c`): Standard hairline border color for containers and controls.
- **`input`** (light `#292e3821`, dark `#ffffff1c`): Border and stroke color for form fields and control edges.
- **`ring`** (light `#161616`, dark `#ebebeb`): Focus indicator ring stroke color.
- **`sidebar-border`** (light `#292e3821`, dark `#ffffff1c`): Sidebar divider and toolbar hairline border color.
- **`sidebar-ring`** (light `#161616`, dark `#ebebeb`): Focus indicator ring color inside the sidebar.
- **`line`** (light `#292e3821`, dark `#ffffff1c`): Hairline divider and grid rule inside recessed wells.

## Typography

Semantic typography roles referencing tier-specific font.size and font.line-height.

- The family is the app's `font-sans` (`font-mono` for code); the sizes are the one shared scale, which the user's system font size scales (ADR 0009).

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
- **Density:** Page-level padding and gap.
- **List rows:** A list's rows in a popup or a palette: inset, the container's edge to the row's fill; pad, the fill's edge to its text. shadcn's select and menus: 4 (SelectContent p-1) and 8 (SelectItem pl-2).
- **Control geometry:** Control internal spacing and switch size tier.
- **Control heights:** Standard control heights (sm, md, lg).
- **Switch size tier (pointer):** `small`.
- **Icons:** Standard icon dimensions (sm, md, lg).

- **Pointer tier:** Default pointer input-tier metrics.
- **Touch tier:** Default touch input-tier metrics.

## Elevation & Depth

Layered glass elevation: surfaces combine translucent fills (`alpha < 1` over page grounds), top-edge inset highlights, `--glass-edge` borders, soft shadows, and backdrop blur (`glass`, `menu`, `modal`, `tooltip`, `inverse`).

- **Strokes:** Border stroke widths.
  - `stroke.hairline` (1px): Hairline width for dividers, container edges (cards, drawers, overlays) and outlined variants.
  - `stroke.control` (1px): Interactive control border width.
- **Focus indicator (`style: "halo"`):** Focus ring geometry and style enum.
  - `focus.width` (3px): Focus ring stroke width.
  - `focus.offset` (0px): Focus ring outward offset from control bounds.
- **State overlays (hover=0, focus=0, pressed=0, dragged=0):** State-layer ink opacities for hover, focus, pressed, and dragged states.

## Shapes

Solid Glass layered corner radius scale (11px control, 14px container, 20px modal) referenced by semantic shape roles.

Non-dimensional corner curve and button capsule flag. (`curve: "continuous"`, `corners.button: "radius"`).

Semantic corner radius roles by layer, referencing base dimension.radius.* tokens.

- **`control`** (11px): Corner radius for in-page elements: buttons, fields, rows, chips, badges, wells, color areas, and kbd.
- **`container`** (14px): Corner radius for containers and overlays: cards, menus, popovers, tooltips, list panels, toasts, and frames.
- **`modal`** (20px): Corner radius for modal surfaces: dialogs, sheets, and drawers.

**Control dimensions** (no DESIGN.md field; they decide how a control's own parts are drawn): Control dimensions: the four behaviour-named axes a theme decides for its controls (field, choice, track, handle). Themes override only the axes that differ.
- **`field`**: `box`
- **`choice`**: `well`
- **`track`**: `sunk`
- **`handle`**: `circle`

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

The neutral of each field a finish role can have, written once for the roles that have it: a flat surface states no gradient, an opaque one no backdrop blur and no material, a layer no height of its own, a press that keeps the resting colours states no swap, and a top or bottom edge with no colour of its own takes the role's border color. A theme that states one writes the token (its own finishes.shared, or an appearance's) and it wins; the extension only says what the neutral is where no token states it, and a role carries only the fields it lists in `finishFields`.

- **`finish.card`**: A surface that holds content: a card, a section.
- **`finish.inset`**: A well cut into a surface: an inset, a field, a track, a groove.
- **`finish.channel`**: The channel a group of choices sits in: a segmented control's track.
- **`finish.raised`** (backdropFilter: `none`): A control on a surface: a button, a chip, a pill.
- **`finish.plate`**: A labelled block chosen inside a well: the selected tab, a segmented control's thumb.
- **`finish.overlay`** (backdropFilter: `none`): A panel floating over the page: a menu, a toast.
- **`finish.modal`**: A surface the page waits for: a dialog, a sheet.
- **`finish.inverse`** (backdropFilter: `none`): The page's inverse: an inverse surface, a tooltip.
- **`finish.glass`** (backdropFilter: `blur(14px) saturate(180%)`): A translucent surface: what is behind it shows through.
- **`finish.accent`**: The accent's own surface, with its ink.
- **`finish.fill`**: A run's fill: a progress bar's bar, a slider's range, a meter's column.
- **`finish.knob`**: A knob: a switch's thumb, a slider's handle. Its checked state, `checked-*`, is the knob while its control is on.
- **`finish.hover`**: A control under the pointer.
- **`finish.pressed`**: A control held down.
- **`finish.disabled`**: A control that cannot be used.
- **Disabled handling** (content=0.5, fill=false): Disabled content opacity multiplier and whether containers switch to a dedicated disabled fill.

## Do's and Don'ts

- **Do:** Read all colors, radii, typography, and surface finishes through theme roles (`colors.*`, `shape.*`, `font.*`, `finish.*`) rather than literals in component code.
- **Do:** Read theme getters inside JSX render expressions or reactive effects so runtime theme switching (`selectTheme`) and light/dark appearance changes take effect on the next frame.
- **Do:** Use `rounded(shape.<role>, inset)` for concentric nested radii inside cards, switches, and segmented controls.
- **Do:** Keep press interactions flat (`state.press-scale: 1`); pressed panes deepen and drop shadow rather than shrinking.
- **Do:** Keep gradient stops `transparent` on translucent `background` finishes so alpha is not doubled by the canvas.
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never add a finish field a role does not use: the fields of `finish.<role>` are the ones `packages/theme/finish-fields.ts` lists, and every theme states them the same way.
- **Don't:** Do not stack opaque fills behind translucent glass gradients; keep the `background` layer `transparent` when the gradient carries the fill.
