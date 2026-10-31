---
layout: ../../../layouts/Docs.astro
title: Dropdown Menu
description: Styled menu wrapping nsh/base Menu.
component: true
demo: dropdown-menu
demoHeight: 400
---

Styled menu on `nsh/base` `Menu` (docs slug `dropdown-menu`; nsh element `menu`). Exports use shadcn-style `DropdownMenu*` names. Pass the open control via the `trigger` prop — not a `DialogTrigger`-style child tree.

## Install

```sh
shadcn-nsh add dropdown-menu
# monorepo:
shadcn-nsh add dropdown-menu -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
} from "@workspace/ui/components/ui/dropdown-menu";
import { Text } from "nsh";

<DropdownMenu trigger={<Button onPress={() => {}}>Menu</Button>}>
  <DropdownMenuItem onSelect={() => {}}>
    <Text>Profile</Text>
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onSelect={() => {}}>
    <Text>Log out</Text>
  </DropdownMenuItem>
</DropdownMenu>;
```

## Composition

```
DropdownMenu
├─ trigger (prop)
└─ children
   ├─ DropdownMenuItem
   ├─ DropdownMenuSeparator
   └─ DropdownMenuSub
      ├─ trigger (prop)
      └─ …items
```

`DropdownMenuTrigger` is a naming alias that returns its `children` — pass the real host via the `trigger` prop on `DropdownMenu` / `DropdownMenuSub`.

## Examples

### With separator

```tsx
<DropdownMenu trigger={<Button onPress={() => {}}>Menu</Button>}>
  <DropdownMenuItem onSelect={() => {}}>
    <Text>Profile</Text>
  </DropdownMenuItem>
  <DropdownMenuItem onSelect={() => {}}>
    <Text>Settings</Text>
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onSelect={() => {}}>
    <Text>Log out</Text>
  </DropdownMenuItem>
</DropdownMenu>
```

### Checked item

```tsx
<DropdownMenu trigger={<Button onPress={() => {}}>View</Button>}>
  <DropdownMenuItem checked onSelect={() => {}}>
    <Text>Show sidebar</Text>
  </DropdownMenuItem>
</DropdownMenu>
```

### Submenu

```tsx
<DropdownMenu trigger={<Button onPress={() => {}}>More</Button>}>
  <DropdownMenuSub trigger={<Text>Share</Text>}>
    <DropdownMenuItem onSelect={() => {}}>
      <Text>Copy link</Text>
    </DropdownMenuItem>
  </DropdownMenuSub>
</DropdownMenu>
```

## API

**`DropdownMenu`**

| Prop           | Type                                                 | Notes           |
| -------------- | ---------------------------------------------------- | --------------- |
| `open`         | `boolean \| null`                                    | Controlled open |
| `defaultOpen`  | `boolean`                                            |                 |
| `trigger`      | `JSX.Element`                                        | Open control    |
| `children`     | `JSX.Element`                                        | Menu body       |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` |                 |

**`DropdownMenuItem`**

| Prop                 | Type              | Notes                    |
| -------------------- | ----------------- | ------------------------ |
| `disabled`           | `boolean`         |                          |
| `checked`            | `boolean \| null` | Shows check indicator    |
| `closeOnSelect`      | `boolean`         |                          |
| `accessibilityLabel` | `string \| null`  |                          |
| `children`           | `JSX.Element`     |                          |
| `onSelect`           | `() => void`      |                          |

**`DropdownMenuSeparator`** — no props

**`DropdownMenuSub`** — `trigger?`, `children?`

**`DropdownMenuTrigger`** — `children?` (pass-through alias)

## Differences

| Topic       | shadcn                                                         | This package                                                           |
| ----------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Base name   | `DropdownMenu` on Radix Dropdown Menu                          | wraps nsh `Menu` (element `menu`); docs slug stays `dropdown-menu`     |
| Trigger     | `DropdownMenuTrigger` as a child in the tree                   | `trigger` prop on the root (and on `DropdownMenuSub`)                  |
| Parts       | Content / Label / Shortcut / CheckboxItem / RadioItem / …      | `Item` / `Separator` / `Sub` (+ pass-through `DropdownMenuTrigger`)    |
| Check state | separate checkbox / radio item components                      | `checked` on `DropdownMenuItem`                                        |
| Presentation| Radix portal + content chrome                                  | nsh Menu + fixed popup/backdrop/item styles from the wrapper           |

## Not forwarded

From `nsh/base` Menu / MenuItem / Submenu: root `offset` (fixed to `4`), `popupStyle` / `backdropStyle`; item `focusStyle` / `style` / `hoverStyle` / `indicator` / `indicatorStyle`; separator `style`; submenu `style` (`minWidth`). Popup and item chrome are owned by this wrapper.
