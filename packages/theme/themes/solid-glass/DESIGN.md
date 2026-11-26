---
version: alpha
name: "Solid Glass"
description: "Solid Glass (`deeplethe/solid-glass`, MIT): panes of smoky translucent glass with top-edge light rims, hairline glass borders, and ambient drop shadows (`press.scale: 1`)."
colors:
  scrim: "#00000080"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#e4e6eb"
    card: "#eff1f5"
    popover: "#f8f9fb"
    muted: "#292e3812"
    surface: "#ffffff8c"
    foreground: "#0d0d0d"
    muted-foreground: "#5b5b5b"
    faint: "#9e9e9e"
    primary: "#161616"
    primary-foreground: "#fafafa"
    secondary: "#ffffff8c"
    accent: "#292e3817"
    brand: "#00754f"
    border: "#292e3821"
    line: "#292e3821"
    input: "#292e3824"
    ring: "#16161680"
    info: "#0078cc"
    success: "#0a924b"
    warning: "#d87400"
    destructive: "#e7000b"
  dark:
    background: "#0d0d0d"
    card: "#1d1d1d"
    popover: "#1a1a1a"
    muted: "#ffffff12"
    surface: "#ffffff12"
    foreground: "#fafafa"
    muted-foreground: "#a4a4a4"
    faint: "#696969"
    primary: "#ebebeb"
    primary-foreground: "#121212"
    secondary: "#ffffff12"
    accent: "#ffffff14"
    brand: "#54d2a4"
    border: "#ffffff1c"
    line: "#ffffff1c"
    input: "#ffffff14"
    ring: "#ffffff66"
    info: "#449df0"
    success: "#4ac777"
    warning: "#f79c40"
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
    backgroundColor: "#161616e0"
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
    backgroundColor: "#ffffff99"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.control.padding}"
  menu-popover:
    backgroundColor: "{colors.light.popover}"
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
    backgroundColor: "{colors.light.popover}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
---

# Solid Glass

## Overview

Solid Glass (`deeplethe/solid-glass`, MIT): panes of smoky translucent glass with top-edge light rims, hairline glass borders, and ambient drop shadows (`press.scale: 1`).

## Colors

- **`background`**: light `#e4e6eb`, dark `#0d0d0d`
- **`card`**: light `#eff1f5`, dark `#1d1d1d`
- **`popover`**: light `#f8f9fb`, dark `#1a1a1a`
- **`muted`**: light `#292e3812`, dark `#ffffff12`
- **`surface`**: light `#ffffff8c`, dark `#ffffff12`
- **`foreground`**: light `#0d0d0d`, dark `#fafafa`
- **`muted-foreground`**: light `#5b5b5b`, dark `#a4a4a4`
- **`faint`**: light `#9e9e9e`, dark `#696969`
- **`primary`**: light `#161616`, dark `#ebebeb`
- **`primary-foreground`**: light `#fafafa`, dark `#121212`
- **`secondary`**: light `#ffffff8c`, dark `#ffffff12`
- **`accent`**: light `#292e3817`, dark `#ffffff14`
- **`brand`**: light `#00754f`, dark `#54d2a4`
- **`border`**: light `#292e3821`, dark `#ffffff1c`
- **`line`**: light `#292e3821`, dark `#ffffff1c`
- **`input`**: light `#292e3824`, dark `#ffffff14`
- **`ring`**: light `#16161680`, dark `#ffffff66`
- **`info`**: light `#0078cc`, dark `#449df0`
- **`success`**: light `#0a924b`, dark `#4ac777`
- **`warning`**: light `#d87400`, dark `#f79c40`
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

Layered glass elevation combining translucent fills, top-edge inset highlights, soft ambient shadows, and backdrop blur.

## Shapes

- Radii: control 11px, container 14px, modal 20px (`curve: "continuous"`).

## Motion & Micro-interaction

- Press scale: `1`, state transition: 120ms `out-cubic`, spring `280/26/1`, theme switch: `dissolve` (260ms).

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted; copy and tone belong to the host application.

## Components

Components read semantic `surface()`, `feedback`, `motion`, and `control()` primitives.

## Do's and Don'ts

- **Do:** Read colors, surfaces, feedback, and controls via `@shadcn-nsh/theme` rather than hardcoded literals.
- **Do:** Keep press interactions flat (`press.scale: 1`); pressed panes deepen and drop shadow rather than shrinking.
- **Don't:** Branch on theme IDs inside UI components.
- **Don't:** Do not stack opaque fills behind translucent glass surfaces.
