---
layout: ../../../layouts/Docs.astro
title: Toggle Group
description: Styled toggle group wrapping nsh/base ToggleGroup.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Toggle Group](https://nsh.dev/elements/toggle).

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
  <Toggle pressed onChange={() => {}}><Text>Left</Text></Toggle>
  <Toggle onChange={() => {}}><Text>Center</Text></Toggle>
  <Toggle onChange={() => {}}><Text>Right</Text></Toggle>
</ToggleGroup>
```

## Source

Authoring: `packages/ui/toggle-group.tsx`. Registry: `toggle-group` (depends on `theme`).
