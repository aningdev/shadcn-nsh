---
title: Segmented
description: A sunk track whose raised thumb springs to the selected segment.
component: true
demo: segmented
---

## Installation

```npm
npx shadcn-nsh@latest add segmented
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

`size` is the scale: `default` (30 points high with a pointer) or `sm` (24).

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
