---
layout: ../../../layouts/Docs.astro
title: Slider
description: Styled slider wrapping nsh/base Slider.
component: true
demo: slider
---

Styled slider on `nsh/base` Slider. Track, range, and thumb chrome are fixed; value types come from base (`SliderValue`).

## Install

```sh
shadcn-nsh add slider
# monorepo:
shadcn-nsh add slider -c apps/web
```

## Usage

```tsx
import { Slider } from "@workspace/ui/components/ui/slider";

<Slider
  value={volume()}
  onChange={({ value }) => setVolume(value as number)}
/>
```

## Examples

### Controlled

```tsx
const [volume, setVolume] = createSignal(40);

<Slider value={volume()} onChange={({ value }) => setVolume(value as number)} />
```

### Range / step

```tsx
<Slider min={0} max={100} step={5} defaultValue={25} onChangeEnd={({ value }) => {}} />
```

### Vertical / disabled

```tsx
<Slider axis="vertical" value={40} onChange={() => {}} />
<Slider value={10} disabled />
```

## API

| Prop                 | Type                                              | Default | Notes                                      |
| -------------------- | ------------------------------------------------- | ------- | ------------------------------------------ |
| `value`              | `SliderValue \| null`                             | —       | Controlled (`SliderValue` from `nsh/base`) |
| `defaultValue`       | `SliderValue`                                     | —       | Uncontrolled initial                       |
| `min`                | `number`                                          | —       |                                            |
| `max`                | `number`                                          | —       |                                            |
| `step`               | `number`                                          | —       |                                            |
| `scale`              | `SliderScale`                                     | —       | From `nsh/base` (not re-exported)          |
| `axis`               | `Axis`                                            | —       | `"vertical"` switches layout styles        |
| `disabled`           | `boolean`                                         | —       |                                            |
| `accessibilityLabel` | `string \| null`                                  | —       |                                            |
| `children`           | `JSX.Element`                                     | —       |                                            |
| `onChange`           | `(event: { value: SliderValue }) => void`         | —       |                                            |
| `onChangeEnd`        | `(event: { value: SliderValue }) => void`         | —       |                                            |

`Axis`, `SliderScale`, and `SliderValue` are imported from `nsh/base` in the wrapper source and are **not** re-exported from this package.

## Differences

| Topic       | shadcn                                      | This package                                           |
| ----------- | ------------------------------------------- | ------------------------------------------------------ |
| Parts       | `Slider` / `Track` / `Range` / `Thumb`      | single `Slider`; chrome built in                       |
| Value       | often `number[]`                            | `SliderValue` from nsh/base                            |
| Orientation | `orientation`                               | `axis`                                                 |
| Change API  | `onValueChange`                             | `onChange` / `onChangeEnd` with `{ value }`            |

## Not forwarded

From `nsh/base` Slider: `style`, `trackStyle`, `indicatorStyle`, `rangeStyle`, and `thumbStyle` (thumb includes the focus ring). The wrapper owns muted track, primary range, and thumb look.
