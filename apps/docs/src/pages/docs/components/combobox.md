---
layout: ../../../layouts/Docs.astro
title: Combobox
description: A searchable field with a list of choices, on the shared listbox look.
component: true
demo: combobox
---

## Installation

```sh
npx shadcn-nsh@latest add combobox
```

## Usage

```tsx
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
```

```tsx
<Combobox value={value} onChange={({ value }) => setValue(value)}>
  <ComboboxTrigger />
  <ComboboxContent>
    <ComboboxItem value="react">React</ComboboxItem>
    <ComboboxItem value="vue">Vue</ComboboxItem>
  </ComboboxContent>
</Combobox>
```

## Examples

### Several values

`multiple` toggles an item and keeps the list open; the field shows the chosen titles.

```tsx
<Combobox multiple value={tags} onChange={({ value }) => setTags(value)}>
  …
</Combobox>
```

### Groups and an empty list

```tsx
<ComboboxContent>
  <ComboboxGroup>
    <ComboboxLabel>Front end</ComboboxLabel>
    <ComboboxItem value="react">React</ComboboxItem>
  </ComboboxGroup>
  <ComboboxEmpty>No matches</ComboboxEmpty>
</ComboboxContent>
```

### A trigger of your own

A string child is a `Button`; anything else is drawn as given.

```tsx
<ComboboxTrigger>
  <Icon icon={ChevronRight} size={14} tint={colors.muted} />
</ComboboxTrigger>
```

### Disabled and clearable

```tsx
<Combobox disabled>…</Combobox>
<Combobox cleanable>…</Combobox>
```

## API

The root owns the open flag and the chosen values; `ComboboxContent` mounts [`nsh/base` Combobox](https://nsh.dev/elements/combobox) and every base prop passes through except those. `comboboxLook`, `listboxProps` and `OptionRow` fill the field, the popup and the rows by default.

| Part                              | Notes                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Combobox`                        | `value` / `defaultValue`, `multiple`, `open` / `defaultOpen`, `disabled`, `cleanable`, `placeholder`, `onChange`, `onOpenChange`, `onOpen`, `onClose`, `onCancel` |
| `ComboboxTrigger`                 | The disclosure at the field's end (a `ComboToggle` by default); `variant`, `disabled`, `testID`, `style`                                                          |
| `ComboboxContent`                 | The field and its list: `items` instead of `ComboboxItem` children, `minWidth`                                                                                    |
| `ComboboxItem`                    | `value`, `disabled`, `group`; a string child is its title                                                                                                         |
| `ComboboxGroup` / `ComboboxLabel` | A section and its name                                                                                                                                            |
| `ComboboxEmpty`                   | What the list shows while the query matches nothing (`children` is the message)                                                                                   |
