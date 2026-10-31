---
layout: ../../../layouts/Docs.astro
title: Dropdown Menu
description: Menu with Trigger / Content / Item composition over nsh/base Menu.
component: true
demo: dropdown-menu
demoHeight: 360
---

Action menu. Prefer Trigger + Content; the legacy `trigger` prop still works.

## Install

```sh
shadcn-nsh add dropdown-menu
# monorepo:
shadcn-nsh add dropdown-menu -c apps/web
```

## Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={() => {}}>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

## Composition

```
DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent
    ├── DropdownMenuLabel
    ├── DropdownMenuItem / CheckboxItem
    ├── DropdownMenuSeparator
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent
```

## Examples

### Legacy `trigger` prop

```tsx
<DropdownMenu trigger={<Button onPress={() => {}}>Menu</Button>}>
  <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
</DropdownMenu>
```

## API

Root: `open` / `defaultOpen` / `onOpenChange`. Items: `disabled`, `checked`, `onSelect`, `closeOnSelect`.

## Differences

| Topic       | shadcn                  | This package                               |
| ----------- | ----------------------- | ------------------------------------------ |
| Base export | Radix DropdownMenu      | `nsh/base` `Menu`                          |
| Radio items | `DropdownMenuRadioItem` | use `checked` on Item / CheckboxItem       |
| Sub         | nested Trigger/Content  | same facade; maps to `Submenu` + `trigger` |

## Not forwarded

Popup / backdrop style overrides stay in the wrapper.
