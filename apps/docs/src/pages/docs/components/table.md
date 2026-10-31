---
layout: ../../../layouts/Docs.astro
title: Table
description: Styled table wrapping nsh/base Table.
component: true
demo: table
---

Styled table primitives on `nsh/base` Table parts. Borders, muted header/footer, and cell padding are fixed; compose rows with `Text` (or other) children.

## Install

```sh
shadcn-nsh add table
# monorepo:
shadcn-nsh add table -c apps/web
```

## Usage

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/ui/table";
import { Text } from "nsh";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>
        <Text>Name</Text>
      </TableHead>
      <TableHead>
        <Text>Role</Text>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <Text>Ada</Text>
      </TableCell>
      <TableCell>
        <Text>Engineer</Text>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

## Composition

```
Table
├── TableHeader
│   └── TableRow → TableHead*
├── TableBody
│   └── TableRow → TableCell*
├── TableFooter
│   └── TableRow → TableCell*
└── TableCaption
```

## Examples

### Caption + footer

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>
        <Text>Item</Text>
      </TableHead>
      <TableHead>
        <Text>Qty</Text>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <Text>Widgets</Text>
      </TableCell>
      <TableCell>
        <Text>12</Text>
      </TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell>
        <Text>Total</Text>
      </TableCell>
      <TableCell>
        <Text>12</Text>
      </TableCell>
    </TableRow>
  </TableFooter>
  <TableCaption>
    <Text>Inventory snapshot</Text>
  </TableCaption>
</Table>
```

### Accessible label

```tsx
<Table accessibilityLabel="Team roster">
  <TableBody>
    <TableRow>
      <TableCell>
        <Text>Grace</Text>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## API

### `Table`

| Prop                 | Type             | Default | Notes        |
| -------------------- | ---------------- | ------- | ------------ |
| `accessibilityLabel` | `string \| null` | —       |              |
| `children`           | `JSX.Element`    | —       | Section tree |

### `TableHeader` / `TableBody` / `TableFooter` / `TableRow` / `TableHead` / `TableCell` / `TableCaption`

| Prop       | Type          | Default | Notes |
| ---------- | ------------- | ------- | ----- |
| `children` | `JSX.Element` | —       |       |

## Differences

| Topic     | shadcn                                           | This package                                |
| --------- | ------------------------------------------------ | ------------------------------------------- |
| Parts     | `Table` / `Header` / `Body` / `Row` / `Head` / … | same part names on nsh/base wrappers        |
| Styling   | `className` on each part                         | locked borders / muted bands / cell padding |
| Semantics | HTML table in the browser                        | nsh table primitives (cross-platform)       |

## Not forwarded

From `nsh/base` Table parts: all style hooks. Every part hardcodes presentation (outer border, muted header/footer, row flex/border, cell padding, caption padding). No caller `style` props. Extend the copied source if you need base knobs.
