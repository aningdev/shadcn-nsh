---
layout: ../../../layouts/Docs.astro
title: Progress
description: Styled progress wrapping nsh/base Progress.
component: true
demo: progress
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add progress
# monorepo:
shadcn-nsh add progress -c apps/web
```

## Usage

```tsx
import { Progress } from "@workspace/ui/components/ui/progress";

<Progress value={60} />;
```
