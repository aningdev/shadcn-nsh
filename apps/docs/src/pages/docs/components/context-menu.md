---
layout: ../../../layouts/Docs.astro
title: Context Menu
description: Styled context menu wrapping nsh/base ContextMenu.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Context Menu](https://nsh.dev/elements/menu).

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
} from "@workspace/ui/components/ui/context-menu";
import { Text, View } from "nsh";

<ContextMenu trigger={<View><Text>Right-click me</Text></View>}>
  <ContextMenuItem onSelect={() => {}}><Text>Copy</Text></ContextMenuItem>
</ContextMenu>
```

## Source

Authoring: `packages/ui/context-menu.tsx`. Registry: `context-menu` (depends on `theme`).
