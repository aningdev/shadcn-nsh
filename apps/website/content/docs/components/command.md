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
and placeholder color inline, over `commandClasses`, so an icon in `searchPrefix` stays beside the
field and the placeholder stays the muted foreground — including when `searchable` turns the bar on
after the palette has mounted. A caller's `searchBarStyle` and `searchStyle` win over those.

```tsx
<Command
  items={items}
  accessibilityLabel="Commands"
  searchAccessibilityLabel="Search commands"
  onSelect={({ id }) => run(id)}
/>
```

### A long list

The rows are made as they come into view, so five thousand files cost what five do: `listClass`
gives the list its height and the rest scrolls. `keywords` let the query find a file by its
extension as well as by its name (`png` finds every image), `renderItem` draws the extension's
icon, and the ref's `matchedCount()` is what the query left — the count under the palette reads
it, never the app's guess at the filter.

```tsx
const EXTENSIONS = ["rs", "tsx", "md", "json", "png"] as const;

const FILES: CommandItem[] = Array.from({ length: 5000 }, (_, index) => {
  const extension = EXTENSIONS[index % EXTENSIONS.length];
  const folder = `module-${String(Math.floor(index / 100) + 1).padStart(2, "0")}`;
  return {
    id: `file-${index}`,
    label: `${folder}/file-${index + 1}.${extension}`,
    group: folder,
    keywords: [extension],
  };
});

const files = signal(FILES.length);
let palette: CommandRef | undefined;

<Command
  ref={(ref) => (palette = ref)}
  items={FILES}
  listClass="h-60"
  placeholder="Search files by name or extension…"
  searchAccessibilityLabel="Search files"
  empty={<CommandEmpty label="No file matches" />}
  onQueryChange={() => void palette?.matchedCount().then((count) => files.set(count))}
  renderItem={(entry) => <CommandRow entry={entry} icon={iconFor(entry.label)} />}
/>

<Text class="text-muted-foreground" style={{ fontSize: 12 }}>
  {`${files()} of ${FILES.length} files, 50 folders`}
</Text>
```

## API

Uses `commandClasses`, `CommandRow`, `CommandHeading`, and `CommandEmpty` by default. Every prop of [`nsh/base` Command](https://nsh.dev/elements/command) passes through.

| Part             | Props                             | Description                                                                                                                                                                                            |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Command`        | —                                 | A command palette: a search field over virtualized, natively filtered rows, however many there are. `searchBarStyle` and `searchStyle` still pass through, over the shell's row and placeholder color. |
| `CommandRow`     | `entry`, `icon`, `detail`, `note` | A row's content: the icon, the label, a `note` at the end, the shortcut's keys and a check for the item in effect.                                                                                     |
| `CommandHeading` | `group`                           | A section's heading: small capitals in the faint color.                                                                                                                                                |
| `CommandEmpty`   | `label`                           | What the palette shows while nothing matches.                                                                                                                                                          |
