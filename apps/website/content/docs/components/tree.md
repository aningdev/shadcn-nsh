---
title: Tree
description: A virtualized tree with chevrons and folder icons.
component: true
demo: tree
---

## Installation

```npm
npx shadcn-nsh@latest add tree
```

## Usage

```tsx
import { Tree } from "@/components/ui/tree";
```

```tsx
<Tree items={items} defaultExpanded={["src"]} />
```

## Examples

### Folders

`items` nest; a folder opens with a press or its chevron.

```tsx
const items: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "App.tsx" },
      { id: "kit", label: "kit.tsx" },
    ],
  },
  { id: "readme", label: "README.md" },
];

<Tree items={items} style={{ width: 280, maxHeight: 220 }} />;
```

### Expanded

`defaultExpanded` opens folders at first.

```tsx
<Tree items={items} defaultExpanded={["src"]} />
```

### Height

A row is `treeRowHeight` tall: 28 points with a pointer, 44 on a touch screen. A well that should be
as tall as its first rows, with the rest scrolling, sets its own height from it (`Tree`'s `style`),
plus the list's 6 points of padding on each side.

```tsx
import { treeRowHeight } from "@/components/ui/tree";

<Tree items={items} style={{ height: 8 * treeRowHeight + 12 }} />;
```

## API

Uses `treeItemClass` and `TreeRow` by default. Every prop of [`nsh/base` Tree](https://nsh.dev/elements/tree) passes through.

| Part            | Props                                                                                | Description                                                     |
| --------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `Tree`          | `items`, `defaultExpanded`, `renderItem`, `onSelect`, and every `nsh/base` Tree prop | The virtualized list of rows, in a card, `TreeRow` by default   |
| `TreeRow`       | `entry`, `icon`, `tint`, `detail`                                                    | A row: its chevron, its icon, its label and a detail at the end |
| `treeItemClass` | —                                                                                    | The row's look, for a row you draw yourself                     |
| `treeRowHeight` | —                                                                                    | A row's height: 28 with a pointer, 44 on a touch screen         |
