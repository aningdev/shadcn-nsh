---
layout: ../../../layouts/Docs.astro
title: Popover
description: Styled popover wrapping nsh/base Popover.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Popover](https://nsh.dev/elements/popover).

## Install

```sh
shadcn-nsh add popover
# monorepo:
shadcn-nsh add popover -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Popover } from "@workspace/ui/components/ui/popover";
import { Text } from "nsh";

<Popover trigger={<Button onPress={() => {}}>Open</Button>}>
  <Text>Popover content</Text>
</Popover>
```

## Source

Authoring: `packages/ui/popover.tsx`. Registry: `popover` (depends on `theme`).
