---
layout: ../../../layouts/Docs.astro
title: Number Input
description: Styled number input wrapping nsh/base NumberInput.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Number Input](https://nsh.dev/elements/number-input).

## Install

```sh
shadcn-nsh add number-input
# monorepo:
shadcn-nsh add number-input -c apps/web
```

## Usage

```tsx
import { NumberInput } from "@workspace/ui/components/ui/number-input";

<NumberInput defaultValue={1} min={0} max={99} onChange={(e) => console.log(e.value)} />
```

## Source

Authoring: `packages/ui/number-input.tsx`. Registry: `number-input` (depends on `theme`).
