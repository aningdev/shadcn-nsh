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

`size` is the scale: `default` (30 points high with a pointer) or `sm` (24).

Under a theme whose controls are Material 3 (`controls: "material"`, as the `material` theme sets), the list draws Material 3's connected cells instead: 40 points high, one outline around the row, a divider between the cells, and the chosen cell filled with the theme's secondary-container tint behind a leading check. `size` and `fill` still size the cells; there is no smaller cell.

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
