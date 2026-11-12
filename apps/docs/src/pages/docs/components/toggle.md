---
title: Toggle
description: A two-state button, in two variants and three sizes.
component: true
demo: toggle
---

## Installation

```sh
npx shadcn-nsh@latest add toggle
```

## Usage

```tsx
import { Toggle } from "@/components/ui/toggle";
```

```tsx
<Toggle pressed={on()} onChange={({ pressed }) => on.set(pressed)}>
  Bold
</Toggle>
```

## Examples

### Variant

```tsx
<Toggle>Ghost</Toggle>
<Toggle variant="outline">Outline</Toggle>
```

### Size

```tsx
<Toggle size="small">Small</Toggle>
<Toggle size="regular">Regular</Toggle>
<Toggle size="large">Large</Toggle>
```

A size is compact with a pointer (24 / 28 / 34 points) and roomier on a touch screen (32 / 38 / 44), where a hit slop makes the target 44 points.

### Pressed

```tsx
<Toggle pressed={on()} onChange={({ pressed }) => on.set(pressed)}>
  Bold
</Toggle>
```

### Disabled

```tsx
<Toggle disabled>Bold</Toggle>
```

### The look alone

The look is a function, for a pressable of your own.

```tsx
<Toggle pressed={on()} {...toggleLook({ text: true })}>
  <Text style={toggleLabel(on, { text: true })}>Bold</Text>
</Toggle>
```

## API

Every prop of [`nsh/base` Toggle](https://nsh.dev/elements/toggle) passes through. `style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle`, `pressedStyle` and `disabledStyle` go over the look's.

| Prop       | Type                              | Default     |
| ---------- | --------------------------------- | ----------- |
| `variant`  | `"ghost" \| "outline"`            | `"ghost"`   |
| `size`     | `"small" \| "regular" \| "large"` | `"regular"` |
| `children` | `string \| JSX.Element`           |             |
