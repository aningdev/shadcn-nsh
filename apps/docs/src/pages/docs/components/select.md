---
layout: ../../../layouts/Docs.astro
title: Select
description: Styled select wrapping nsh/base Select.
component: true
demo: select
demoHeight: 360
---

Styled single-value picker on `nsh/base` Select. Pass options as `items[]` — appearance, popup offset, and list chrome are locked by the wrapper.

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

## Examples

### Controlled value

```tsx
const [fruit, setFruit] = createSignal<string | null>("apple");

<Select
  value={fruit()}
  onChange={(e) => setFruit(e.value)}
  items={[
    { value: "apple", title: "Apple" },
    { value: "banana", title: "Banana" },
    { value: "orange", title: "Orange" },
  ]}
/>;
```

### Searchable

```tsx
<Select
  searchable
  searchPlaceholder="Filter…"
  items={[
    { value: "apple", title: "Apple" },
    { value: "apricot", title: "Apricot" },
  ]}
  placeholder="Fruit"
/>;
```

### Custom trigger

```tsx
import { Text, View } from "nsh";

<Select
  items={[{ value: "a", title: "Alpha" }]}
  trigger={
    <View>
      <Text>Open select</Text>
    </View>
  }
/>;
```

## API

Re-exports types `SelectItem` and `SelectItemState` from `nsh/base`.

| Prop                 | Type                                                 | Default | Notes                                       |
| -------------------- | ---------------------------------------------------- | ------- | ------------------------------------------- |
| `items`              | `SelectItem[]`                                       | —       | Required; option list from `nsh/base`       |
| `value`              | `string \| null`                                     | —       | Controlled selection                        |
| `defaultValue`       | `string \| null`                                     | —       |                                             |
| `open`               | `boolean \| null`                                    | —       | Controlled open                             |
| `defaultOpen`        | `boolean`                                            | —       |                                             |
| `searchable`         | `boolean`                                            | —       |                                             |
| `searchPlaceholder`  | `string \| null`                                     | —       |                                             |
| `cleanable`          | `boolean`                                            | —       |                                             |
| `disabled`           | `boolean`                                            | —       |                                             |
| `placeholder`        | `string`                                             | —       | Default trigger label when empty            |
| `accessibilityLabel` | `string \| null`                                     | —       |                                             |
| `trigger`            | `JSX.Element`                                        | —       | Custom trigger; default built-in if omitted |
| `empty`              | `JSX.Element`                                        | —       | Empty-state slot                            |
| `onChange`           | `(event: { value: string \| null }) => void`         | —       |                                             |
| `onOpenChange`       | `(event: { open: boolean; reason: string }) => void` | —       |                                             |

## Differences

| Topic       | shadcn                                                                      | This package                                                      |
| ----------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Options     | `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` / `SelectValue` | single `Select` + required `items: SelectItem[]`                  |
| Value       | item nodes inside content                                                   | `value` / `onChange` use `string \| null`                         |
| Search      | not built into core Select                                                  | optional `searchable` / `searchPlaceholder` on the same root      |
| Trigger     | `SelectTrigger` + `SelectValue` parts                                       | optional `trigger` prop; wrapper supplies a default               |
| Presentation| Radix portal + content chrome                                               | nsh Select + fixed popup/list/item chrome from the wrapper        |

Do not invent a Radix-style `SelectItem` children tree in app code — feed options through `items`.

## Not forwarded

From `nsh/base` Select: `offset` (fixed to `4`), `popupStyle` / `backdropStyle`, `listStyle` / `itemStyle` / `groupStyle` / `searchStyle` / `focusStyle`, and `renderItem`. Presentation and list rendering are owned by this wrapper.
