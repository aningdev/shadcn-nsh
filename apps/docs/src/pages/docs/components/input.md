---
layout: ../../../layouts/Docs.astro
title: Input
description: Styled text input wrapping nsh/base Input.
component: true
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add input
# monorepo:
shadcn-nsh add input -c apps/web
```

## Usage

```tsx
import { Input } from "@workspace/ui/components/ui/input";

<Input placeholder="Email" onChange={(e) => console.log(e.value)} />;
```
