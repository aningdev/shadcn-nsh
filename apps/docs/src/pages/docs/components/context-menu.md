---
layout: ../../../layouts/Docs.astro
title: Context Menu
description: Context menu with Trigger / Content composition over nsh/base.
component: true
demo: context-menu
demoHeight: 360
---

Opens on secondary click / long-press on the trigger.

## Install

```sh
shadcn-nsh add context-menu
```

## Usage

```tsx
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@workspace/ui/components/ui/context-menu";

<ContextMenu>
  <ContextMenuTrigger>
    <View>Right-click me</View>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => {}}>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>;
```

## Composition

Same shape as Dropdown Menu (Trigger / Content / Item / Sub / …).

## Differences

Shares Item/Separator/Sub implementations with Dropdown Menu. Legacy `trigger` prop still works.

## Not forwarded

Popup chrome locked in the wrapper.
