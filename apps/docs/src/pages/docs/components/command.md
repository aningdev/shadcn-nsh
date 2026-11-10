---
layout: ../../../layouts/Docs.astro
title: Command
description: Styled command palette wrapping nsh/base Command — theme tokens + default rows.
component: true
demo: command
demoHeight: 420
---

A command palette on `nsh/base` Command. Filtering, the highlight, the keyboard, and the virtualized rows stay in base. This package paints the card, the search bar, section headings, separators, and the default row (label, shortcut, check).

## Install

```sh
shadcn-nsh add command
# monorepo:
shadcn-nsh add command -c apps/web
```

## Usage

```tsx
import { Command } from "@workspace/ui/components/ui/command";

const commands = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "theme", label: "Toggle Theme", group: "View", checked: true },
];

<Command
  items={commands}
  accessibilityLabel="Commands"
  searchAccessibilityLabel="Search commands"
  onSelect={({ id }) => chosen.set(id)}
/>;
```

## API

### `Command`

| Prop                            | Type                        | Default                                  | Notes                                                              |
| ------------------------------- | --------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `items`                         | `CommandItem[]`             | `[]`                                     | id, label, keywords, group, shortcut, disabled, checked            |
| `query` / `defaultQuery`        | `string`                    | —                                        | Controlled query is `query` + `onQueryChange`                      |
| `searchable` / `filterable`     | `boolean`                   | `true`                                   | `filterable={false}` shows every item; the app answers the query   |
| `loading`                       | `boolean`                   | `false`                                  | Hides `empty` and marks the list busy                              |
| `placeholder`                   | `string \| null`            | `Type a command or search…`              | `null` clears the default                                          |
| `autoFocus`                     | `boolean`                   | `false`                                  | Search field takes focus once shown                                |
| `separator`                     | `boolean`                   | `true`                                   | Hairline between sections                                          |
| `accessibilityLabel`            | `string`                    | —                                        | List name, and the field while `searchAccessibilityLabel` is unset |
| `searchPrefix` / `searchSuffix` | `JSX.Element`               | a ⌕ mark / —                             | `null` clears the mark                                             |
| `renderItem` / `renderGroup`    | renderers                   | label + shortcut + check / muted heading | `null` uses base's plain text                                      |
| `empty`                         | `JSX.Element`               | “No results.”                            | Not shown while `loading`                                          |
| `header` / `footer`             | `JSX.Element`               | —                                        | Above the field, below the rows                                    |
| `onSelect`                      | `({ id }) => void`          | —                                        | Return or a press                                                  |
| `onHighlightChange`             | `({ highlighted }) => void` | —                                        | `null` while nothing is highlighted                                |
| `onQueryChange`                 | `({ query }) => void`       | —                                        | Typing, or Escape clearing the query                               |
| `onCancel`                      | `() => void`                | —                                        | Escape on an empty query                                           |

Style hooks (`style`, `searchBarClass`, `searchClass`, `searchStyle`, `listClass`, `listStyle`, `itemClass`, `groupClass`, `separatorClass`, and the matching `*Style`) merge over the palette chrome. The list's default `maxHeight` is 320 so only rows in view are built. `commandVariants()` returns that chrome; read it inside `computed`.

## Differences

| Topic           | shadcn                                          | This package / `nsh/base`                                                                 |
| --------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Shape           | `CommandInput`, `CommandList`, `CommandItem`, … | One `Command`. Rows are data (`items`), not child components                              |
| Dialog          | Often wrapped in `Dialog`                       | Not included. Put `Command` in `Dialog` yourself; Escape reports `onCancel`               |
| Highlight       | `data-[selected]` on the item                   | The row's `focus:` / `checked:` / `disabled:` classes. Base draws each row once           |
| Icons           | Consumer icons                                  | No icon set. The default row is label, shortcut keys, and a check                         |
| Empty / heading | `CommandEmpty`, `CommandGroup`                  | Default empty line and a muted heading. Pass `empty` / `renderGroup` to replace them      |
| Colors          | shadcn popover + accent                         | Neutral `card`, `accent` highlight, `ring` edge. Disabled is 0.5, not the reference's 0.4 |
| Press           | —                                               | `active:opacity-70`. A press sink cannot run: the row has no per-state style              |

## Accessibility

Screen readers hear a list box. The search field's name is `searchAccessibilityLabel`, or `accessibilityLabel` when that is unset. Disabled rows are skipped by the arrow keys and announced dimmed. Give the list a height or leave the default `maxHeight` so off-screen rows are not all built.
