---
layout: ../../../layouts/Docs.astro
title: Pagination
description: Styled pagination wrapping nsh/base Pagination.
component: true
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add pagination
# monorepo:
shadcn-nsh add pagination -c apps/web
```

## Usage

```tsx
import { Pagination } from "@workspace/ui/components/ui/pagination";

<Pagination page={1} totalPages={10} onChange={(e) => console.log(e.page)} />;
```
