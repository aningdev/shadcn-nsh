---
title: Select
description: A list of choices from a field trigger, on the shared listbox look.
component: true
demo: select
---

## Installation

```npm
npx shadcn-nsh@latest add select
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Select } from "shadcn-nsh/select";
```

## Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

```tsx
<Select value={value} onChange={({ value }) => setValue(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Language" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="en">English</SelectItem>
    <SelectItem value="de">Deutsch</SelectItem>
  </SelectContent>
</Select>
```

## Composition

Use the following composition to build a `Select`:

```text
Select
├── SelectTrigger
│   └── SelectValue
└── SelectContent
    ├── SelectGroup
    │   ├── SelectLabel
    │   └── SelectItem
    └── SelectItem
```

## Examples

### Disabled choice, disabled select

```tsx
<SelectItem value="svelte" disabled>
  Svelte
</SelectItem>
<Select disabled>…</Select>
```

### Invalid

The trigger's edge takes the danger tone.

```tsx
<SelectTrigger invalid>
  <SelectValue placeholder="Country" />
</SelectTrigger>
```

### Grouped choices

`SelectLabel` names the section; the list draws its header.

```tsx
<SelectContent>
  <SelectGroup>
    <SelectLabel>Europe</SelectLabel>
    <SelectItem value="de">Deutsch</SelectItem>
    <SelectItem value="fr">Français</SelectItem>
  </SelectGroup>
  <SelectGroup>
    <SelectLabel>Asia</SelectLabel>
    <SelectItem value="ja">日本語</SelectItem>
  </SelectGroup>
</SelectContent>
```

### Outline trigger, and a width

`variant="outline"` is a trigger that is not a form's field: the `raised` surface instead of the
field's well.

```tsx
<SelectTrigger variant="outline" style={{ width: 260 }}>
  <SelectValue placeholder="Filter" />
</SelectTrigger>
```

### A trigger that takes the room of a row

`style` on `SelectTrigger` is the trigger's box in the app's layout: the properties that place it
where the app puts it — `flex`, `flexGrow`, `flexShrink`, `flexBasis`, `width`, `minWidth`,
`maxWidth`, `alignSelf` and the margins — go on the view around the trigger, so it grows, shrinks
and keeps its distances like any other view. The rest of the style (the fill, the edge, the
padding) stays on the trigger itself.

```tsx
<View style={{ flexDirection: "row", gap: 8 }}>
  <Select placeholder="MM">
    <SelectTrigger style={{ flex: 1, minWidth: 0 }} />
    <SelectContent accessibilityLabel="Month">
      <SelectItem value="01">01</SelectItem>
    </SelectContent>
  </Select>
  <Select placeholder="YYYY">
    <SelectTrigger style={{ flex: 1, minWidth: 0 }} />
    <SelectContent accessibilityLabel="Year">
      <SelectItem value="2026">2026</SelectItem>
    </SelectContent>
  </Select>
</View>
```

With a pointer the trigger asks for 180 points at least (room for the list's rows). A `width` on
`style` is the trigger's size and wins over that floor, so `style={{ width: 120 }}` stays 120
points inside its parent. `minWidth: 0` still lets a narrow row squeeze a trigger that has no
width of its own, and its title ends in an ellipsis instead of overflowing.

### Uncontrolled

```tsx
<Select defaultValue="en" onChange={({ value }) => save(value)}>
  …
</Select>
```

## API

The root owns the open flag and the value; `SelectContent` mounts [`nsh/base` Select](https://nsh.dev/elements/select) and every base prop passes through except those. `listboxProps` and `OptionRow` fill the popup, the scrim and the rows by default.

| Part            | Props                                                                                                                                               | Description                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Select`        | `value`, `defaultValue`, `open`, `defaultOpen`, `disabled`, `cleanable`, `placeholder`, `onChange`, `onOpenChange`, `onOpen`, `onClose`, `onCancel` | The root owns the open flag and the value                                                                                 |
| `SelectTrigger` | `icon`, `lead`, `invalid`, `variant`, `chevron`, `style`                                                                                            | A `Picker`. The layout keys on `style` place it where the app puts it; a `width` there also overrides the 180-point floor |
| `SelectValue`   | `placeholder`                                                                                                                                       | The placeholder while nothing is chosen                                                                                   |
| `SelectContent` | `items`, `minWidth`                                                                                                                                 | The list; `items` instead of `SelectItem` children                                                                        |
| `SelectItem`    | `value`, `disabled`, `group`                                                                                                                        | A string child is its title                                                                                               |
| `SelectGroup`   |                                                                                                                                                     | A section                                                                                                                 |
| `SelectLabel`   |                                                                                                                                                     | The section's name                                                                                                        |
