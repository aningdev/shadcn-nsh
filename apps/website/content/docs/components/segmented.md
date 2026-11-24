---
title: Segmented
description: A sunk track whose raised thumb springs to the selected segment, or a theme's connected cells.
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

`size` is the scale: `default` is the theme's `height.md` high (28 points with a pointer in the
library's themes, 40 on a touch screen) and `sm` its `height.sm` (24, 32).

Where the theme's `group` is `cells` (the `material` theme's), the list draws connected cells instead: one outline around the row, a divider between the cells, and the chosen cell on the theme's container behind a leading check — 40 points high, 12 of padding, 8 between a cell's parts, an 18-point check, and a capsule at the ends. The numbers are the recipe's (`groupLook(control().group)`), not the list's. `size` and `fill` still size the cells; there is no smaller cell.

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
