---
layout: ../../../layouts/Docs.astro
title: Context Menu
description: Styled context menu wrapping nsh/base ContextMenu.
component: true
demo: context-menu
demoHeight: 400
---

Styled context menu on `nsh/base` `ContextMenu` (nsh element `menu`). Item / separator / sub re-export the dropdown-menu parts under `ContextMenu*` names. Pass the host via the `trigger` prop.

## Install

```sh
shadcn-nsh add context-menu
# monorepo:
shadcn-nsh add context-menu -c apps/web
```

## Usage

```tsx
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@workspace/ui/components/ui/context-menu";
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
  <ContextMenuSeparator />
  <ContextMenuItem onSelect={() => {}}>
    <Text>Delete</Text>
  </ContextMenuItem>
</ContextMenu>;
```

## Composition

```
ContextMenu
├─ trigger (prop)
└─ children
   ├─ ContextMenuItem      (= DropdownMenuItem)
   ├─ ContextMenuSeparator (= DropdownMenuSeparator)
   └─ ContextMenuSub       (= DropdownMenuSub)
      ├─ trigger (prop)
      └─ …items
```

## Examples

### Basic actions

```tsx
<ContextMenu
  trigger={
    <View>
      <Text>Right-click (or long-press)</Text>
    </View>
  }
>
  <ContextMenuItem onSelect={() => {}}>
    <Text>Copy</Text>
  </ContextMenuItem>
  <ContextMenuItem onSelect={() => {}}>
    <Text>Paste</Text>
  </ContextMenuItem>
</ContextMenu>
```

### With separator

```tsx
<ContextMenu trigger={<View><Text>Target</Text></View>}>
  <ContextMenuItem onSelect={() => {}}>
    <Text>Rename</Text>
  </ContextMenuItem>
  <ContextMenuSeparator />
  <ContextMenuItem onSelect={() => {}}>
    <Text>Delete</Text>
  </ContextMenuItem>
</ContextMenu>
```

### Disabled root

```tsx
<ContextMenu disabled trigger={<View><Text>No menu</Text></View>}>
  <ContextMenuItem onSelect={() => {}}>
    <Text>Hidden while disabled</Text>
  </ContextMenuItem>
</ContextMenu>
```

## API

**`ContextMenu`**

| Prop           | Type                                                 | Notes           |
| -------------- | ---------------------------------------------------- | --------------- |
| `open`         | `boolean \| null`                                    | Controlled open |
| `disabled`     | `boolean`                                            |                 |
| `trigger`      | `JSX.Element`                                        | Host surface    |
| `children`     | `JSX.Element`                                        | Menu body       |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` |                 |

**`ContextMenuItem` / `ContextMenuSeparator` / `ContextMenuSub`** — same props as [Dropdown Menu](./dropdown-menu) counterparts (`DropdownMenuItem` / `Separator` / `Sub`).

## Differences

| Topic       | shadcn                                                         | This package                                                              |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Base name   | Radix Context Menu                                             | wraps nsh `ContextMenu` (element `menu`); shares menu chrome with dropdown|
| Trigger     | `ContextMenuTrigger` as a child in the tree                    | `trigger` prop on the root                                                |
| Parts       | Content / Label / Shortcut / CheckboxItem / RadioItem / …      | re-exports dropdown `Item` / `Separator` / `Sub` as `ContextMenu*`        |
| Check state | separate checkbox / radio item components                      | `checked` on `ContextMenuItem` (via dropdown item)                        |
| Presentation| Radix portal + content chrome                                  | nsh ContextMenu + fixed popup/backdrop styles from the wrapper            |

## Not forwarded

From `nsh/base` ContextMenu: `offset` (fixed to `4`), `popupStyle` / `backdropStyle`. Item chrome matches dropdown-menu (see [Dropdown Menu — Not forwarded](./dropdown-menu#not-forwarded)).
