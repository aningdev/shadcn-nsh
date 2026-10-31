---
layout: ../../../layouts/Docs.astro
title: Dropdown Menu
description: Styled menu wrapping nsh/base Menu.
component: true
demo: dropdown-menu
demoHeight: 400
---

Styled menu on `nsh/base` `Menu` (docs slug `dropdown-menu`; nsh element `menu`). Exports use shadcn-style `DropdownMenu*` names.

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
├─ DropdownMenuItem
├─ DropdownMenuSeparator
└─ DropdownMenuSub
   ├─ trigger (prop)
   └─ …items
```

`DropdownMenuTrigger` is a naming alias that returns its children — pass the real trigger via the `trigger` prop on `DropdownMenu` / `DropdownMenuSub`.

## API

**`DropdownMenu`**

| Prop           | Type                                                 | Notes |
| -------------- | ---------------------------------------------------- | ----- |
| `open`         | `boolean \| null`                                    |       |
| `defaultOpen`  | `boolean`                                            |       |
| `trigger`      | `JSX.Element`                                        |       |
| `children`     | `JSX.Element`                                        |       |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` |       |

**`DropdownMenuItem`** — `disabled?`, `checked?`, `closeOnSelect?`, `accessibilityLabel?`, `children?`, `onSelect?`

**`DropdownMenuSeparator`** — no props

**`DropdownMenuSub`** — `trigger?`, `children?`

<div class="callout">

**Not forwarded:** popup `offset` (fixed to `4`), `popupStyle` / `backdropStyle`, and other menu chrome knobs. Item indicator chrome is owned by the wrapper.

</div>
