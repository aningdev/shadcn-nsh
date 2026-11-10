---
layout: ../../../layouts/Docs.astro
title: Select
description: Styled select with Trigger / Content / Item composition; items still drive nsh/base under the hood.
component: true
demo: select
demoHeight: 360
---

Single-value select. Composition parts collect into `nsh/base` `items` + `trigger` slots while keeping a shadcn-shaped Usage tree.

## Install

```sh
shadcn-nsh add select
# monorepo:
shadcn-nsh add select -c apps/web
```

## Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/ui/select";

<Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>;
```

## Composition

```
Select
├── SelectTrigger
│   └── SelectValue
└── SelectContent
    ├── SelectGroup
    │   ├── SelectLabel
    │   └── SelectItem*
    └── SelectItem*
```

## Examples

### Searchable

```tsx
<Select searchable value={fruit()} onChange={({ value }) => fruit.set(value)}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>
```

## API

### `Select`

| Prop                                    | Type                                                           | Notes                                                    |
| --------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `value` / `defaultValue`                | `string \| null`                                               | Uncontrolled updates the trigger; pass `value` to own it |
| `open` / `defaultOpen`                  | `boolean`                                                      |                                                          |
| `searchable` / `cleanable` / `disabled` | `boolean`                                                      | The prop is `cleanable`, matching base                   |
| `invalid`                               | `boolean`                                                      | Danger edge. Not a base prop                             |
| `placeholder`                           | `string`                                                       | Shown by `SelectValue` while nothing is chosen           |
| `popupClass` / `popupStyle`             | class / style                                                  | Merged over the shared popup (or the touch sheet)        |
| `backdropClass` / `backdropStyle`       | class / style                                                  | Touch sheet only                                         |
| `onOpenChange`                          | `(event: { open: boolean; reason: OpenChangeReason }) => void` |                                                          |
| `onChange`                              | `(event: { value: string \| null }) => void`                   | `null` when the clear button clears it                   |

`SelectItem` children must be **strings** (they become `title`). `SelectTrigger` accepts `class`, `style`, the state styles, and `testID`.

## Differences

| Topic                     | shadcn                      | This package                                                                                         |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| List model                | Item children are real rows | Items register into base `items[]`; the row is drawn once, so highlight and check are `itemClass`    |
| Viewport / scroll buttons | Radix Content parts         | Owned by nsh Select: a popup on a pointer, a bottom sheet on touch                                   |
| Item body                 | arbitrary JSX               | string label only                                                                                    |
| Invalid                   | form-level                  | `invalid` on the root paints the danger edge                                                         |
| Separator                 | `SelectSeparator` is a row  | The part is kept, but base has no row separator; use `SelectGroup`                                   |
| Open / close motion       | Radix animation             | Base exposes `popupClass` / `popupStyle` only. The chevron springs; the sheet uses base's own motion |

## Not forwarded

`placement`, `align`, `offset` (4) and `margin` (8) stay at the reference values. `listStyle` caps a pointer list at 240; the touch sheet caps itself at 70% of the window. `renderItem`, `itemClass` and `searchStyle` stay in the wrapper.
