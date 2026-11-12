---
title: Slider
description: A sunk rail, citrus fill, and round thumb with a focus ring.
component: true
demo: slider
---

## Installation

```sh
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

### Value column

```tsx
import { sliderValueClass, sliderValueStyle } from "@/components/ui/slider";

<Slider {...sliderLook({ value: true })}>
  <Text class={sliderValueClass} style={sliderValueStyle()}>
    64%
  </Text>
</Slider>;
```

### Vertical

```tsx
sliderLook({ vertical: true });
sliderFill(0, level / 100, true);
```

### Disabled

Opacity on the track comes from the look's `disabled:opacity-50` class on `trackClass`.

## API

Uses `sliderLook`, `sliderFill`, `sliderValueClass`, and `sliderValueStyle`. Every prop of [`nsh/base` Slider](https://nsh.dev/elements/slider) passes through.

| Export / option | Type      | Default                  |
| --------------- | --------- | ------------------------ |
| `value`         | `boolean` | Show value column layout |
| `vertical`      | `boolean` | Horizontal rail          |
| `showValue`     | on shell  | Same as look `value`     |
