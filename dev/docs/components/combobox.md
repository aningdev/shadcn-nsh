# Combobox (/dev/docs/components/combobox)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add combobox
```

## Usage [#usage]

```tsx
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
import { Icon } from "@/lib/ui/icons";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<Combobox value={value} onChange={({ value }) => setValue(value)}>
  <ComboboxTrigger />
  <ComboboxContent>
    <ComboboxItem value="react">React</ComboboxItem>
    <ComboboxItem value="vue">Vue</ComboboxItem>
  </ComboboxContent>
</Combobox>
```

Without `multiple`, `value` is the chosen item or `null` (`string | null`). With `multiple`, it is the chosen items (`string[]`).

## Composition [#composition]

Use the following composition to build a `Combobox`:

```text
Combobox
├── ComboboxTrigger
├── ComboboxChips
│   └── ComboboxChip
└── ComboboxContent
    ├── ComboboxEmpty
    ├── ComboboxGroup
    │   ├── ComboboxLabel
    │   └── ComboboxItem
    └── ComboboxItem
```

## Examples [#examples]

### Disabled and clearable [#disabled-and-clearable]

```tsx
<Combobox disabled>…</Combobox>
<Combobox cleanable>…</Combobox>
```

### One value [#one-value]

Leave `multiple` out. A choice replaces the last one and closes the list. `onChange` receives `{ value: string | null }`.

```tsx
const assignee = signal<string | null>(null);

<Combobox value={assignee()} onChange={({ value }) => assignee.set(value)}>
  <ComboboxTrigger />
  <ComboboxContent>
    <ComboboxItem value="ada">Ada Lovelace</ComboboxItem>
    <ComboboxItem value="grace">Grace Hopper</ComboboxItem>
  </ComboboxContent>
</Combobox>;
```

The trigger opens and closes the list. The field's input takes typing, and typing opens the list
filtered as you type (`nsh/base` also toggles on the input's press — `references/nsh/crates/nsh-base/src/combobox.rs`,
its `on_press` — but a click on macOS lands in the field editor for the caret,
`references/nsh/crates/nsh-platform-macos/src/text_input.rs`, so with a pointer the arrow is the way
in). Clicking the field puts the caret there and does not open the list; tabbing into it does not
either.

### Several values [#several-values]

`multiple` toggles an item and keeps the list open; the field shows the chosen titles.

```tsx
<Combobox multiple value={tags} onChange={({ value }) => setTags(value)}>
  …
</Combobox>
```

### Chips in the field [#chips-in-the-field]

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

`ComboboxChip` and `ComboboxChips` render only inside `<Combobox>` — as `ComboboxChips` (the field's
prefix) or anywhere else under that root, including as a sibling of `ComboboxContent`. Outside the
root they throw. A chip drawn somewhere else, a summary beside the field, is the app's own: read
`value` and update it from the chip's press.

### Groups and an empty list [#groups-and-an-empty-list]

```tsx
<ComboboxContent>
  <ComboboxGroup>
    <ComboboxLabel>Front end</ComboboxLabel>
    <ComboboxItem value="react">React</ComboboxItem>
  </ComboboxGroup>
  <ComboboxEmpty>No matches</ComboboxEmpty>
</ComboboxContent>
```

### A trigger of your own [#a-trigger-of-your-own]

A string child is a `Button`; anything else is drawn as given. `testID` reaches the
button or the default toggle, and `accessibilityLabel` names it (the default toggle is a
chevron with no text of its own).

```tsx
<ComboboxTrigger>
  <Icon icon={ChevronRight} size={14} tint={colors.mutedForeground} />
</ComboboxTrigger>
```

## API [#api]

The root owns the open flag and the chosen values; `ComboboxContent` mounts [`nsh/base` Combobox](https://nsh.dev/elements/combobox) and every base prop passes through except those. The combobox look, `listboxProps` and `OptionRow` fill the field, the popup and the rows by default.

| Part              | Props                                                                                                                                                                                                               | Description                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Combobox`        | `value` / `defaultValue` (`string \| null`, or `string[]` with `multiple`), `multiple`, `open` / `defaultOpen`, `disabled`, `cleanable`, `placeholder`, `onChange`, `onOpenChange`, `onOpen`, `onClose`, `onCancel` | The root: one value, or several when `multiple` is set. `onChange` follows that: `{ value: string \| null }` or `{ value: string[] }`. |
| `ComboboxTrigger` | `children`, `variant`, `disabled`, `testID`, `accessibilityLabel`, `style`                                                                                                                                          | The disclosure at the field's end (a `ComboToggle` by default).                                                                        |
| `ComboboxContent` | `items` (instead of `ComboboxItem` children), `minWidth`, `children`                                                                                                                                                | The field and the list anchored to it; it mounts `nsh/base` Combobox.                                                                  |
| `ComboboxItem`    | `value`, `disabled`, `group`, `children` (a string is its title)                                                                                                                                                    | One choice in the list.                                                                                                                |
| `ComboboxChips`   | `children`: a `(value) => JSX.Element` that draws each one, a `ComboboxChip` by default                                                                                                                             | The chosen values as chips at the field's start (NSH's `prefix`).                                                                      |
| `ComboboxChip`    | `value`, `children` (its text, the item's title by default), `lead`, `showRemove` (default `true`), `style`                                                                                                         | One value's chip. It has to sit inside `<Combobox>`.                                                                                   |
| `ComboboxGroup`   | `children`                                                                                                                                                                                                          | A section of the list.                                                                                                                 |
| `ComboboxLabel`   | `children` (a string)                                                                                                                                                                                               | A section's name.                                                                                                                      |
| `ComboboxEmpty`   | `children` (the message)                                                                                                                                                                                            | What the list shows while the query matches nothing.                                                                                   |