---
layout: ../../../layouts/Docs.astro
title: Select
description: Styled select wrapping nsh/base Select.
component: true
---

Styled select on `nsh/base` Select. Most value/open props pass through; appearance and popup offset are locked by the wrapper.

## Install

```sh
shadcn-nsh add select
# monorepo:
shadcn-nsh add select -c apps/web
```

## Usage

```tsx
import { Select } from "@workspace/ui/components/ui/select";

<Select
  items={[
    { value: "apple", title: "Apple" },
    { value: "orange", title: "Orange" },
  ]}
  placeholder="Fruit"
  onChange={(e) => console.log(e.value)}
/>;
```

## API

| Prop                 | Type                                                 | Notes                   |
| -------------------- | ---------------------------------------------------- | ----------------------- |
| `items`              | `SelectItem[]`                                       | Required                |
| `value`              | `string \| null`                                     |                         |
| `defaultValue`       | `string \| null`                                     |                         |
| `open`               | `boolean \| null`                                    |                         |
| `defaultOpen`        | `boolean`                                            |                         |
| `searchable`         | `boolean`                                            |                         |
| `searchPlaceholder`  | `string \| null`                                     |                         |
| `cleanable`          | `boolean`                                            |                         |
| `disabled`           | `boolean`                                            |                         |
| `placeholder`        | `string`                                             | Default trigger label   |
| `accessibilityLabel` | `string \| null`                                     |                         |
| `trigger`            | `JSX.Element`                                        | Optional custom trigger |
| `empty`              | `JSX.Element`                                        |                         |
| `onChange`           | `(event: { value: string \| null }) => void`         |                         |
| `onOpenChange`       | `(event: { open: boolean; reason: string }) => void` |                         |

<div class="callout">

**Not forwarded:** `offset` (fixed to `4`), `popupStyle` / `backdropStyle` / list & item style hooks, and `renderItem`. Default trigger chrome is provided when `trigger` is omitted.

</div>
