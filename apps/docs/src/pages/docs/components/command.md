---
layout: ../../../layouts/Docs.astro
title: Command
description: A search palette with sectioned, virtualized rows.
component: true
demo: command
---

## Installation

```sh
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

`shortcut` is drawn as key caps with a pointer; `checked` marks the row in effect.

```tsx
const items: CommandItem[] = [
  { id: "theme", label: "Toggle Theme", group: "View", checked: true },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];
```

### Search

The field filters the rows as you type; the search bar and the rows are `commandClasses`.

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
