---
layout: ../../../layouts/Docs.astro
title: Avatar
description: Styled avatar wrapping nsh/base Avatar.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Avatar](https://nsh.dev/elements/avatar).

## Install

```sh
shadcn-nsh add avatar
# monorepo:
shadcn-nsh add avatar -c apps/web
```

## Usage

```tsx
import { Avatar } from "@workspace/ui/components/ui/avatar";

<Avatar name="Ada Lovelace" />
```

## Source

Authoring: `packages/ui/avatar.tsx`. Registry: `avatar` (depends on `theme`).
