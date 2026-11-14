---
layout: ../../../layouts/Docs.astro
title: Context Menu
description: A menu at the pointer, on the shared menu look.
component: true
demo: context-menu
---

## Installation

```sh
npx shadcn-nsh@latest add context-menu
```

## Usage

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
```

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <View>Right click here</View>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => {}}>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Examples

### A surface

Any view can be the trigger; the menu opens at the pointer on a secondary click or a long press.

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <View style={{ height: 150 }}>Right click or hold</View>
  </ContextMenuTrigger>
  <ContextMenuContent margin={8}>
    <ContextMenuItem onSelect={() => copy()}>Copy</ContextMenuItem>
    <ContextMenuItem onSelect={() => paste()}>Paste</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Separator and a destructive item

```tsx
<ContextMenuItem onSelect={() => cut()}>Cut</ContextMenuItem>
<ContextMenuSeparator />
<ContextMenuItem variant="destructive" onSelect={() => remove()}>
  Delete
</ContextMenuItem>
```

### Keep it open

`closeOnSelect={false}` leaves the menu up for a toggle inside it.

```tsx
<ContextMenuItem closeOnSelect={false} onSelect={() => setPinned(!pinned())}>
  <Text style={menuItemLabel()}>{() => (pinned() ? "Unpin" : "Pin")}</Text>
</ContextMenuItem>
```

### Open change

```tsx
<ContextMenu onOpenChange={({ open, reason }) => log(open, reason)}>…</ContextMenu>
```

## API

Row and popup looks come from Menu. Items, separators, labels and submenus are re-exported as `ContextMenu*` parts.

| Part                 | Notes                           |
| -------------------- | ------------------------------- |
| `ContextMenu`        | Open state + trigger slot       |
| `ContextMenuTrigger` | Secondary click / long-press    |
| `ContextMenuContent` | Popup / sheet; default offset 4 |
| `ContextMenuItem` …  | Same as Menu counterparts       |
