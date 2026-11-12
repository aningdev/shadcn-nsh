---
title: Avatar
description: A round picture or name-colored initials on the identity ring.
component: true
demo: avatar
---

## Installation

```sh
npx shadcn-nsh@latest add avatar
```

## Usage

```tsx
import { Avatar, avatarPortrait } from "@/components/ui/avatar";
```

```tsx
<Avatar name="Jason Lee" src={avatarPortrait("Jason Lee")} style={{ width: 36, height: 36 }} />
```

## Examples

### Initials

`name` picks a stable hue via `avatarIdentity`.

```tsx
<Avatar name="Alan Turing" style={{ width: 40, height: 40 }} />
```

### Maintainer portraits

```tsx
import { avatarPortrait, MAINTAINERS } from "@/components/ui/avatar";
```

### Broken image

```tsx
import { AVATAR_BROKEN } from "@/components/ui/avatar";
<Avatar name="Barbara Liskov" src={AVATAR_BROKEN} />;
```

### Group

Overlap and `limit` use `nsh/base` `AvatarGroup`; size each `Avatar` the same.

## API

Uses `avatarIdentity`, `avatarPortrait`, and `avatarHue`. Every prop of [`nsh/base` Avatar](https://nsh.dev/elements/avatar) passes through.

| Prop   | Type     | Notes                    |
| ------ | -------- | ------------------------ |
| `name` | `string` | Initials hue on fallback |
| `src`  | `string` | Picture URL              |
