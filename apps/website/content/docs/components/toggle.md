---
title: Toggle
description: A two-state button, in two variants and three sizes, and a group of them.
component: true
demo: toggle
---

## Installation

```npm
npx shadcn-nsh@latest add toggle
```

## Usage

```tsx
import { Toggle, ToggleGroup } from "@/components/ui/toggle";
```

```tsx
<Toggle pressed={on()} onChange={({ pressed }) => on.set(pressed)}>
  Bold
</Toggle>
```

## Composition

Use the following composition to build a `Toggle`:

```text
Toggle

ToggleGroup
└── Toggle
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

`disabled` on a `Toggle` locks that one. `disabled` on a `ToggleGroup` locks every toggle in it —
the base bar hands its lock down, so no child needs its own `disabled`. A disabled toggle takes no
press, leaves the arrow keys' walk and reads as disabled to screen readers; it dims to 50%
(`disabledStyle`).

```tsx
<Toggle disabled>Bold</Toggle>
<ToggleGroup disabled>
  <Toggle pressed={bold()}>B</Toggle>
  <Toggle pressed={italic()}>I</Toggle>
</ToggleGroup>
```

### Group

A group is one toolbar for screen readers: one stop of the keyboard focus, arrow keys between its toggles. The default wears the inset track.

```tsx
<ToggleGroup>
  <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
    Bold
  </Toggle>
</ToggleGroup>
```

### Vertical

```tsx
<ToggleGroup vertical>
  <Toggle pressed={bold()}>Bold</Toggle>
</ToggleGroup>
```

### Inside a Toolbar

```tsx
import { Toolbar } from "@/components/ui/toolbar";

<Toolbar>
  <ToggleGroup inset={false}>
    <Toggle pressed={bold()}>B</Toggle>
  </ToggleGroup>
</Toolbar>;
```

`inset={false}` skips the track when a parent `Toolbar` already wears it.

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

Every prop of [`nsh/base` Toggle](https://nsh.dev/elements/toggle) and ToggleGroup passes through. `style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle`, `pressedStyle` and `disabledStyle` go over the look's.

| Part          | Props                                                                                               | Description                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Toggle`      | `variant`, `size`, `children`, and every `nsh/base` Toggle prop (`pressed`, `onChange`, `disabled`) | A two-state button; a string child is its name for screen readers        |
| `ToggleGroup` | `vertical`, `inset`, and every `nsh/base` ToggleGroup prop                                          | The inset track of `toolbarTrack` holding a row (or column) of `Toggle`s |

`toggleLook`, `toggleLabel` and `toggleGlyph` are the look's parts, for a pressable of your own. `toggleSizes` is the table a size reads — `side`, `icon`, `text` and `pad`, compact with a pointer and roomier on a touch screen — so a bar's own geometry can match a tool's (`toggleSizes.default.side`, 28 points with a pointer).
