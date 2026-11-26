---
version: alpha
name: Material
description: "Material 3 Expressive (`material-web` / Compose M3) with tonal surface containers, state-layer overlays, and M3 easing curves."
colors:
  scrim: "#00000052"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#fef7ff"
    card: "#f7f2fa"
    popover: "#f3edf7"
    muted: "#e6e0e9"
    surface: "#f7f2fa"
    foreground: "#1d1b20"
    muted-foreground: "#49454f"
    faint: "#79747e"
    primary: "#6750a4"
    primary-foreground: "#ffffff"
    secondary: "#e8def8"
    accent: "#e8def8"
    brand: "#6750a4"
    border: "#cac4d0"
    line: "#cac4d0"
    input: "#79747e"
    ring: "#625b71"
    info: "#1e63d2"
    success: "#138a5a"
    warning: "#b26a00"
    destructive: "#b3261e"
  dark:
    background: "#141218"
    card: "#1d1b20"
    popover: "#211f26"
    muted: "#36343b"
    surface: "#1d1b20"
    foreground: "#e6e0e9"
    muted-foreground: "#cac4d0"
    faint: "#938f99"
    primary: "#d0bcff"
    primary-foreground: "#381e72"
    secondary: "#4a4458"
    accent: "#4a4458"
    brand: "#d0bcff"
    border: "#49454f"
    line: "#49454f"
    input: "#938f99"
    ring: "#ccc2dc"
    info: "#81b3fc"
    success: "#45d49a"
    warning: "#ffb547"
    destructive: "#f2b8b5"
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
    backgroundColor: "{colors.light.muted}"
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
    backgroundColor: "#ece6f0"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "#322f35"
    textColor: "#f5eff7"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
---

# Material

## Overview

Material 3 Expressive (`material-web` / Compose M3) with tonal surface containers, state-layer overlays, and M3 easing curves.

## Colors

- **`background`**: light `#fef7ff`, dark `#141218`
- **`card`**: light `#f7f2fa`, dark `#1d1b20`
- **`popover`**: light `#f3edf7`, dark `#211f26`
- **`muted`**: light `#e6e0e9`, dark `#36343b`
- **`surface`**: light `#f7f2fa`, dark `#1d1b20`
- **`foreground`**: light `#1d1b20`, dark `#e6e0e9`
- **`muted-foreground`**: light `#49454f`, dark `#cac4d0`
- **`faint`**: light `#79747e`, dark `#938f99`
- **`primary`**: light `#6750a4`, dark `#d0bcff`
- **`primary-foreground`**: light `#ffffff`, dark `#381e72`
- **`secondary`**: light `#e8def8`, dark `#4a4458`
- **`accent`**: light `#e8def8`, dark `#4a4458`
- **`brand`**: light `#6750a4`, dark `#d0bcff`
- **`border`**: light `#cac4d0`, dark `#49454f`
- **`line`**: light `#cac4d0`, dark `#49454f`
- **`input`**: light `#79747e`, dark `#938f99`
- **`ring`**: light `#625b71`, dark `#ccc2dc`
- **`info`**: light `#1e63d2`, dark `#81b3fc`
- **`success`**: light `#138a5a`, dark `#45d49a`
- **`warning`**: light `#b26a00`, dark `#ffb547`
- **`destructive`**: light `#b3261e`, dark `#f2b8b5`

## Typography

- Uses system `font-sans` / `font-mono` unless configured in `theme.json` (`font-sans`, `font-mono`).
- **`caption`**: 11px / 16px, weight 500, letter-spacing 0.5px
- **`detail`**: 12px / 16px, weight 400, letter-spacing 0.4px
- **`body`**: 13px / 20px, weight 400, letter-spacing 0.25px
- **`label`**: 14px / 20px, weight 500, letter-spacing 0.1px
- **`title`**: 16px / 24px, weight 500, letter-spacing 0.15px
- **`headline`**: 20px / 28px, weight 400, letter-spacing 0px
- **`display`**: 26px / 32px, weight 400, letter-spacing 0px

## Layout

- Control heights (pointer): 24px / 32px / 40px; touch hit target: 48px.

## Elevation & Depth

Tonal surface stepping plus Material Web Level 1–3 shadows and Android native elevation (`elevation: 1/3/6`), no backdrop blur.

## Shapes

- Radii: control 4px, container 12px, modal 28px (`curve: "circular"`).

## Motion & Micro-interaction

- Press scale: `1`, state transition: 100ms `standard`.

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted; copy and tone belong to the host application.

## Components

Components read semantic `surface()`, `feedback`, `motion`, and `control()` primitives.

## Do's and Don'ts

- **Do:** Read colors, surfaces, feedback, and controls via `@shadcn-nsh/theme` rather than hardcoded literals.
- **Do:** Express interaction states via M3 state-layer overlays (`hover: 0.08`, `pressed: 0.10`) with `press.scale: 1`.
- **Do:** Use `circular` corners with underlined fields.
- **Don't:** Branch on theme IDs inside UI components.
- **Don't:** Do not add backdrop blur or borders to M3 tonal containers.
