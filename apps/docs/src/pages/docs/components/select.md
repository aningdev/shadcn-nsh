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

### Data `items` (no parts)

Still supported when you already have an array — skips the composition registry:

```tsx
<Select
  value={fruit()}
  onChange={({ value }) => fruit.set(value)}
  items={[
    { value: "apple", title: "Apple" },
    { value: "banana", title: "Banana" },
  ]}
/>
```

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

| Prop                                    | Type                                         | Notes                                               |
| --------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `value` / `defaultValue`                | `string \| null`                             |                                                     |
| `items`                                 | `SelectItem[]`                               | Data mode; when set, composition parts are not used |
| `searchable` / `cleanable` / `disabled` | `boolean`                                    |                                                     |
| `onChange`                              | `(event: { value: string \| null }) => void` |                                                     |

`SelectItem` children must be **strings** (become `title` in the base items model).

## Differences

| Topic                     | shadcn                      | This package                                                               |
| ------------------------- | --------------------------- | -------------------------------------------------------------------------- |
| List model                | Item children are real rows | Items register into base `items[]`; popup rows still use base `renderItem` |
| Viewport / scroll buttons | Radix Content parts         | Owned by nsh Select (desktop popup / phone sheet)                          |
| Item body                 | arbitrary JSX               | string label only in the composition facade                                |

## Not forwarded

Base style slots (`popupStyle`, `listStyle`, `renderItem`, …) stay locked in the wrapper.
