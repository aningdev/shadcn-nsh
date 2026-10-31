---
layout: ../../../layouts/Docs.astro
title: Link
description: Styled link wrapping nsh/base Link.
component: true
demo: link
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add link
# monorepo:
shadcn-nsh add link -c apps/web
```

## Usage

```tsx
import { Link } from "@workspace/ui/components/ui/link";
import { Text } from "nsh";

<Link href="https://nsh.dev" onPress={() => {}}>
  <Text>Open nsh.dev</Text>
</Link>;
```
