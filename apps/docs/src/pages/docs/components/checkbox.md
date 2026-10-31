---
layout: ../../../layouts/Docs.astro
title: Checkbox
description: Styled checkbox wrapping nsh/base Checkbox.
component: true
demo: checkbox
---

Styled wrapper on `nsh/base`.

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
</Checkbox>;
```
