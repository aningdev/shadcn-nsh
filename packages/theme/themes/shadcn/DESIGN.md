---
version: alpha
name: "shadcn neutral"
description: "shadcn/ui's neutral palette paired with flat surfaces (`press.scale: 1`) and Tailwind-style border/shadow lifts (`new-york-v4`)."
colors:
  scrim: "#00000080"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#ffffff"
    card: "#ffffff"
    popover: "#ffffff"
    muted: "#f5f5f5"
    surface: "#f5f5f5"
    foreground: "#0a0a0a"
    muted-foreground: "#737373"
    faint: "#a1a1a1"
    primary: "#171717"
    primary-foreground: "#fafafa"
    secondary: "#f5f5f5"
    accent: "#f5f5f5"
    brand: "#171717"
    border: "#e5e5e5"
    line: "#e5e5e5"
    input: "#e5e5e5"
    ring: "#a1a1a1"
    info: "#155dfc"
    success: "#007a55"
    warning: "#bb4d00"
    destructive: "#e7000b"
  dark:
    background: "#0a0a0a"
    card: "#171717"
    popover: "#171717"
    muted: "#262626"
    surface: "#262626"
    foreground: "#fafafa"
    muted-foreground: "#a1a1a1"
    faint: "#a1a1a1"
    primary: "#e5e5e5"
    primary-foreground: "#171717"
    secondary: "#262626"
    accent: "#262626"
    brand: "#e5e5e5"
    border: "#ffffff1a"
    line: "#ffffff1a"
    input: "#ffffff26"
    ring: "#737373"
    info: "#51a2ff"
    success: "#00d492"
    warning: "#ffb900"
    destructive: "#ff6467"
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
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.density.gap}"
  card:
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.density.pad}"
  input-field:
    backgroundColor: "{colors.light.background}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.control.padding}"
  menu-popover:
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.control.padding}"
  dialog:
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "{colors.light.foreground}"
    textColor: "{colors.light.background}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
---

# shadcn neutral

## Overview

shadcn/ui's neutral palette paired with flat surfaces (`press.scale: 1`) and Tailwind-style border/shadow lifts (`new-york-v4`).

## Colors

- **`background`**: light `#ffffff`, dark `#0a0a0a`
- **`card`**: light `#ffffff`, dark `#171717`
- **`popover`**: light `#ffffff`, dark `#171717`
- **`muted`**: light `#f5f5f5`, dark `#262626`
- **`surface`**: light `#f5f5f5`, dark `#262626`
- **`foreground`**: light `#0a0a0a`, dark `#fafafa`
- **`muted-foreground`**: light `#737373`, dark `#a1a1a1`
- **`faint`**: light `#a1a1a1`, dark `#a1a1a1`
- **`primary`**: light `#171717`, dark `#e5e5e5`
- **`primary-foreground`**: light `#fafafa`, dark `#171717`
- **`secondary`**: light `#f5f5f5`, dark `#262626`
- **`accent`**: light `#f5f5f5`, dark `#262626`
- **`brand`**: light `#171717`, dark `#e5e5e5`
- **`border`**: light `#e5e5e5`, dark `#ffffff1a`
- **`line`**: light `#e5e5e5`, dark `#ffffff1a`
- **`input`**: light `#e5e5e5`, dark `#ffffff26`
- **`ring`**: light `#a1a1a1`, dark `#737373`
- **`info`**: light `#155dfc`, dark `#51a2ff`
- **`success`**: light `#007a55`, dark `#00d492`
- **`warning`**: light `#bb4d00`, dark `#ffb900`
- **`destructive`**: light `#e7000b`, dark `#ff6467`

## Typography

- Uses system `font-sans` / `font-mono` unless configured in `theme.json` (`font-sans`, `font-mono`).
- **`caption`**: 11px / 16px, weight 400, letter-spacing 0px
- **`detail`**: 12px / 16px, weight 400, letter-spacing 0px
- **`body`**: 13px / 20px, weight 400, letter-spacing 0px
- **`label`**: 14px / 20px, weight 500, letter-spacing 0px
- **`title`**: 16px / 24px, weight 600, letter-spacing 0px
- **`headline`**: 20px / 28px, weight 600, letter-spacing 0px
- **`display`**: 26px / 32px, weight 600, letter-spacing 0px

## Layout

- Control heights (pointer): 24px / 28px / 32px; touch hit target: 44px.

## Elevation & Depth

Flat elevation model: cards and floating surfaces sit on neutral background steps with subtle drop shadows and crisp 1px borders.

## Shapes

- Radii: control 8px, container 12px, modal 14px (`curve: "continuous"`).

## Motion & Micro-interaction

- Press scale: `1`, state transition: 120ms `out-cubic`, theme switch: `none` (0ms).

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted; copy and tone belong to the host application.

## Components

Components read semantic `surface()`, `feedback`, `motion`, and `control()` primitives.

## Do's and Don'ts

- **Do:** Read colors, surfaces, feedback, and controls via `@shadcn-nsh/theme` rather than hardcoded literals.
- **Do:** Keep press interactions flat (`press.scale: 1`); signal hover and press via surface and opacity changes.
- **Don't:** Branch on theme IDs inside UI components.
- **Don't:** Do not add backdrop blur, specular rim highlights, or press shrink to flat shadcn surfaces.
