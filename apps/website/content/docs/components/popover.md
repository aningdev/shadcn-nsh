---
title: Popover
description: A popup panel that grows from its trigger, on the shared menu surface.
component: true
demo: popover
---

## Installation

```npm
npx shadcn-nsh@latest add popover
```

## Usage

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
```

```tsx
<Popover>
  <PopoverTrigger>Order 1024</PopoverTrigger>
  <PopoverContent width={260}>Shipped yesterday</PopoverContent>
</Popover>
```

## Composition

Use the following composition to build a `Popover`:

```text
Popover
├── PopoverTrigger
└── PopoverContent
    └── PopoverHeader
        ├── PopoverTitle
        └── PopoverDescription
```

## Examples

### With a header

`PopoverHeader`, `PopoverTitle` and `PopoverDescription` are layout and text: upstream writes a
popover's content inline, so give them the app's type with `style`.

```tsx
<PopoverContent width={260}>
  <PopoverHeader style={{ gap: 2 }}>
    <PopoverTitle style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
      Shipped yesterday
    </PopoverTitle>
    <PopoverDescription style={{ fontSize: 12, color: colors.mutedForeground }}>
      Arriving Friday.
    </PopoverDescription>
  </PopoverHeader>
</PopoverContent>
```

### Compact

A line or two: 12 points of padding and 4 between rows.

```tsx
<PopoverContent compact>Saved</PopoverContent>
```

### Placement

```tsx
<PopoverContent placement="top" offset={8}>
  …
</PopoverContent>
```

### A trigger of your own

A string child is a `Button` (`variant`, `secondary` by default). A single element child is
the trigger itself, with no wrapper: its look, `testID`, name, own press, hover, active and
focus styles all stay, and `nsh/base` adds the open state to it, so `expandedStyle` and
`expanded:` classes answer the popup. `variant`, `disabled` and `style` shape a string
child; an element brings its own (its `disabled` is the one that counts).

```tsx
<PopoverTrigger variant="default">Filters</PopoverTrigger>
<PopoverTrigger>
  <Badge>New</Badge>
</PopoverTrigger>
<PopoverTrigger>
  <View accessibilityLabel="Filters" expandedStyle={{ backgroundColor: colors.accent }}>
    <Icon icon={SlidersHorizontal} size={14} />
    <Text>Filters</Text>
  </View>
</PopoverTrigger>
```

## Differences from shadcn/ui

- No `asChild` or `render`: NSH merges the trigger's behavior into the element a slot holds
  (`references/nsh/crates/nsh-core/src/core/slots.rs`), so a single element child is the
  trigger already. `shadcn`'s `render` would have nothing left to merge.
- `onOpenChange` reports `{ open, reason }`.

## API

The root owns the open flag; `PopoverContent` mounts [`nsh/base` Popover](https://nsh.dev/elements/popover) and every base prop passes through except those. Its children come in on a `PopIn` with `popoverLook` (the surface, 14 points of padding with a pointer and 16 on a touch screen).

| Part                 | Props                                                                                                | Description                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Popover`            | `open`, `defaultOpen`, `onOpenChange`, `onOpen`, `onClose`, `onCancel`                               | The root owns the open flag                                     |
| `PopoverTrigger`     | `variant`, `disabled`, `style`                                                                       | A string child's `Button`; an element child is the trigger      |
| `PopoverContent`     | `compact`, `width`, `placement`, `align`, `offset`, `margin`, `closeOnEscape`, `closeOnPressOutside` | The panel; `placement` through `closeOnPressOutside` are base's |
| `PopoverHeader`      | `style`, `class`                                                                                     | A `View` around a title and its description                     |
| `PopoverTitle`       | `style`, `class`                                                                                     | A string is `Text`                                              |
| `PopoverDescription` | `style`, `class`                                                                                     | As `PopoverTitle`                                               |
