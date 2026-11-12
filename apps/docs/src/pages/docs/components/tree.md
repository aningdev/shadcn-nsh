---
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

## API

Uses `treeItemClass` and `TreeRow` by default. Every prop of [`nsh/base` Tree](https://nsh.dev/elements/tree) passes through.
