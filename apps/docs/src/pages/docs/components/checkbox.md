---
layout: ../../../layouts/Docs.astro
title: Checkbox
description: Styled checkbox wrapping nsh/base Checkbox.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Checkbox](https://nsh.dev/elements/checkbox).

## Install

```sh
shadcn-nsh add checkbox
# monorepo:
shadcn-nsh add checkbox -c apps/web
```

## Usage

```tsx
import { Checkbox } from "@workspace/ui/components/ui/checkbox";
import { Text } from "nsh";

<Checkbox checked onChange={(e) => console.log(e.checked)}>
  <Text>Accept terms</Text>
</Checkbox>
```

## Source

Authoring: `packages/ui/checkbox.tsx`. Registry: `checkbox` (depends on `theme`).
