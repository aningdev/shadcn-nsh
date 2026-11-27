---
title: Slider
description: A sunk rail, citrus fill, and round thumb with a focus ring.
component: true
demo: slider
---

## Installation

```npm
npx shadcn-nsh@latest add slider
```

## Usage

```tsx
import { Slider } from "nsh/base";

import { sliderFill, sliderLook } from "@/components/ui/slider";
```

```tsx
const look = sliderLook();

<Slider
  value={volume()}
  onChange={({ value }) => volume.set(value as number)}
  rangeStyle={sliderFill(0, volume() / 100)}
  {...look}
/>;
```

## Examples

### Disabled

Opacity on the track comes from the look's `disabled:opacity-50` class on `trackClass`.

### The rail and the knob

Both come from the theme, read where the slider draws: the `track` value of `control()` gives the
groove — its face colour, and, on a graved groove (`sunk`), the inset shade that is also the edge of
the accent's run — and the `handle` value gives the knob: a disc, or WinUI's ring, with the rail's
thickness, the band around it, the pressed size, and a vertical rail 128 points long (144 on a
touch screen) on every form.

### Value column

`showValue` lays the value beside a horizontal rail (a 42-point column) or above a vertical one.
A string of your own replaces the formatted number and keeps that place.

```tsx
import { sliderValueStyle } from "@/components/ui/slider";

<Slider showValue value={volume()} onChange={({ value }) => volume.set(value as number)}>
  <Text class="w-[42px] text-right font-mono text-[11px] leading-none" style={sliderValueStyle()}>
    64%
  </Text>
</Slider>;
```

### Vertical

A fill that starts at the rail's start (`from` at or below 0) stays nsh's own run, from the
minimum to the thumb. A fill that starts later sets its own edges. Name the farther end first
when the span reaches back to the start, so a band lit from the middle still places itself at
the minimum:

```tsx
const at = (db + 12) / 24;

<Slider
  axis="vertical"
  showValue
  min={-12}
  max={12}
  value={db}
  rangeStyle={sliderFill(Math.max(0.5, at), Math.min(0.5, at), true)}
>
  <Text class="text-center font-mono text-[11px] leading-none" style={sliderValueStyle()}>
    {db}
  </Text>
</Slider>;
```

## API

`Slider` is [`nsh/base` Slider](https://nsh.dev/elements/slider) wearing `sliderLook` and `sliderFill`: every base prop passes through, and the look's classes and styles are defaults the caller can override.

| Part                 | Props                                                                                                                                         | Description                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Slider`             | `axis`, `showValue`, and every `nsh/base` Slider prop (`value`, `min`, `max`, `step`, `onChange`, `onChangeEnd`, `disabled`, `rangeStyle`, …) | The rail, the thumb and the fill. `showValue` lays the value beside a horizontal rail, or above a vertical one                                      |
| `sliderLook()`       | `vertical`, `value`                                                                                                                           | The parts to spread on a slider of your own: `class`, `trackClass`, `indicatorClass` / `indicatorStyle`, `rangeClass`, `thumbClass` / `thumbStyle`  |
| `sliderFill()`       | `from`, `to`, `vertical`                                                                                                                      | The accent between `from` and `to` when `from` is past the rail's start. A `from` of 0 or less leaves placement to nsh, so a thumb can drag the run |
| `sliderValueStyle()` | —                                                                                                                                             | The value label's color. A horizontal column is `w-[42px] text-right font-mono text-[11px] leading-none`; a vertical readout is a centered line     |
