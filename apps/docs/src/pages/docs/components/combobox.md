---
layout: ../../../layouts/Docs.astro
title: Combobox
description: Styled combobox wrapping nsh/base Combobox.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Combobox](https://nsh.dev/elements/combobox).

## Install

```sh
shadcn-nsh add combobox
# monorepo:
shadcn-nsh add combobox -c apps/web
```

## Usage

```tsx
import { Combobox } from "@workspace/ui/components/ui/combobox";

<Combobox
  items={[
    { value: "apple", title: "Apple" },
    { value: "orange", title: "Orange" },
  ]}
  placeholder="Choose…"
  onChange={(e) => console.log(e.value)}
/>
```

## Source

Authoring: `packages/ui/combobox.tsx`. Registry: `combobox` (depends on `theme`).
