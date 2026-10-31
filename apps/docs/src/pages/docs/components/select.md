---
layout: ../../../layouts/Docs.astro
title: Select
description: Styled select wrapping nsh/base Select.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Select](https://nsh.dev/elements/select).

## Install

```sh
shadcn-nsh add select
# monorepo:
shadcn-nsh add select -c apps/web
```

## Usage

```tsx
import { Select } from "@workspace/ui/components/ui/select";

<Select
  items={[
    { value: "apple", title: "Apple" },
    { value: "orange", title: "Orange" },
  ]}
  placeholder="Fruit"
  onChange={(e) => console.log(e.value)}
/>
```

## Source

Authoring: `packages/ui/select.tsx`. Registry: `select` (depends on `theme`).
