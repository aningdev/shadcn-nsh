---
title: Command
description: A search palette with sectioned, virtualized rows.
component: true
demo: command
---

## Installation

```npm
npx shadcn-nsh@latest add command
```

## Usage

```tsx
import { Command } from "@/components/ui/command";
```

```tsx
<Command items={items} onSelect={({ id }) => {}} />
```

## Examples

### Groups

Rows with the same `group` gather under its heading, in the order given; `disabled` dims a row.

```tsx
const items: CommandItem[] = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];

<Command items={items} onSelect={({ id }) => run(id)} />;
```

### Shortcut and check

`shortcut` is drawn with a pointer in `kbd`'s key cap, the library's one (`add command` brings it); `checked` marks the row in effect.

```tsx
const items: CommandItem[] = [
  { id: "theme", label: "Toggle Theme", group: "View", checked: true },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];
```

### Search

The field filters the rows as you type. The shell sets the search bar's row and the field's text
and placeholder color inline (`commandSearchBarStyle`, `commandSearchStyle`), over
`commandClasses`, so an icon in `searchPrefix` stays beside the field and the placeholder stays
the muted foreground — including when `searchable` turns the bar on after the palette has mounted.
A caller's `searchBarStyle` and `searchStyle` win over those.

```tsx
<Command
  items={items}
  accessibilityLabel="Commands"
  searchAccessibilityLabel="Search commands"
  onSelect={({ id }) => run(id)}
/>
```

## API

Uses `commandClasses`, `CommandRow`, `CommandHeading`, and `CommandEmpty` by default. Every prop of [`nsh/base` Command](https://nsh.dev/elements/command) passes through.

| Part             | Props                             | Description                                                                                                                                                                    |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Command`        | —                                 | A command palette: a search field over virtualized, natively filtered rows. `searchBarStyle` and `searchStyle` still pass through, over the shell's row and placeholder color. |
| `CommandRow`     | `entry`, `icon`, `detail`, `note` | A row's content: the icon, the label, a `note` at the end, the shortcut's keys and a check for the item in effect.                                                             |
| `CommandHeading` | `group`                           | A section's heading: small capitals in the faint color.                                                                                                                        |
| `CommandEmpty`   | `label`                           | What the palette shows while nothing matches.                                                                                                                                  |
