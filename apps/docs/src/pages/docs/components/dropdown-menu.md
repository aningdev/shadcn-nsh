---
layout: ../../../layouts/Docs.astro
title: Dropdown Menu
description: Styled menu wrapping nsh/base Menu.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Dropdown Menu](https://nsh.dev/elements/menu).

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
} from "@workspace/ui/components/ui/dropdown-menu";
import { Text } from "nsh";

<DropdownMenu trigger={<Button onPress={() => {}}>Menu</Button>}>
  <DropdownMenuItem onSelect={() => {}}><Text>Profile</Text></DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onSelect={() => {}}><Text>Log out</Text></DropdownMenuItem>
</DropdownMenu>
```

## Source

Authoring: `packages/ui/dropdown-menu.tsx`. Registry: `dropdown-menu` (depends on `theme`).
