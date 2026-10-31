---
layout: ../../../layouts/Docs.astro
title: Toast
description: Styled toast wrapping nsh/base Toast.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Toast](https://nsh.dev/elements/toast).

## Install

```sh
shadcn-nsh add toast
# monorepo:
shadcn-nsh add toast -c apps/web
```

## Usage

```tsx
import { Toast, ToastStack } from "@workspace/ui/components/ui/toast";

<ToastStack>
  <Toast title="Saved" description="Your changes were saved." />
</ToastStack>
```

## Source

Authoring: `packages/ui/toast.tsx`. Registry: `toast` (depends on `theme`).
