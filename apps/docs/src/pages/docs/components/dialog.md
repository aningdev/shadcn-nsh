---
layout: ../../../layouts/Docs.astro
title: Dialog
description: Styled dialog wrapping nsh/base Dialog.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Dialog](https://nsh.dev/elements/dialog).

## Install

```sh
shadcn-nsh add dialog
# monorepo:
shadcn-nsh add dialog -c apps/web
```

## Usage

```tsx
import { Dialog } from "@workspace/ui/components/ui/dialog";
import { Text } from "nsh";

<Dialog open onOpenChange={(e) => console.log(e.open)}>
  <Text>Dialog body</Text>
</Dialog>
```

## Source

Authoring: `packages/ui/dialog.tsx`. Registry: `dialog` (depends on `theme`).
