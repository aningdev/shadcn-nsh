---
layout: ../../../layouts/Docs.astro
title: Combobox
description: Styled combobox wrapping nsh/base Combobox.
component: true
demo: combobox
demoHeight: 400
---

Styled searchable picker on `nsh/base` Combobox. Pass options as `items[]` — search defaults on; popup offset and list chrome are fixed.

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

## Examples

### Controlled value

```tsx
const [value, setValue] = createSignal<string[]>([]);

<Combobox
  value={value()}
  onChange={(e) => setValue(e.value)}
  items={[
    { value: "apple", title: "Apple" },
    { value: "banana", title: "Banana" },
  ]}
  placeholder="Choose fruit…"
/>;
```

### Multiple

```tsx
<Combobox
  multiple
  items={[
    { value: "apple", title: "Apple" },
    { value: "orange", title: "Orange" },
  ]}
  onChange={(e) => console.log(e.value)}
/>;
```

### Without search

```tsx
<Combobox
  searchable={false}
  items={[{ value: "a", title: "Alpha" }]}
  placeholder="Pick…"
/>;
```

## API

| Prop                 | Type                                                 | Default  | Notes                                      |
| -------------------- | ---------------------------------------------------- | -------- | ------------------------------------------ |
| `items`              | `SelectItem[]`                                       | —        | Required; option list from `nsh/base`      |
| `multiple`           | `boolean`                                            | —        |                                            |
| `value`              | `string[] \| null`                                   | —        | Controlled selection                       |
| `defaultValue`       | `string[]`                                           | —        |                                            |
| `open`               | `boolean \| null`                                    | —        | Controlled open                            |
| `defaultOpen`        | `boolean`                                            | —        |                                            |
| `searchable`         | `boolean`                                            | `true`   | Wrapper default                            |
| `searchPlaceholder`  | `string \| null`                                     | —        |                                            |
| `cleanable`          | `boolean`                                            | —        |                                            |
| `disabled`           | `boolean`                                            | —        |                                            |
| `placeholder`        | `string`                                             | —        | Default trigger label when empty           |
| `accessibilityLabel` | `string \| null`                                     | —        |                                            |
| `trigger`            | `JSX.Element`                                        | —        | Custom trigger; default built-in if omitted|
| `empty`              | `JSX.Element`                                        | —        | Empty-state slot                           |
| `onChange`           | `(event: { value: string[] }) => void`               | —        |                                            |
| `onOpenChange`       | `(event: { open: boolean; reason: string }) => void` | —        |                                            |

`SelectItem` / `SelectItemState` come from `nsh/base` (this wrapper does not re-export them — import from `nsh/base` or from `select`, which re-exports the types).

## Differences

| Topic       | shadcn                                                                      | This package                                                         |
| ----------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Options     | `Combobox` / `ComboboxTrigger` / `ComboboxContent` / `ComboboxItem` tree    | single `Combobox` + required `items: SelectItem[]`                   |
| Value       | often free-text + selected item nodes                                       | `value` / `onChange` use `string[]` (multi-capable)                  |
| Search      | usually a separate `Command` / input composition                            | `searchable` on the same root (defaults `true`)                      |
| Trigger     | compound trigger part                                                       | optional `trigger` prop; wrapper supplies a default                  |
| Presentation| Radix / cmdk portal chrome                                                  | nsh Combobox + fixed popup/list/item chrome from the wrapper         |

## Not forwarded

From `nsh/base` Combobox: `offset` (fixed to `4`), `popupStyle` / `backdropStyle`, `listStyle` / `itemStyle` / `searchStyle` / `focusStyle`, and `renderItem` (highlight / selected check UI). Presentation and list rendering are owned by this wrapper.
