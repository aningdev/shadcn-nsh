---
layout: ../../../layouts/Docs.astro
title: Avatar
description: Styled avatar wrapping nsh/base Avatar.
component: true
demo: avatar
---

Styled avatar on `nsh/base` Avatar. Defaults to initials from `name`; pair with `AvatarGroup` for overlapping stacks and overflow.

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
<AvatarGroup limit={3} total={4}>
  <Avatar name="Ada Lovelace" />
  <Avatar name="Grace Hopper" />
  <Avatar name="Alan Turing" />
</AvatarGroup>
```

## Composition

```
AvatarGroup
├─ Avatar*
└─ overflow (default "+N" / "…")
```

## Examples

### Size

```tsx
<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" size={32} />
<Avatar name="Alan Turing" size={48} />
```

### Image + fallback

```tsx
<Avatar
  src="https://example.com/ada.jpg"
  name="Ada Lovelace"
  onStatusChange={(e) => console.log(e.status)}
/>
```

### Custom overflow

```tsx
<AvatarGroup limit={2} total={5} overflow={<Text>+more</Text>}>
  <Avatar name="Ada Lovelace" />
  <Avatar name="Grace Hopper" />
</AvatarGroup>
```

## API

### `Avatar`

| Prop                 | Type                                           | Default | Notes                                      |
| -------------------- | ---------------------------------------------- | ------- | ------------------------------------------ |
| `src`                | `string \| ImageAsset \| null`                 | —       | Image source                               |
| `name`               | `string \| null`                               | —       | Used for initials fallback and a11y        |
| `size`               | `number`                                       | `40`    | Wrapper-only; maps to width/height/radius  |
| `accessibilityLabel` | `string \| null`                               | —       |                                            |
| `fallbackDelay`      | `number`                                       | —       |                                            |
| `fallback`           | `JSX.Element`                                  | initials from `name` | Overrides default initials       |
| `children`           | `JSX.Element`                                  | —       |                                            |
| `onStatusChange`     | `(event: { status: string }) => void`          | —       |                                            |

### `AvatarGroup`

| Prop                 | Type              | Default | Notes                                      |
| -------------------- | ----------------- | ------- | ------------------------------------------ |
| `limit`              | `number`          | —       | Visible avatars before overflow            |
| `total`              | `number \| null`  | —       | Used with `limit` for default `+N` label   |
| `accessibilityLabel` | `string \| null`  | —       |                                            |
| `overflow`           | `JSX.Element`     | `+N` / `…` | Custom overflow content                 |
| `children`           | `JSX.Element`     | —       | `Avatar` children                          |

## Differences

| Topic      | shadcn                                         | This package                                              |
| ---------- | ---------------------------------------------- | --------------------------------------------------------- |
| Parts      | `Avatar` / `AvatarImage` / `AvatarFallback`    | single `Avatar` (+ optional `AvatarGroup`)                |
| Fallback   | compose `AvatarFallback`                       | default initials from `name`; override with `fallback`    |
| Size       | often via `className` / CSS                    | `size` number prop                                        |
| Group      | not in core avatar                             | `AvatarGroup` with `limit` / `total` / `overflow`         |

## Not forwarded

From `nsh/base` Avatar / AvatarGroup: style chrome (`style`, `imageStyle`, `fallbackStyle`, `overflowStyle`). The wrapper owns dimensions, muted background, and default initials / overflow text.
