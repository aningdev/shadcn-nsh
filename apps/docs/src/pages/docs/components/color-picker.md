---
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

## API

Look helpers: `colorAreaLook`, `colorSliderLook`, `colorChecker`, `ColorFields`, `ColorTrigger`, `ColorSwatches`, `ColorCopy`, `ColorDropper`, `colorFormats`. Behavior stays in [`nsh/base` ColorPicker](https://nsh.dev/elements/color-picker) parts.
