---
layout: ../../../layouts/Docs.astro
title: ColorPicker
description: Styled color picker wrapping nsh/base ColorPicker and its parts.
component: true
demo: color-picker
demoHeight: 360
---

[`nsh/base`](https://nsh.dev/elements/color-picker) owns the color, the channel math and the keys. This package paints the plane, the sliders, the field well, the swatches and the eyedropper. Put the picker in a [`Popover`](./popover) when it should open from a trigger.

## Install

```npx tabs
npx shadcn-nsh@latest add color-picker
```

```bunx tabs
bunx shadcn-nsh@latest add color-picker
```

```pnx tabs
pnx shadcn-nsh@latest add color-picker
```

```yarn tabs
yarn dlx shadcn-nsh@latest add color-picker
```

## Usage

```tsx
import {
  ColorArea,
  ColorEyeDropper,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
} from "@workspace/ui/components/ui/color-picker";

<ColorPicker value={color()} onChange={(event) => color.set(event.value)}>
  <ColorArea accessibilityLabel="Saturation and brightness" style={{ height: 120 }} />
  <ColorSlider channel="hue" accessibilityLabel="Hue" />
  <ColorSlider channel="alpha" accessibilityLabel="Alpha" />
  <ColorField accessibilityLabel="Hex" />
  <ColorSwatch />
  <ColorSwatch color="#1d4ed8" accessibilityLabel="Blue" />
  <ColorEyeDropper accessibilityLabel="Pick a color" />
</ColorPicker>;
```

## Composition

| Part              | Role                                                            |
| ----------------- | --------------------------------------------------------------- |
| `ColorPicker`     | Holds the color. `value` / `defaultValue`, `format`, `disabled` |
| `ColorArea`       | Saturation and brightness of the current hue                    |
| `ColorSlider`     | One channel (`channel`, `colorSpace`, `axis`), or `"alpha"`     |
| `ColorField`      | The whole color, or one channel when `channel` is set           |
| `ColorSwatch`     | A preset. Omit `color` to preview the current color             |
| `ColorEyeDropper` | The platform sampler. Disabled where the platform has none      |

`colorPickerVariants()` returns each part's chrome. Thumbs fill with the color (`fillThumb`, default true). Alpha tracks and translucent swatches sit on a `muted` checkerboard.

## API

The field uses the same well as Input: sunk while it can be edited, flat and at opacity 0.5 while disabled, a 2-point `ring` edge while focused. Sliders and the area take a focus ring around the control. A swatch that matches the color draws a `ring` outline.

| Piece   | Pointer                          | Touch                          |
| ------- | -------------------------------- | ------------------------------ |
| Area    | 72 points tall minimum, 160 wide | 96 points tall                 |
| Slider  | 24 points tall, 16-point thumb   | 44 points tall, 20-point thumb |
| Field   | 28 points tall, text 13          | 44 points tall, text 15        |
| Swatch  | 28-point square                  | 44-point square                |
| Dropper | 28 points tall                   | 44 points tall                 |

A thumb's side is fixed so the ring stays a circle. Pass `null` for `checkerboardColor` to remove the checkerboard. `disabled:hidden` on the eyedropper hides it where the platform cannot sample the screen.

## Differences

| Topic        | `nsh/base`                                           | This package                                                                  |
| ------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Look         | None. The app supplies every size, radius and border | Field well, radius, focus ring, checkerboard                                  |
| Popup        | None. Compose with Popover                           | Same. No trigger is added                                                     |
| Thumb border | The app's, often white                               | `background` plus a hairline of `foreground`, so it reads in both appearances |
| Disabled     | `disabled:` classes                                  | Opacity 0.5, the one disabled look                                            |
| shadcn       | No direct equivalent                                 | One registry id, `color-picker`, for the whole family                         |

## Accessibility

The area and each slider are adjustable controls. Set `accessibilityLabel` to the channel ("Hue", "Alpha"), not the word "slider". The field needs a label when no visible text names it. A swatch's default label is the color in hex; set one when the preset has a name ("Blue"). The eyedropper's label should say what it picks.
