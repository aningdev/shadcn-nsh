---
layout: ../../../layouts/Docs.astro
title: Tooltip
description: Styled tooltip wrapping nsh/base Tooltip.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Tooltip](https://nsh.dev/elements/tooltip).

## Install

```sh
shadcn-nsh add tooltip
# monorepo:
shadcn-nsh add tooltip -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Tooltip } from "@workspace/ui/components/ui/tooltip";
import { Text } from "nsh";

<Button tooltip={<Tooltip><Text>Add item</Text></Tooltip>} onPress={() => {}}>
  Add
</Button>
```

## Source

Authoring: `packages/ui/tooltip.tsx`. Registry: `tooltip` (depends on `theme`).
