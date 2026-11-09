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

## Differences

| Topic         | shadcn                     | This package                |
| ------------- | -------------------------- | --------------------------- |
| Input / filter | ComboboxInput, chips parts | base filters as you type (`triggerButton` + `inputStyle`); no `searchable` flag |
| Item body      | JSX                        | string label → base `items` / composition `ComboboxItem` |

## Not forwarded

Popup / list / `renderItem` chrome locked in the wrapper.
