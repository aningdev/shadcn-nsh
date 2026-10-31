---
layout: ../../../layouts/Docs.astro
title: Context Menu
description: Styled context menu wrapping nsh/base ContextMenu.
component: true
---

Styled context menu on `nsh/base` `ContextMenu` (nsh element `menu`). Item / separator / sub re-export the dropdown-menu parts.

## Install

```sh
shadcn-nsh add context-menu
# monorepo:
shadcn-nsh add context-menu -c apps/web
```

## Usage

```tsx
import { ContextMenu, ContextMenuItem } from "@workspace/ui/components/ui/context-menu";
import { Text, View } from "nsh";

<ContextMenu
  trigger={
    <View>
      <Text>Right-click me</Text>
    </View>
  }
>
  <ContextMenuItem onSelect={() => {}}>
    <Text>Copy</Text>
  </ContextMenuItem>
</ContextMenu>;
```

## Composition

```
ContextMenu
├─ trigger (prop)
├─ ContextMenuItem   (= DropdownMenuItem)
├─ ContextMenuSeparator
└─ ContextMenuSub
```

## API

**`ContextMenu`**

| Prop           | Type                                                 | Notes |
| -------------- | ---------------------------------------------------- | ----- |
| `open`         | `boolean \| null`                                    |       |
| `disabled`     | `boolean`                                            |       |
| `trigger`      | `JSX.Element`                                        |       |
| `children`     | `JSX.Element`                                        |       |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` |       |

Item / separator / sub props match [Dropdown Menu](./dropdown-menu).

<div class="callout">

**Not forwarded:** popup `offset` (fixed to `4`) and `popupStyle` / `backdropStyle`.

</div>
