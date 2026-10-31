---
layout: ../../../layouts/Docs.astro
title: Combobox
description: Styled combobox wrapping nsh/base Combobox.
component: true
---

Styled combobox on `nsh/base` Combobox. Search defaults on; popup offset and list chrome are fixed.

## Install

```sh
shadcn-nsh add combobox
# monorepo:
shadcn-nsh add combobox -c apps/web
```

## Usage

```tsx
import { Combobox } from "@workspace/ui/components/ui/combobox";

<Combobox
  items={[
    { value: "apple", title: "Apple" },
    { value: "orange", title: "Orange" },
  ]}
  placeholder="Choose…"
  onChange={(e) => console.log(e.value)}
/>;
```

## API

| Prop                 | Type                                                 | Notes          |
| -------------------- | ---------------------------------------------------- | -------------- |
| `items`              | `SelectItem[]`                                       | Required       |
| `multiple`           | `boolean`                                            |                |
| `value`              | `string[] \| null`                                   |                |
| `defaultValue`       | `string[]`                                           |                |
| `open`               | `boolean \| null`                                    |                |
| `defaultOpen`        | `boolean`                                            |                |
| `searchable`         | `boolean`                                            | Default `true` |
| `searchPlaceholder`  | `string \| null`                                     |                |
| `cleanable`          | `boolean`                                            |                |
| `disabled`           | `boolean`                                            |                |
| `placeholder`        | `string`                                             |                |
| `accessibilityLabel` | `string \| null`                                     |                |
| `trigger`            | `JSX.Element`                                        |                |
| `empty`              | `JSX.Element`                                        |                |
| `onChange`           | `(event: { value: string[] }) => void`               |                |
| `onOpenChange`       | `(event: { open: boolean; reason: string }) => void` |                |

<div class="callout">

**Not forwarded:** `offset` (fixed to `4`), popup/list/item style hooks, and `renderItem`.

</div>
