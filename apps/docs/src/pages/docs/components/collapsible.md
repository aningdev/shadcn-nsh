---
layout: ../../../layouts/Docs.astro
title: Collapsible
description: Styled collapsible wrapping nsh/base Collapsible.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Collapsible](https://nsh.dev/elements/collapsible).

## Install

```sh
shadcn-nsh add collapsible
# monorepo:
shadcn-nsh add collapsible -c apps/web
```

## Usage

```tsx
import { Collapsible } from "@workspace/ui/components/ui/collapsible";
import { Text } from "nsh";

<Collapsible open content={<Text>Hidden until open</Text>}>
  <Text>Trigger</Text>
</Collapsible>
```

## Source

Authoring: `packages/ui/collapsible.tsx`. Registry: `collapsible` (depends on `theme`).
