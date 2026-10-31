---
layout: ../../../layouts/Docs.astro
title: Progress
description: Styled progress wrapping nsh/base Progress.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Progress](https://nsh.dev/elements/progress).

## Install

```sh
shadcn-nsh add progress
# monorepo:
shadcn-nsh add progress -c apps/web
```

## Usage

```tsx
import { Progress } from "@workspace/ui/components/ui/progress";

<Progress value={60} />
```

## Source

Authoring: `packages/ui/progress.tsx`. Registry: `progress` (depends on `theme`).
