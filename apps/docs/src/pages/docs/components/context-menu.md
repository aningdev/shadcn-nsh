---
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

## API

Row and popup looks come from Menu. Items, separators, labels and submenus are re-exported as `ContextMenu*` parts.

| Part                 | Notes                           |
| -------------------- | ------------------------------- |
| `ContextMenu`        | Open state + trigger slot       |
| `ContextMenuTrigger` | Secondary click / long-press    |
| `ContextMenuContent` | Popup / sheet; default offset 4 |
| `ContextMenuItem` …  | Same as Menu counterparts       |
