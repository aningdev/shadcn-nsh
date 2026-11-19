---
title: Combobox
description: A searchable field with a list of choices and chips for the values chosen, on the shared listbox look.
component: true
demo: combobox
---

## Installation

```npm
npx shadcn-nsh@latest add combobox
```

## Usage

```tsx
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
import { Icon } from "@/lib/icons";
```

The examples draw icons with `Icon` from `lib/icons`; see [Icons](../icons) for adding it and picking a size and color.

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

### Disabled and clearable

```tsx
<Combobox disabled>…</Combobox>
<Combobox cleanable>…</Combobox>
```

### Several values

`multiple` toggles an item and keeps the list open; the field shows the chosen titles.

```tsx
<Combobox multiple value={tags} onChange={({ value }) => setTags(value)}>
  …
</Combobox>
```

### Chips in the field

`ComboboxChips` draws the chosen values as chips at the start of the field — where NSH puts a
multiple combobox's `prefix` — so the input keeps the query and the field grows down as the chips
wrap. A chip's label is its item's title, and its remove button drops that value.

```tsx
<Combobox multiple value={tags} onChange={({ value }) => setTags(value)}>
  <ComboboxChips />
  <ComboboxContent>…</ComboboxContent>
</Combobox>
```

A chip can take a mark at its start (`lead`) or keep its value against a stray press
(`showRemove={false}`); a function child draws each value's chip instead of the default one:

```tsx
<ComboboxChips>
  {(value) => (
    <ComboboxChip
      value={value}
      lead={<Avatar name={name} style={{ width: 18, height: 18 }} />}
      showRemove={value !== "ada"}
    />
  )}
</ComboboxChips>
```

The chips are that `prefix`, not a field of their own: typing beside them still filters through the
combobox's input, and a text field of its own beside the chips is a second control.

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
  <Icon icon={ChevronRight} size={14} tint={colors.mutedForeground} />
</ComboboxTrigger>
```

## Differences from shadcn/ui

- No `ComboboxChipsInput` and no `useComboboxAnchor`: the input is `nsh/base`'s own, drawn beside the prefix, and the popup's anchor is the field.

## API

The root owns the open flag and the chosen values; `ComboboxContent` mounts [`nsh/base` Combobox](https://nsh.dev/elements/combobox) and every base prop passes through except those. `comboboxLook`, `listboxProps` and `OptionRow` fill the field, the popup and the rows by default.

| Part              | Props                                                                                                                                                             | Description                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Combobox`        | `value` / `defaultValue`, `multiple`, `open` / `defaultOpen`, `disabled`, `cleanable`, `placeholder`, `onChange`, `onOpenChange`, `onOpen`, `onClose`, `onCancel` | The root: it owns the open flag and the chosen values.            |
| `ComboboxTrigger` | `children`, `variant`, `disabled`, `testID`, `style`                                                                                                              | The disclosure at the field's end (a `ComboToggle` by default).   |
| `ComboboxContent` | `items` (instead of `ComboboxItem` children), `minWidth`, `children`                                                                                              | The field and its list; it mounts `nsh/base` Combobox.            |
| `ComboboxItem`    | `value`, `disabled`, `group`, `children` (a string is its title)                                                                                                  | One choice in the list.                                           |
| `ComboboxChips`   | `children`: a `(value) => JSX.Element` that draws each one, a `ComboboxChip` by default                                                                           | The chosen values as chips at the field's start (NSH's `prefix`). |
| `ComboboxChip`    | `value`, `children` (its text, the item's title by default), `lead`, `showRemove` (default `true`), `style`                                                       | One value's chip.                                                 |
| `ComboboxGroup`   | `children`                                                                                                                                                        | A section of the list.                                            |
| `ComboboxLabel`   | `children` (a string)                                                                                                                                             | A section's name.                                                 |
| `ComboboxEmpty`   | `children` (the message)                                                                                                                                          | What the list shows while the query matches nothing.              |
