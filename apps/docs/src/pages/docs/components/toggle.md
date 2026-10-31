---
layout: ../../../layouts/Docs.astro
title: Toggle
description: Styled toggle wrapping nsh/base Toggle.
component: true
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add toggle
# monorepo:
shadcn-nsh add toggle -c apps/web
```

## Usage

```tsx
import { Toggle } from "@workspace/ui/components/ui/toggle";
import { Text } from "nsh";

<Toggle pressed onChange={(e) => console.log(e.pressed)}>
  <Text>Bold</Text>
</Toggle>;
```
