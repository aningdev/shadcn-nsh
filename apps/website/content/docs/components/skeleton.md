---
title: Skeleton
description: The shape of content that is still coming.
component: true
demo: skeleton
---

## Installation

```npm
npx shadcn-nsh@latest add skeleton
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Skeleton } from "shadcn-nsh/skeleton";
```

## Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton";
```

```tsx
<Skeleton style={{ width: 250, height: 14 }} />
```

## Examples

### A line, an avatar, a button

A skeleton has no size of its own: the box is the caller's `style`. A line is as tall as the type
it will hold and as wide as that text runs; an avatar or an icon is a square, round with
`borderRadius` half its side.

```tsx
<Skeleton style={{ width: 250, height: 14 }} />
<Skeleton style={{ width: 48, height: 48, borderRadius: 24 }} />
```

### A block of content

Placeholders keep the layout of what is coming: a column with a `gap` where the rows will be, and
a row for the parts that sit side by side.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Skeleton style={{ width: 48, height: 48, borderRadius: 24 }} />
  <View style={{ gap: 8 }}>
    <Skeleton style={{ width: 250, height: 14 }} />
    <Skeleton style={{ width: 200, height: 14 }} />
  </View>
</View>
```

### Motion

The block breathes (an endless motion). When the user asks for less motion it stays still, and a
terminal shows it still: nothing to play there.

```tsx
{
  /* Nothing to turn off: the skeleton follows the system's reduce-motion setting. */
}
<Skeleton style={{ width: 200, height: 14 }} />;
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through (`style`, `accessibilityLabel`, …); `style` goes over the look's.

| Part       | Props       | Description                                                           |
| ---------- | ----------- | --------------------------------------------------------------------- |
| `Skeleton` | `ViewProps` | The block; its box, corners and breathing are the look's and `style`. |

There is no axis: a skeleton is one look — the theme's `accent` fill, the theme's control corners,
the breathing. The box, including a radius of the app's own, is the caller's `style`.
