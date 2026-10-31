---
layout: ../../../layouts/Docs.astro
title: Toggle Group
description: Styled toggle group wrapping nsh/base ToggleGroup.
component: true
demo: toggle-group
---

Styled toggle group on `nsh/base` (nsh element `toggle`). Re-exports `Toggle` for convenience.

## Install

```sh
shadcn-nsh add toggle-group
# monorepo:
shadcn-nsh add toggle-group -c apps/web
```

## Usage

```tsx
import { Toggle } from "@workspace/ui/components/ui/toggle";
import { ToggleGroup } from "@workspace/ui/components/ui/toggle-group";
import { Text } from "nsh";

<ToggleGroup>
  <Toggle pressed onChange={() => {}}>
    <Text>Left</Text>
  </Toggle>
  <Toggle onChange={() => {}}>
    <Text>Center</Text>
  </Toggle>
  <Toggle onChange={() => {}}>
    <Text>Right</Text>
  </Toggle>
</ToggleGroup>;
```

## Composition

```
ToggleGroup
└─ Toggle*
```

## API

**`ToggleGroup`** — `disabled?`, `children?`

Use [Toggle](./toggle) props on each child. Group value orchestration from base is not wrapped beyond layout chrome — compose pressed state on each `Toggle`.
