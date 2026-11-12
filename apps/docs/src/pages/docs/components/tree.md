---
layout: ../../../layouts/Docs.astro
title: Tree
description: A virtualized tree with chevrons and folder icons.
component: true
demo: tree
---

## Installation

```sh
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

## API

Uses `treeItemClass` and `TreeRow` by default. Every prop of [`nsh/base` Tree](https://nsh.dev/elements/tree) passes through.
