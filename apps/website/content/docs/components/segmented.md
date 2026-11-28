---
title: Segmented
description: A track of mutually exclusive choices whose thumb springs to the chosen one.
component: true
demo: segmented
---

## Installation

```npm
npx shadcn-nsh@latest add segmented
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Segmented } from "shadcn-nsh/segmented";
```

## Usage

```tsx
import { Segmented, SegmentedItem, SegmentedList } from "@/components/ui/segmented";
```

```tsx
<Segmented defaultValue="list">
  <SegmentedList>
    <SegmentedItem value="list">List</SegmentedItem>
  </SegmentedList>
</Segmented>
```

## Composition

Use the following composition to build a `Segmented`:

```text
Segmented
└── SegmentedList
    └── SegmentedItem
```

## Examples

### Fill / small

`size` is the scale: `default` is the theme's `height.md` high (28 points with a pointer in the
library's themes, 40 on a touch screen) and `sm` its `height.sm` (24, 32).

The track is the theme's `channel` and the thumb its `plate`, both read where they are drawn: a
well holding a raised block. The thumb is always as big as a segment's own box, so the pointer's
hover shade covers exactly the box the chosen block covers. Every theme draws this one form — the
list reads no control dimension, so `apple`'s capsule-in-a-capsule and `material`'s connected
cells are gone; what the native controls look like instead is in the theme's difference table
(`packages/theme/themes/material/README.md` / `packages/theme/themes/apple/README.md`).

```tsx
<SegmentedList size="default" fill>
  …
</SegmentedList>
<SegmentedList size="sm">
  …
</SegmentedList>
```

## API

Uses `segmentedLook`. Composition: `Segmented`, `SegmentedList`, `SegmentedItem`. Every prop of [`nsh/base` Tabs / `Tab`](https://nsh.dev/elements/tabs) passes through on the list and items.

| Part            | Props                                                             | Description                                           |
| --------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| `Segmented`     |                                                                   | Composition, with `SegmentedList` and `SegmentedItem` |
| `SegmentedList` | `size` (`SegmentedSize`, default `"default"`), `fill` (`boolean`) | `size` is `"default"` or `"sm"`                       |
| `SegmentedItem` |                                                                   | Composition, with `Segmented` and `SegmentedList`     |

`SegmentedSize` is `"sm" | "default"`.
