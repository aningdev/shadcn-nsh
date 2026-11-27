---
version: alpha
name: "WinUI 3"
description: "Windows 11 WinUI 3: crisp 4px control corners, bevel elevation strokes, layered Fluent 2 Acrylic (overlay, glass, inverse, modal) with backdrop blur, specular rim and acrylic-noise grain, double focus rings, and critically damped motion (83/167/250/333 ms, zeta >= 1, no press spring)."
colors:
  scrim: "#0000004d"
  media: "#10131a"
  on-media: "#ffffff"
  light:
    background: "#f3f3f3"
    card: "#fbfbfb"
    popover: "#f9f9f9"
    muted: "#eeeeee"
    surface: "#fbfbfb"
    foreground: "#1a1a1a"
    muted-foreground: "#5c5c5c"
    faint: "#868686"
    primary: "#005fb8"
    primary-foreground: "#ffffff"
    secondary: "#fbfbfb"
    accent: "#eaeaea"
    brand: "#003e92"
    border: "#e5e5e5"
    line: "#e5e5e5"
    input: "#868686"
    ring: "#1a1a1a"
    info: "#005fb8"
    success: "#0f7b0f"
    warning: "#9d5d00"
    destructive: "#c42b1c"
  dark:
    background: "#202020"
    card: "#2b2b2b"
    popover: "#2c2c2c"
    muted: "#1c1c1c"
    surface: "#2d2d2d"
    foreground: "#ffffff"
    muted-foreground: "#cccccc"
    faint: "#969696"
    primary: "#60cdff"
    primary-foreground: "#000000"
    secondary: "#2d2d2d"
    accent: "#323232"
    brand: "#99ebff"
    border: "#303030"
    line: "#323232"
    input: "#9a9a9a"
    ring: "#ffffff"
    info: "#60cdff"
    success: "#6ccb5f"
    warning: "#fce100"
    destructive: "#ff99a4"
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
    fontWeight: 400
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
  control: 4px
  container: 8px
  modal: 8px
spacing:
  hit: 0px
  density:
    pad: 12px
    gap: 8px
  item:
    inset: 4px
    pad: 11px
  control:
    padding: 6px
    gap: 8px
  height:
    sm: 24px
    md: 32px
    lg: 40px
  stroke:
    hairline: 1px
    control: 1px
  focus:
    width: 2px
    offset: 0px
  icon:
    sm: 12px
    md: 16px
    lg: 20px
motion:
  fast:
    duration: 167ms
    delay: 0ms
    timingFunction: "cubic-bezier(0.55, 0.55, 0, 1)"
  default:
    duration: 250ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
  slow:
    duration: 333ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
  state:
    duration: 83ms
    delay: 0ms
    timingFunction: "cubic-bezier(0, 0, 0, 1)"
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
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "{spacing.height.md}"
    padding: "{spacing.control.padding}"
  menu-popover:
    backgroundColor: "#f9f9f9d9"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.container}"
    padding: "{spacing.control.padding}"
  dialog:
    backgroundColor: "#f3f3f3f0"
    textColor: "{colors.light.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "{spacing.density.pad}"
  tooltip:
    backgroundColor: "#f9f9f9e0"
    textColor: "{colors.light.foreground}"
    typography: "{typography.detail}"
    rounded: "{rounded.container}"
---

# WinUI 3

## Overview

Windows 11 WinUI 3: crisp 4px control corners, bevel elevation strokes, layered Fluent 2 Acrylic (overlay, glass, inverse, modal) with backdrop blur, specular rim and acrylic-noise grain, double focus rings, and critically damped motion (83/167/250/333 ms, zeta >= 1, no press spring).

## Colors

- **`background`**: light `#f3f3f3`, dark `#202020`
- **`card`**: light `#fbfbfb`, dark `#2b2b2b`
- **`popover`**: light `#f9f9f9`, dark `#2c2c2c`
- **`muted`**: light `#eeeeee`, dark `#1c1c1c`
- **`surface`**: light `#fbfbfb`, dark `#2d2d2d`
- **`foreground`**: light `#1a1a1a`, dark `#ffffff`
- **`muted-foreground`**: light `#5c5c5c`, dark `#cccccc`
- **`faint`**: light `#868686`, dark `#969696`
- **`primary`**: light `#005fb8`, dark `#60cdff`
- **`primary-foreground`**: light `#ffffff`, dark `#000000`
- **`secondary`**: light `#fbfbfb`, dark `#2d2d2d`
- **`accent`**: light `#eaeaea`, dark `#323232`
- **`brand`**: light `#003e92`, dark `#99ebff`
- **`border`**: light `#e5e5e5`, dark `#303030`
- **`line`**: light `#e5e5e5`, dark `#323232`
- **`input`**: light `#868686`, dark `#9a9a9a`
- **`ring`**: light `#1a1a1a`, dark `#ffffff`
- **`info`**: light `#005fb8`, dark `#60cdff`
- **`success`**: light `#0f7b0f`, dark `#6ccb5f`
- **`warning`**: light `#9d5d00`, dark `#fce100`
- **`destructive`**: light `#c42b1c`, dark `#ff99a4`

## Typography

- `theme.json` writes `font-sans: system-ui` and `font-mono: monospace`.
- **`caption`**: 11px / 16px, weight 400, letter-spacing 0px
- **`detail`**: 12px / 16px, weight 400, letter-spacing 0px
- **`body`**: 13px / 20px, weight 400, letter-spacing 0px
- **`label`**: 14px / 20px, weight 400, letter-spacing 0px
- **`title`**: 16px / 24px, weight 600, letter-spacing 0px
- **`headline`**: 20px / 28px, weight 600, letter-spacing 0px
- **`display`**: 26px / 32px, weight 600, letter-spacing 0px

## Layout

- Control heights (pointer): 24px / 32px / 40px; touch hit target: 44px.

## Elevation & Depth

WinUI 3 soft ambient elevation (`md`, `lg`, `xl`) and beveled 1px strokes on raised controls. Acrylic layers: `overlay` blur 30 saturate 1.25 minOpacity 0.85 (noise 0.04), `glass` blur 32 saturate 1.3 minOpacity 0.78 (noise 0.045), `inverse` blur 24 saturate 1.2 minOpacity 0.85 (noise 0.03), `modal` blur 24 saturate 1.15 minOpacity 0.9 (noise 0.025). Each fill stays at or above its minOpacity. Motion uses critically damped snappy, smooth, and bouncy springs; press stays a color change.

## Shapes

- Radii: `radius-md` (control) 4px, `radius-lg` (container) 8px, `radius-xl` (modal) 8px; A-layer `radius` equals `radius-md` (`curve: "circular"`).

## Motion & Micro-interaction

- Press scale: `1`, state transition: 83ms `decelerate`, spring `500/46/1`, theme switch: `fade` (167ms).

## Voice & Content Strategy

Voice & Content Strategy is intentionally omitted; copy and tone belong to the host application.

## Components

Components read semantic `surface()`, `feedback`, `motion`, and `control()` primitives.

## Do's and Don'ts

- **Do:** Read colors, surfaces, feedback, and controls via `@shadcn-nsh/theme` rather than hardcoded literals.
- **Do:** Use `focus.style: "double"` (2px outer ring + 1px inner separator) and WinUI decelerate motion.
- **Don't:** Branch on theme IDs inside UI components.
- **Don't:** Do not substitute continuous squircle corners for WinUI 3's circular corners.
