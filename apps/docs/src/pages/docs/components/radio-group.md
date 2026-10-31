---
layout: ../../../layouts/Docs.astro
title: Radio Group
description: Styled radio group wrapping nsh/base RadioGroup.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Radio Group](https://nsh.dev/elements/radio).

## Install

```sh
shadcn-nsh add radio-group
# monorepo:
shadcn-nsh add radio-group -c apps/web
```

## Usage

```tsx
import { Radio, RadioGroup } from "@workspace/ui/components/ui/radio-group";
import { Text } from "nsh";

<RadioGroup>
  <Radio checked onChange={() => {}}><Text>Option A</Text></Radio>
  <Radio onChange={() => {}}><Text>Option B</Text></Radio>
</RadioGroup>
```

## Source

Authoring: `packages/ui/radio-group.tsx`. Registry: `radio-group` (depends on `theme`).
