---
layout: ../../../layouts/Docs.astro
title: Radio Group
description: Styled radio group wrapping nsh/base RadioGroup.
component: true
demo: radio-group
---

Styled radio group on `nsh/base` (nsh element `radio`). Exports `RadioGroup` + `Radio`.

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
  <Radio checked onChange={() => {}}>
    <Text>Option A</Text>
  </Radio>
  <Radio onChange={() => {}}>
    <Text>Option B</Text>
  </Radio>
</RadioGroup>;
```

## Composition

```
RadioGroup
└─ Radio*
```

## API

**`RadioGroup`** — `children?`, `style?`

**`Radio`** — `checked?`, `disabled?`, `accessibilityLabel?`, `children?`, `onChange?`
