---
version: alpha
name: Apple
description: "Apple Human Interface Guidelines / UIKit system palette (`systemBlue`, `systemGroupedBackground`, `label`) with Retina 0.5px hairlines, continuous corners, and layered Liquid Glass: native regular/clear glass, iOS materials, macOS visual-effect roles, saturate blur, specular hairlines, and a rounded-rect refraction shader."
colors:
  scrim: "#00000066"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#f2f2f7"
    card: "#ffffff"
    popover: "#ffffff"
    muted: "#e9e9eb"
    surface: "#efeff0"
    foreground: "#000000"
    muted-foreground: "#8a8a8e"
    faint: "#c5c5c7"
    primary: "#007aff"
    primary-foreground: "#ffffff"
    secondary: "#efeff0"
    accent: "#e9e9eb"
    brand: "#007aff"
    border: "#dcdcdd"
    line: "#dcdcdd"
    input: "#c6c6c8"
    ring: "#007aff"
    info: "#007aff"
    success: "#248a3d"
    warning: "#b25000"
    destructive: "#ff3b30"
  dark:
    background: "#000000"
    card: "#1c1c1e"
    popover: "#2c2c2e"
    muted: "#323236"
    surface: "#323236"
    foreground: "#ffffff"
    muted-foreground: "#98989f"
    faint: "#5a5a5f"
    primary: "#0a84ff"
    primary-foreground: "#ffffff"
    secondary: "#323236"
    accent: "#323236"
    brand: "#0a84ff"
    border: "#353538"
    line: "#353538"
    input: "#3e3e41"
    ring: "#0a84ff"
    info: "#0a84ff"
    success: "#30d158"
    warning: "#ff9f0a"
    destructive: "#ff453a"
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
  modal: 16px
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
    backgroundColor: "#efeff0b8"
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
    backgroundColor: "{colors.light.card}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.control.padding}"
  menu-popover:
    backgroundColor: "#ffffffad"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.control.padding}"
  dialog:
    backgroundColor: "#ffffffc7"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "#ffffffb3"
    textColor: "{colors.light.foreground}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
---

# Apple

## Overview

Apple Human Interface Guidelines / UIKit system palette (`systemBlue`, `systemGroupedBackground`, `label`) with Retina 0.5px hairlines, continuous corners, and layered Liquid Glass: native regular/clear glass, iOS materials, macOS visual-effect roles, saturate blur, specular hairlines, and a rounded-rect refraction shader.

## Colors

- **`background`**: light `#f2f2f7`, dark `#000000`
- **`card`**: light `#ffffff`, dark `#1c1c1e`
- **`popover`**: light `#ffffff`, dark `#2c2c2e`
- **`muted`**: light `#e9e9eb`, dark `#323236`
- **`surface`**: light `#efeff0`, dark `#323236`
- **`foreground`**: light `#000000`, dark `#ffffff`
- **`muted-foreground`**: light `#8a8a8e`, dark `#98989f`
- **`faint`**: light `#c5c5c7`, dark `#5a5a5f`
- **`primary`**: light `#007aff`, dark `#0a84ff`
- **`primary-foreground`**: light `#ffffff`, dark `#ffffff`
- **`secondary`**: light `#efeff0`, dark `#323236`
- **`accent`**: light `#e9e9eb`, dark `#323236`
- **`brand`**: light `#007aff`, dark `#0a84ff`
- **`border`**: light `#dcdcdd`, dark `#353538`
- **`line`**: light `#dcdcdd`, dark `#353538`
- **`input`**: light `#c6c6c8`, dark `#3e3e41`
- **`ring`**: light `#007aff`, dark `#0a84ff`
- **`info`**: light `#007aff`, dark `#0a84ff`
- **`success`**: light `#248a3d`, dark `#30d158`
- **`warning`**: light `#b25000`, dark `#ff9f0a`
- **`destructive`**: light `#ff3b30`, dark `#ff453a`

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

Apple Liquid Glass depth: `raised` (thin / headerView, blur 24), `overlay` (regular / popover, blur 30, liquid-glass 0.42), `modal` (thick / sheet, blur 36, liquid-glass 0.30), `inverse` (regular / hudWindow, blur 28, liquid-glass 0.36), and `glass` (clear / ultraThin / hudWindow, blur 26, liquid-glass 0.50). Each fill stays at or above its material minOpacity. Motion uses snappy, smooth, and bouncy springs.

## Shapes

- Radii: control 8px, container 12px, modal 16px (`curve: "continuous"`).

## Motion & Micro-interaction

- Press scale: `0.97`, state transition: 120ms `out-cubic`, spring `360/30/1`, theme switch: `dissolve` (240ms).

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted; copy and tone belong to the host application.

## Components

Components read semantic `surface()`, `feedback`, `motion`, and `control()` primitives.

## Do's and Don'ts

- **Do:** Read colors, surfaces, feedback, and controls via `@shadcn-nsh/theme` rather than hardcoded literals.
- **Do:** Respect pointer (macOS) vs touch (iOS 44pt hit target) metrics and continuous squircle corners.
- **Do:** Spread `platformProps` on native glass views (`surface().platformProps`).
- **Don't:** Branch on theme IDs inside UI components.
- **Don't:** Do not replace Retina 0.5px hairlines with thick borders or circular corners.
