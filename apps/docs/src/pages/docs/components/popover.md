---
layout: ../../../layouts/Docs.astro
title: Popover
description: A popup panel that grows from its trigger, on the shared menu surface.
component: true
demo: popover
---

## Installation

```sh
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

## Examples

### With a header

`PopoverHeader`, `PopoverTitle` and `PopoverDescription` are layout and text: upstream writes a
popover's content inline, so give them the app's type with `style`.

```tsx
<PopoverContent width={260}>
  <PopoverHeader style={{ gap: 2 }}>
    <PopoverTitle style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
      Shipped yesterday
    </PopoverTitle>
    <PopoverDescription style={{ fontSize: 12, color: colors.muted }}>
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

A string child is a `Button`; anything else is a pressable view.

```tsx
<PopoverTrigger variant="primary">Filters</PopoverTrigger>
<PopoverTrigger>
  <Badge>New</Badge>
</PopoverTrigger>
```

## API

The root owns the open flag; `PopoverContent` mounts [`nsh/base` Popover](https://nsh.dev/elements/popover) and every base prop passes through except those. Its children come in on a `PopIn` with `popoverLook` (the surface, 14 points of padding with a pointer and 16 on a touch screen).

| Part                 | Notes                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Popover`            | `open` / `defaultOpen`, `onOpenChange`, `onOpen`, `onClose`, `onCancel`                                         |
| `PopoverTrigger`     | `variant` (a string child's `Button`), `disabled`, `style`                                                      |
| `PopoverContent`     | `compact`, `width`, and base's `placement`, `align`, `offset`, `margin`, `closeOnEscape`, `closeOnPressOutside` |
| `PopoverHeader`      | A `View` around a title and its description (`style`, `class`)                                                  |
| `PopoverTitle`       | A string is `Text` (`style`, `class`)                                                                           |
| `PopoverDescription` | As `PopoverTitle`                                                                                               |
