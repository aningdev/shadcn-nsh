---
layout: ../../../layouts/Docs.astro
title: Slider
description: Styled slider wrapping nsh/base Slider — sunk rail, round thumb.
component: true
demo: slider
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns the value, the step, the keyboard, dragging, and each thumb's role. This package paints the sunk rail, the primary run, and a round thumb. A pointer gets a 14-point thumb on a 6-point rail in a 20-point band; a touch screen gets 20, 8, and 32.

## Install

```npx tabs
npx shadcn-nsh@latest add slider
```

```bunx tabs
bunx shadcn-nsh@latest add slider
```

```pnx tabs
pnx shadcn-nsh@latest add slider
```

```yarn tabs
yarn dlx shadcn-nsh@latest add slider
```

## Usage

```tsx
import { Slider } from "@workspace/ui/components/ui/slider";

<Slider value={volume()} onChange={({ value }) => setVolume(value as number)} />;
```

## Range

```tsx
<Slider
  value={price()}
  min={0}
  max={1000}
  step={10}
  onChange={({ value }) => setPrice(value as [number, number])}
/>
```

## Vertical

The run is 128 points with a pointer and 144 on a touch screen (the reference's `h-32` / `h-36`).

```tsx
<Slider axis="vertical" value={band()} min={-12} max={12} />
```

## Value beside the track

`children` sit in a row after the track. The track flexes.

```tsx
<Slider value={strength()} onChange={({ value }) => setStrength(value as number)}>
  <Text>64%</Text>
</Slider>
```

## API

### Props

| Prop                        | Type                         | Default           | Notes                                                               |
| --------------------------- | ---------------------------- | ----------------- | ------------------------------------------------------------------- |
| `value`                     | `number \| [number, number]` | —                 | Controlled (from base)                                              |
| `defaultValue`              | `SliderValue`                | `0`               | Forwarded                                                           |
| `min` / `max` / `step`      | `number`                     | `0` / `100` / `1` | Forwarded                                                           |
| `scale`                     | `"linear" \| "logarithmic"`  | `"linear"`        | Forwarded                                                           |
| `axis`                      | `"horizontal" \| "vertical"` | `"horizontal"`    | Read when drawing the chrome. Base reads it when the slider is made |
| `disabled`                  | `boolean`                    | —                 | Root fades to 0.5                                                   |
| `accessibilityLabel`        | `string`                     | —                 | The thumb (the end thumb of a range)                                |
| `startAccessibilityLabel`   | `string`                     | —                 | A range's start thumb                                               |
| `trackStyle`                | `StyleProp<ViewStyle>`       | —                 | Merged over the press band                                          |
| `indicatorStyle`            | `StyleProp<ViewStyle>`       | —                 | Merged over the sunk rail                                           |
| `rangeStyle`                | `StyleProp<ViewStyle>`       | —                 | Merged over the primary run                                         |
| `thumbClass` / `thumbStyle` |                              | —                 | Class is appended after the brightness transition                   |
| `focusWithinStyle`          | `StyleProp<ViewStyle>`       | —                 | Merged over the focus ring on the control                           |
| `disabledStyle`             | `StyleProp<ViewStyle>`       | —                 | Merged over `{ opacity: 0.5 }`                                      |
| `children`                  | `JSX.Element`                | —                 | Beside the track (horizontal) or under it                           |

`sliderVariants({ axis })` returns the chrome and `{ thumb, rail, band, run, inset }`.

### Events

| Event         | Notes                                                            |
| ------------- | ---------------------------------------------------------------- |
| `onChange`    | `{ value }` as the pointer, a key, or a screen reader changes it |
| `onChangeEnd` | `{ value }` once, when the change ends                           |

## Differences

| Topic      | Reference (`slider.ts`)                                       | This package                                                                                                                                                      |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rail / run | `colors.track`, `finish.track`, citrus `finish.fill`          | Shared with Progress: `muted` plus `finish.control.pressed`, `primary` plus `finish.filled`                                                                       |
| Thumb      | `finish.knob`, `hover:brightness-105`, `active:brightness-95` | `background` disc, `border`, `finish.control.rest`. The same brightness classes. Brightness above 1 does not draw on Apple, so the hover lighten is a no-op there |
| Disabled   | The track at 35%                                              | The whole control at 0.5 — the one disabled look                                                                                                                  |
| Focus      | A ring on the rail (`focus-within` on the indicator)          | `focusRing()` on the root. Base exposes `focusWithinStyle` on the root, not on the indicator                                                                      |
| Hit target | A 32-point band on touch; no extra slop                       | The same. `Slider`'s typed props have no `hitSlop`                                                                                                                |
| Vertical   | `h-32` / `h-36`                                               | 128 / 144, a fixed run                                                                                                                                            |
| shadcn     | —                                                             | No `variant` / `size`                                                                                                                                             |

## Not forwarded

None — every `nsh/base` Slider prop passes through.
