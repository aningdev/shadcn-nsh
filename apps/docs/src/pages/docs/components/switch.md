---
layout: ../../../layouts/Docs.astro
title: Switch
description: An on / off switch whose knob springs across a sunk track.
component: true
demo: switch
---

## Installation

```sh
npx shadcn-nsh@latest add switch
```

## Usage

```tsx
import { Switch } from "@/components/ui/switch";
```

```tsx
<Switch checked={on()} onChange={({ checked }) => on.set(checked)}>
  <Text>Wi-Fi</Text>
</Switch>
```

## Examples

### In a row

A row with its label is the target: put the label in `children` and let `listRow` draw the row.

```tsx
<Switch
  checked={wifi()}
  onChange={({ checked }) => wifi.set(checked)}
  {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
>
  <RowDivider show={false} />
  <RowLabel label="Wi-Fi" />
</Switch>
```

### Alone

With no children the track is all of it; a touch screen gets a 44-point target from a hit slop.

```tsx
<Switch
  accessibilityLabel="Bluetooth"
  checked={bluetooth()}
  onChange={({ checked }) => bluetooth.set(checked)}
/>
```

### Small

`size` is read on a touch screen; with a pointer both sizes are 28 × 16.

```tsx
<Switch size="small" checked={on()} onChange={({ checked }) => on.set(checked)} />
<Switch size="regular" checked={on()} onChange={({ checked }) => on.set(checked)} />
```

### Disabled

```tsx
<Switch checked={false} disabled>
  <Text>Ask to join networks</Text>
</Switch>
```

### The look alone

`switchLook` gives the track and knob classes to a `nsh/base` switch of your own; `switchHitSlop` gives the touch target.

```tsx
<BaseSwitch
  {...switchLook(() => on(), "regular")}
  checked={on()}
  onChange={({ checked }) => on.set(checked)}
/>
```

## API

Every prop of [`nsh/base` Switch](https://nsh.dev/elements/switch) passes through. `trackClass`, `trackStyle` and `thumbStyle` go over the look's.

| Prop                 | Type                    | Default     |
| -------------------- | ----------------------- | ----------- |
| `checked`            | `boolean`               |             |
| `onChange`           | `({ checked }) => void` |             |
| `size`               | `"small" \| "regular"`  | `"regular"` |
| `disabled`           | `boolean`               | `false`     |
| `children`           | `JSX.Element`           |             |
| `accessibilityLabel` | `string`                |             |
| `hitSlop`            | object                  |             |

### Sizes

| Size      | Pointer | Touch screen |
| --------- | ------- | ------------ |
| `regular` | 28 × 16 | 42 × 24      |
| `small`   | 28 × 16 | 34 × 20      |

The knob keeps its size on and off; on, it is white with an olive edge (`finish.knobOn`).
