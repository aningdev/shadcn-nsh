---
title: ColorPicker
description: Area, sliders, joined fields, swatches, and a popover trigger.
component: true
demo: color-picker
---

## Installation

```npm
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

`ColorPanel` lays out the area, the sliders, the fields and the swatches. It has to sit
inside [`nsh/base`'s `ColorPicker`](https://nsh.dev/elements/color-picker): the panel's
parts look their picker up from that root, and outside it they log
`` `<part>` is outside a `ColorPicker`: its color goes nowhere `` and take no input.

```tsx
<ColorPicker value={fill()} onChange={({ value }) => fill.set(value)}>
  <ColorPanel name="Fill color" value={fill()} format={format()} onFormatChange={setFormat} />
</ColorPicker>
```

### Alpha

```tsx
<ColorPicker value={fill()} onChange={({ value }) => fill.set(value)}>
  <ColorPanel name="Fill color" value={fill()} alpha />
</ColorPicker>
```

### Swatches

```tsx
<ColorPicker value={fill()} onChange={({ value }) => fill.set(value)}>
  <ColorPanel
    name="Fill color"
    value={fill()}
    swatches={["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"]}
  />
</ColorPicker>
```

### Format

`format` is one of `hex`, `rgb`, `hsl`, `hsb`, `oklch`; the fields' menu reports the reader's pick with `onFormatChange`.

```tsx
<ColorPicker value={fill()} onChange={({ value }) => fill.set(value)}>
  <ColorPanel name="Fill color" value={fill()} format={format()} onFormatChange={setFormat} />
</ColorPicker>
```

## API

Look helpers: `colorAreaLook`, `colorSliderLook`, `formatColor`, `inkOn`. Parts: `ColorFields`, `ColorTrigger`, `ColorSwatches`, `ColorCopy`, `ColorDropper`. Behavior stays in [`nsh/base` ColorPicker](https://nsh.dev/elements/color-picker) parts.

| Part            | Props                                                                                    | Description                                                         |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `ColorFields`   | `value`, `name`, `format`, `onFormatChange`, `alpha`                                     | The fields of a color, with the format's menu.                      |
| `ColorPanel`    | every `ColorFields` prop, `swatches`                                                     | The fields with a row of swatches under them; inside `ColorPicker`. |
| `ColorPopover`  | `name`, `value`, `format`, `alpha`, `style`, `onChange`, `onFormatChange`, `onChangeEnd` | The panel wrapped in a field trigger.                               |
| `ColorTrigger`  | `open`, `value`, `style`                                                                 | The field that shows the color and opens the panel.                 |
| `ColorSwatches` | `colors`                                                                                 | The row of swatches, one of them chosen.                            |
| `ColorCopy`     | `name`, `text`                                                                           | Copies the value; a check shows for a moment.                       |
| `ColorDropper`  | `name`                                                                                   | The system eyedropper, hidden where the platform has none.          |
