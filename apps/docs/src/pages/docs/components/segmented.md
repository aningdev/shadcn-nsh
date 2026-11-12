---
title: Segmented
description: A sunk track whose raised thumb springs to the selected segment.
component: true
demo: segmented
---

## Installation

```sh
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

## Examples

### Fill / small

```tsx
<SegmentedList fill size="small">
  …
</SegmentedList>
```

## API

Uses `segmentedLook`. Composition: `Segmented`, `SegmentedList`, `SegmentedItem`. Every prop of [`nsh/base` Tabs](https://nsh.dev/elements/tabs) / [`Tab`](https://nsh.dev/elements/tab) passes through on the list and items.

| Prop (on `SegmentedList`) | Type                   | Default   |
| ------------------------- | ---------------------- | --------- |
| `size`                    | `"small" \| "regular"` | `regular` |
| `fill`                    | `boolean`              |           |
