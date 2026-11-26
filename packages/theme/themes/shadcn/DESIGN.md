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
    chart-1: "#f54900"
    chart-2: "#009689"
    chart-3: "#104e64"
    chart-4: "#ffb900"
    chart-5: "#fe9a00"
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
    field: "#ffffff"
    line: "#e5e5e5"
    hover: "#f5f5f5"
    faint: "#a1a1a1"
    brand: "#171717"
    brand-edge: "#e5e5e5"
    focus-inner: "#ffffff"
    track: "#e5e5e5"
    knob: "#ffffff"
    info: "#155dfc"
    warn: "#bb4d00"
    up: "#007a55"
    brand-tint: "#1717171a"
    inverse: "#ffffff"
    inverse-foreground: "#0a0a0a"
    inverse-brand: "#fafafa"
    info-tint: "#155dfc1a"
    warn-tint: "#bb4d001a"
    destructive-tint: "#e7000b1a"
    up-tint: "#007a551a"
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
    chart-1: "#1447e6"
    chart-2: "#00bc7d"
    chart-3: "#fe9a00"
    chart-4: "#ad46ff"
    chart-5: "#ff2056"
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
    field: "#ffffff0b"
    line: "#ffffff1a"
    hover: "#262626"
    faint: "#a1a1a1"
    brand: "#e5e5e5"
    brand-edge: "#ffffff1a"
    focus-inner: "#171717"
    track: "#333333"
    knob: "#fafafa"
    info: "#51a2ff"
    warn: "#ffb900"
    up: "#00d492"
    brand-tint: "#e5e5e51a"
    inverse: "#171717"
    inverse-foreground: "#fafafa"
    inverse-brand: "#171717"
    info-tint: "#51a2ff1a"
    warn-tint: "#ffb9001a"
    destructive-tint: "#ff64671a"
    up-tint: "#00d4921a"
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
  control: 8px
  container: 12px
  modal: 14px
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
  fast:
    duration: 150ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.333333, 1, 0.666667, 1)"
  default:
    duration: 250ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.333333, 1, 0.666667, 1)"
  slow:
    duration: 350ms
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
- **`track`** (light `#e5e5e5`, dark `#333333`): Inactive track background for switches, sliders, and progress bars.
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
- **`chart-1`** (light `#f54900`, dark `#1447e6`): Primary chart series color.
- **`chart-2`** (light `#009689`, dark `#00bc7d`): Second chart series color.
- **`chart-3`** (light `#104e64`, dark `#fe9a00`): Third chart series color.
- **`chart-4`** (light `#ffb900`, dark `#ad46ff`): Fourth chart series color.
- **`chart-5`** (light `#fe9a00`, dark `#ff2056`): Fifth chart series color.
- **`info`** (light `#155dfc`, dark `#51a2ff`): Informational semantic status color (Tailwind CSS v4 blue semantic palette).
- **`warn`** (light `#bb4d00`, dark `#ffb900`): Warning semantic status color (Tailwind CSS v4 amber semantic palette).
- **`up`** (light `#007a55`, dark `#00d492`): Positive trend color (Tailwind CSS v4 emerald semantic palette).
- **`info-tint`** (light `#155dfc1a`, dark `#51a2ff1a`): Translucent informational status background tint.
- **`warn-tint`** (light `#bb4d001a`, dark `#ffb9001a`): Translucent warning status background tint.
- **`destructive-tint`** (light `#e7000b1a`, dark `#ff64671a`): Translucent destructive status background tint.
- **`up-tint`** (light `#007a551a`, dark `#00d4921a`): Translucent positive trend background tint.

### Chrome

- **`border`** (light `#e5e5e5`, dark `#ffffff1a`): Standard hairline border color for containers and controls.
- **`input`** (light `#e5e5e5`, dark `#ffffff26`): Border and stroke color for form fields and control edges.
- **`ring`** (light `#a1a1a1`, dark `#737373`): Focus indicator ring stroke color.
- **`sidebar-border`** (light `#e5e5e5`, dark `#ffffff1a`): Sidebar divider and toolbar hairline border color.
- **`sidebar-ring`** (light `#a1a1a1`, dark `#737373`): Focus indicator ring color inside the sidebar.
- **`line`** (light `#e5e5e5`, dark `#ffffff1a`): Hairline divider and grid rule inside recessed wells.
- **`focus-inner`** (light `#ffffff`, dark `#171717`): The line inside a focus ring, hugging the control: the surface's own color where a theme draws one.

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
- **Control geometry:** Control internal spacing.
- **Control heights:** Standard control heights (sm, md, lg).
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
- **State overlays (hover=0, pressed=0):** State-layer ink opacities for hover and pressed states.

## Shapes

Base corner radius scale referenced by semantic shape roles.

Non-dimensional corner curve. (`curve: "continuous"`).

- **`control`** (8px): Corner radius for in-page controls, fields, rows, chips, badges, wells, color areas, and kbd.
- **`container`** (12px): Corner radius for cards, menus, popovers, tooltips, list panels, toasts, and frames.
- **`modal`** (14px): Corner radius for dialogs, sheets, and drawers.

## Motion & Micro-interaction

Interactive timing roles (a duration and an easing): fast, default, slow, and the state fade.

- **`fast`** (150ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): Quickest response: small control toggles and thumbs.
- **`default`** (250ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): Everyday feedback: presses, releases and modest movement.
- **`slow`** (350ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): Slowest: large surfaces and long-travel layout movement.
- **`state`** (120ms, `cubic-bezier(0.333333, 1, 0.666667, 1)`): State fade: how fast hover, press and choice states come and go (upstream nsh-gallery-ui's hover wash, 120 ms ease-out).
- **Press** (`press-scale: 1`, `pressed-opacity: 0.7`): Interaction state opacities and press scale.
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
- **`finish.glass`** (backdropFilter: `blur(20px)`): A translucent surface: what is behind it shows through.
- **`finish.accent`**: The accent's own surface, with its ink.
- **`finish.fill`**: A run's fill: a progress bar's bar, a slider's range, a meter's column.
- **`finish.knob`**: A knob: a switch's thumb, a slider's handle. Its checked state, `checked-*`, is the knob while its control is on.
- **`finish.hover`**: A control under the pointer.
- **`finish.pressed`**: A control held down.
- **`finish.disabled`**: A control that cannot be used.
- **Disabled handling** (content=0.5, fill=undefined): Disabled content opacity multiplier.

## Do's and Don'ts

- **Do:** Read all colors, radii, typography, and surface finishes through theme roles (`colors.*`, `shape.*`, `font.*`, `finish.*`) rather than literals in component code.
- **Do:** Read theme getters inside JSX render expressions or reactive effects so runtime theme switching (`selectTheme`) and light/dark appearance changes take effect on the next frame.
- **Do:** Use `rounded(shape.<role>, inset)` for concentric nested radii inside cards, switches, and segmented controls.
- **Do:** Keep press interactions flat (`state.press-scale: 1`); signal hover and press via surface and opacity changes.
- **Do:** Preserve the 31 shadcn A-layer color slots (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar*`).
- **Don't:** Never write color literals (`#...`, `rgb()`, `oklch()`) in component, lib, or demo-adapter code.
- **Don't:** Never store `colors.*`, `finish.*`, or `shape.*` values in module-level constants; they freeze on theme or appearance switches.
- **Don't:** Never add a finish field a role does not use: the fields of `finish.<role>` are the ones `packages/theme/finish-fields.ts` lists, and every theme states them the same way.
- **Don't:** Do not add backdrop blur, specular rim highlights, or press shrink to flat shadcn finishes.
