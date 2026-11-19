---
title: Toggle
description: A two-state button, in two variants and three sizes.
component: true
demo: toggle
---

## Installation

```npm
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
<Toggle>Bold</Toggle>
<Toggle variant="outline">Bold</Toggle>
```

### Size

```tsx
<Toggle size="sm">Small</Toggle>
<Toggle size="default">Default</Toggle>
<Toggle size="lg">Large</Toggle>
```

A size is compact with a pointer (24 / 28 / 34 points) and roomier on a touch screen (32 / 38 / 44), where a hit slop makes the target 44 points.

### Disabled

```tsx
<Toggle disabled>Bold</Toggle>
```

### Pressed

```tsx
<Toggle pressed={on()} onChange={({ pressed }) => on.set(pressed)}>
  Bold
</Toggle>
```

### Names for screen readers

A string child is the toggle's name for screen readers, and `accessibilityLabel` wins when it should differ from the visible label. Children drawn as given (an icon and a label of your own) are named by the texts inside them.

### The look alone

The look is a function, for a pressable of your own.

```tsx
<Toggle pressed={on()} {...toggleLook({ text: true })}>
  <Text style={toggleLabel(on, { text: true })}>Bold</Text>
</Toggle>
```

## API

Every prop of [`nsh/base` Toggle](https://nsh.dev/elements/toggle) passes through. `style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle`, `pressedStyle` and `disabledStyle` go over the look's.

| Part     | Props                                                                                               | Description                                                       |
| -------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Toggle` | `variant`, `size`, `children`, and every `nsh/base` Toggle prop (`pressed`, `onChange`, `disabled`) | A two-state button; a string child is its name for screen readers |

`toggleLook`, `toggleLabel` and `toggleGlyph` are the look's parts, for a pressable of your own.
