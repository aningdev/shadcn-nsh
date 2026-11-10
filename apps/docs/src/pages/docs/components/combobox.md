---
layout: ../../../layouts/Docs.astro
title: Combobox
description: Searchable multi/single select with Trigger / Content / Item composition.
component: true
demo: combobox
demoHeight: 360
---

Combobox over `nsh/base` Combobox. Value is always `string[]`; set `multiple` for multi-select.

## Install

```sh
shadcn-nsh add combobox
```

## Usage

```tsx
import {
  Combobox,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxContent,
  ComboboxItem,
} from "@workspace/ui/components/ui/combobox";

<Combobox multiple value={tags()} onChange={({ value }) => tags.set(value)}>
  <ComboboxTrigger>
    <ComboboxValue placeholder="Frameworks" />
  </ComboboxTrigger>
  <ComboboxContent>
    <ComboboxItem value="react">React</ComboboxItem>
    <ComboboxItem value="vue">Vue</ComboboxItem>
  </ComboboxContent>
</Combobox>;
```

## Composition

```
Combobox
├── ComboboxTrigger
│   └── ComboboxValue
└── ComboboxContent
    ├── ComboboxEmpty
    └── ComboboxItem*
```

## API

### `Combobox`

| Prop                              | Type                                                           | Notes                                                            |
| --------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `multiple`                        | `boolean`                                                      | A choice toggles and the list stays open                         |
| `value` / `defaultValue`          | `string[]`                                                     | Uncontrolled updates the field; pass `value` to own it           |
| `open` / `defaultOpen`            | `boolean`                                                      |                                                                  |
| `query`                           | `string`                                                       | What the input holds. `empty` shows while nothing matches        |
| `cleanable` / `disabled`          | `boolean`                                                      | The prop is `cleanable`, matching base                           |
| `invalid`                         | `boolean`                                                      | Danger edge. Not a base prop                                     |
| `placeholder`                     | `string`                                                       | Empty prompt. A chosen value replaces it, in the field's own ink |
| `footer` / `footerStyle`          | element / style                                                | Below the rows, under a hairline                                 |
| `class` / `style`                 | class / style                                                  | The well. `ComboboxTrigger` styles the chevron button            |
| `popupClass` / `popupStyle`       | class / style                                                  | Merged over the shared popup (or the touch sheet)                |
| `backdropClass` / `backdropStyle` | class / style                                                  | Touch sheet only                                                 |
| `onOpenChange`                    | `(event: { open: boolean; reason: OpenChangeReason }) => void` |                                                                  |
| `onChange`                        | `(event: { value: string[] }) => void`                         |                                                                  |

`ComboboxItem` children must be **strings**. `ComboboxValue` only sets the empty prompt; the input shows the chosen titles.

## Differences

| Topic          | shadcn                     | This package                                                                                               |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Input / filter | ComboboxInput, chips parts | The base input filters as you type. The trigger is the chevron at the end, not a second label              |
| Item body      | JSX                        | string label → base `items` / composition `ComboboxItem`                                                   |
| Edge           | data-state classes         | `focus-within` on the class. An inline border would cover it, and base has no `focusWithinStyle`           |
| Invalid        | form-level                 | `invalid` on the root                                                                                      |
| Open / close   | Radix animation            | Base exposes `popupClass` / `popupStyle` only. The chevron springs; the touch sheet uses base's own motion |

## Not forwarded

`placement`, `align`, `offset` (4) and `margin` (8) stay at the reference values. `listStyle` caps a pointer list at 240. `renderItem`, `itemClass` and `inputStyle` stay in the wrapper. Chips (`prefix`) are not a part yet.
