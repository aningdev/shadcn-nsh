---
layout: ../../../layouts/Docs.astro
title: Avatar
description: Styled avatar wrapping nsh/base Avatar.
component: true
---

Styled avatar on `nsh/base` Avatar, with optional `AvatarGroup`.

## Install

```sh
shadcn-nsh add avatar
# monorepo:
shadcn-nsh add avatar -c apps/web
```

## Usage

```tsx
import { Avatar, AvatarGroup } from "@workspace/ui/components/ui/avatar";

<Avatar name="Ada Lovelace" />

<AvatarGroup limit={3} total={5}>
  <Avatar name="Ada" />
  <Avatar name="Grace" />
  <Avatar name="Katherine" />
</AvatarGroup>
```

## Composition

```
Avatar
AvatarGroup
└─ Avatar*
```

## API

**`Avatar`** — `src?`, `name?`, `size?` (default `40`), `accessibilityLabel?`, `fallbackDelay?`, `fallback?`, `children?`, `onStatusChange?`

**`AvatarGroup`** — `limit?`, `total?`, `accessibilityLabel?`, `overflow?`, `children?`
