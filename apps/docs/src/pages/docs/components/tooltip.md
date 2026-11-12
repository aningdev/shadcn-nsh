---
title: Tooltip
description: A popover-coloured hint bubble on any element's `tooltip` prop.
component: true
demo: tooltip
---

## Installation

```sh
npx shadcn-nsh@latest add tooltip
```

## Usage

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
```

```tsx
<Tooltip>
  <TooltipTrigger>Add to favorites</TooltipTrigger>
  <TooltipContent>Add to favorites</TooltipContent>
</Tooltip>
```

## Examples

### Placement

```tsx
<Tooltip placement="top">…</Tooltip>
<Tooltip placement="bottom">…</Tooltip>
```

### Rich

A title and a note in a column, 10 points of padding.

```tsx
<TooltipContent rich>
  <Text class={tooltipText}>Delete forever</Text>
  <Text class={tooltipNote}>⌘⌫</Text>
</TooltipContent>
```

### On any element's `tooltip` prop

`nsh/base` takes a hint as a host's `tooltip`; `TooltipContent` alone is that hint.

```tsx
<Button tooltip={<TooltipContent>Add to favorites</TooltipContent>}>Star</Button>
```

### A trigger of your own

A string child is a `Button`; anything else is the element itself.

```tsx
<TooltipTrigger variant="ghost">Star</TooltipTrigger>
<TooltipTrigger>
  <Icon name="star" size={16} tint={colors.muted} />
</TooltipTrigger>
```

## API

`nsh/base`'s Tooltip is the bubble itself, shown through a host's `tooltip` prop, so the root renders one host view around its trigger. `TooltipContent` mounts [`nsh/base` Tooltip](https://nsh.dev/elements/tooltip); every base prop passes through and `class` goes over `tooltipLook`'s.

| Part             | Notes                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Tooltip`        | `open` / `defaultOpen`, `placement`, `align`, `offset`, `margin`, `delay`, `disabled`, `onOpenChange`, `onOpen`, `onClose`    |
| `TooltipTrigger` | The host: `variant` (a string child's `Button`), `disabled`, `style`                                                          |
| `TooltipContent` | The bubble: `rich`, and base's `placement`, `align`, `offset`, `margin`, `delay`, `disabled`; alone, it is a host's `tooltip` |
