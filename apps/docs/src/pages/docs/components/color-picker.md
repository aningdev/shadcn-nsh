---
layout: ../../../layouts/Docs.astro
title: ColorPicker
description: Area, sliders, joined fields, swatches, and a popover trigger.
component: true
demo: color-picker
---

## Installation

```sh
npx shadcn-nsh@latest add color-picker
```

## Usage

```tsx
import { ColorPicker } from "nsh/base";

import {
  ColorPanel,
  ColorPopover,
  colorAreaLook,
  colorSliderLook,
} from "@/components/ui/color-picker";
```

```tsx
<ColorPicker value={color()} onChange={({ value }) => color.set(value)}>
  <ColorPanel
    name="Fill color"
    value={color()}
    format="hex"
    onFormatChange={setFormat}
    alpha
    swatches={PRESETS}
  />
</ColorPicker>
```

`ColorPopover` wraps the same panel in a field trigger. Spread `colorAreaLook()` and `colorSliderLook()` on `ColorArea` / `ColorSlider` when composing your own layout.

## Examples

### Panel

`ColorPanel` lays out the area, the sliders, the fields and the swatches.

```tsx
<ColorPicker value={fill()} onChange={({ value }) => fill.set(value)}>
  <ColorPanel name="Fill color" value={fill()} format={format()} onFormatChange={setFormat} />
</ColorPicker>
```

### Alpha

```tsx
<ColorPanel name="Fill color" value={fill()} alpha />
```

### Swatches

```tsx
<ColorPanel
  name="Fill color"
  value={fill()}
  swatches={["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"]}
/>
```

### Format

`format` is one of `hex`, `rgb`, `hsl`, `hsb`, `oklch`; the fields' menu reports the reader's pick with `onFormatChange`.

```tsx
<ColorPanel name="Fill color" value={fill()} format={format()} onFormatChange={setFormat} />
```

## API

Look helpers: `colorAreaLook`, `colorSliderLook`, `colorChecker`, `ColorFields`, `ColorTrigger`, `ColorSwatches`, `ColorCopy`, `ColorDropper`, `colorFormats`. Behavior stays in [`nsh/base` ColorPicker](https://nsh.dev/elements/color-picker) parts.
