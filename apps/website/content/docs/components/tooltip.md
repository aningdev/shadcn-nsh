---
title: Tooltip
description: A popover-coloured hint bubble on any element's `tooltip` prop.
component: true
demo: tooltip
---

## Installation

```npm
npx shadcn-nsh@latest add tooltip
```

## Usage

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Icon } from "@/lib/ui/icons";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<Tooltip>
  <TooltipTrigger>Add to favorites</TooltipTrigger>
  <TooltipContent>Add to favorites</TooltipContent>
</Tooltip>
```

## Composition

Use the following composition to build a `Tooltip`:

```text
Tooltip
├── TooltipTrigger
└── TooltipContent
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
  <Text style={tooltipTextStyle()}>Delete forever</Text>
  <Text style={tooltipNote()}>⌘⌫</Text>
</TooltipContent>
```

### On any element's `tooltip` prop

`nsh/base` takes a hint as a host's `tooltip`; `TooltipContent` alone is that hint.

```tsx
<Button tooltip={<TooltipContent>Add to favorites</TooltipContent>}>Star</Button>
```

### A trigger of your own

A string child is a `Button`; anything else is the element itself, and its own press, hover
and name stay.

```tsx
<TooltipTrigger variant="ghost">Star</TooltipTrigger>
<TooltipTrigger>
  <Icon icon={Star} size={16} tint={colors.mutedForeground} />
</TooltipTrigger>
```

### On a menu's trigger

A tooltip hangs on the element the trigger is. Give that element the `tooltip` prop and
hand it to the trigger that wants the press; do not nest `TooltipTrigger` around a trigger
part, which draws nothing for the hint's host to wrap.

```tsx
<Menu>
  <MenuTrigger>
    <View
      accessibilityLabel="More actions"
      tooltip={<TooltipContent>More actions</TooltipContent>}
      style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}
    >
      <Icon icon={Ellipsis} size={16} tint={colors.mutedForeground} />
    </View>
  </MenuTrigger>
  <MenuContent>…</MenuContent>
</Menu>
```

## API

`nsh/base`'s Tooltip is the bubble itself, shown through a host's `tooltip` prop, so the root renders one host view around its trigger. `TooltipContent` mounts [`nsh/base` Tooltip](https://nsh.dev/elements/tooltip); every base prop passes through and `class` goes over the bubble's own. A string child is drawn in `tooltipTextStyle()`; a shortcut or a note takes `tooltipNote()`.

| Part                                  | Props                                                                                                                               | Description                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Tooltip`                             | `open` / `defaultOpen`, `placement`, `align`, `offset`, `margin`, `delay`, `disabled`, `style`, `onOpenChange`, `onOpen`, `onClose` | The root: it owns whether the hint shows, and renders one host view around its trigger |
| `TooltipTrigger`                      | The host: `variant` (a string child's `Button`), `disabled`, `style`                                                                | The element the hint hangs on                                                          |
| `TooltipContent`                      | The bubble: `rich`, and base's `placement`, `align`, `offset`, `margin`, `delay`, `disabled`; alone, it is a host's `tooltip`       | The hint itself, on the inverse surface                                                |
| `tooltipTextStyle()`, `tooltipNote()` |                                                                                                                                     | The type of a string child, and of a shortcut or a note in a bubble of your own        |
