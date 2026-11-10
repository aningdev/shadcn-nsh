---
layout: ../../../layouts/Docs.astro
title: Avatar
description: Styled avatar wrapping nsh/base Avatar and AvatarGroup.
component: true
demo: avatar
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns image loading and the accessible name. This package draws a round picture, initials on `muted`, or a small figure when there is no name. Children — a badge — sit on the picture and are not clipped.

## Install

```npx tabs
npx shadcn-nsh@latest add avatar
```

```bunx tabs
bunx shadcn-nsh@latest add avatar
```

```pnx tabs
pnx shadcn-nsh@latest add avatar
```

```yarn tabs
yarn dlx shadcn-nsh@latest add avatar
```

## Usage

```tsx
import { Avatar, AvatarGroup } from "@workspace/ui/components/ui/avatar";

<Avatar name="Ada Lovelace" />

<AvatarGroup limit={3} total={8} accessibilityLabel="8 members">
  <Avatar name="Ada Lovelace" ring style={{ marginLeft: 0 }} />
  <Avatar name="Grace Hopper" ring style={{ marginLeft: -8 }} />
</AvatarGroup>
```

The side is 32 with a pointer and 40 on a touch screen. Pass `size` to both the avatars and the group so the overflow chip matches. Overlap is a negative margin on each avatar after the first (`-size / 4`); the group does not pull its children.

## Picture

`fallbackDelay` waits 300 ms so a fast image does not flash the initials. The picture fades in (300 ms; `motion-reduce` drops it).

```tsx
<Avatar name="Grace Hopper" src={url} />
```

## Ring

`ring` insets the picture by 2 points and paints the card surface in the gap, so stacked pictures do not touch. In light mode `background` and `card` are the same white, so the ring reads as a gap rather than a halo.

## API

### Avatar

| Prop                              | Type                   | Default              | Notes                                                                   |
| --------------------------------- | ---------------------- | -------------------- | ----------------------------------------------------------------------- |
| `src`                             | `string \| ImageAsset` | —                    | Forwarded. The fallback shows while it loads, on error, and without one |
| `name`                            | `string`               | —                    | The accessible name and the initials                                    |
| `size`                            | `number`               | 32 / 40              | Square side. Pointer / touch                                            |
| `ring`                            | `boolean`              | —                    | Card-colored ring. The picture is `size - 4`                            |
| `fallbackDelay`                   | `number`               | `300`                | Forwarded. `0` shows the fallback at once                               |
| `fallback`                        | `JSX.Element`          | initials or a figure | Replaces the initials                                                   |
| `imageClass` / `imageStyle`       |                        | —                    | Class is appended after the round fade                                  |
| `fallbackClass` / `fallbackStyle` |                        | —                    | Merged over the `muted` fill                                            |
| `children`                        | `JSX.Element`          | —                    | Drawn over the picture, not clipped                                     |
| `onStatusChange`                  | `({ status }) => void` | —                    | `"idle" \| "loading" \| "loaded" \| "error"`                            |

`avatarVariants({ size })` returns `{ side, fontSize, color, backgroundColor, borderColor }`. The colors are `foreground`, `muted` and `border`.

### AvatarGroup

| Prop                 | Type          | Default     | Notes                                                       |
| -------------------- | ------------- | ----------- | ----------------------------------------------------------- |
| `limit`              | `number`      | `3`         | How many avatars stay in the tree                           |
| `total`              | `number`      | —           | People the group stands for. The chip shows `total - limit` |
| `size`               | `number`      | 32 / 40     | The overflow chip                                           |
| `overflow`           | `JSX.Element` | `+N` or `…` | Replaces the count. `…` when `total` is omitted             |
| `accessibilityLabel` | `string`      | —           | The group                                                   |

## Differences

| Topic     | Reference (`avatar.ts`)                               | This package                                                                            |
| --------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Identity  | Twelve OkLCH hues, one per name                       | `muted` / `foreground` / `border`. Neutral has no identity scale; no `custom-*` hues    |
| Portraits | GitHub pictures of named maintainers, `AVATAR_BROKEN` | Not part of the component. Pass any `src`. A broken `src` shows the initials            |
| Presence  | `up` / `warn` / `danger` / `faint` dots               | No status scale. Draw a dot as `children` with a theme color                            |
| Size      | The caller passes `side` (demos use 32/40 and 36/44)  | Default 32 / 40                                                                         |
| Group     | The demo sets the overlap and the ring                | `ring` is a prop. Overlap stays a margin, because the group cannot restyle its children |
| Delay     | The demo passes 300                                   | Default 300                                                                             |
| shadcn    | `Avatar` / `AvatarFallback` / `AvatarImage`           | `Avatar` and `AvatarGroup`, matching `nsh/base`. No separate Image or Fallback export   |

## Not forwarded

None — every `nsh/base` Avatar and AvatarGroup prop passes through. `size` and `ring` are this wrapper's.
