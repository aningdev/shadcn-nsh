---
layout: ../../../layouts/Docs.astro
title: Toggle
description: Styled toggle wrapping nsh/base Toggle.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Toggle](https://nsh.dev/elements/toggle).

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

<Toggle pressed onChange={(e) => console.log(e.pressed)}><Text>Bold</Text></Toggle>
```

## Source

Authoring: `packages/ui/toggle.tsx`. Registry: `toggle` (depends on `theme`).
