---
layout: ../../../layouts/Docs.astro
title: Sheet
description: Styled sheet wrapping nsh/base Sheet.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Sheet](https://nsh.dev/elements/sheet).

## Install

```sh
shadcn-nsh add sheet
# monorepo:
shadcn-nsh add sheet -c apps/web
```

## Usage

```tsx
import { Sheet } from "@workspace/ui/components/ui/sheet";
import { Text } from "nsh";

<Sheet open onOpenChange={(e) => console.log(e.open)}>
  <Text>Sheet body</Text>
</Sheet>
```

## Source

Authoring: `packages/ui/sheet.tsx`. Registry: `sheet` (depends on `theme`).
