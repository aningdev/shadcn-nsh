---
title: Table
description: Composition parts for a bordered table card using the shared data-table classes.
component: true
demo: table
---

## Installation

```npm
npx shadcn-nsh@latest add table
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Table } from "shadcn-nsh/table";
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
} from "@/components/ui/table";
```

```tsx
<Table accessibilityLabel="Invoices">
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Composition

Use the following composition to build a `Table`:

```text
Table
├── TableCaption
├── TableHeader
│   └── TableRow
│       └── TableHead
├── TableBody
│   └── TableRow
│       └── TableCell
└── TableFooter
    └── TableRow
        └── TableCell
```

## Examples

### Selected row

`TableRow` accepts `selected` for the `rowSelected` fill.

### String children

`TableHead`, `TableCell`, and `TableCaption` render strings with muted or foreground text.

## API

| Part           | Props                          | Description                                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `Table`        | every `nsh/base` Table prop    | The app's rows as a bordered card; screen readers hear the base roles          |
| `TableHeader`  | base props                     | The header band                                                                |
| `TableBody`    | base props                     | The body group                                                                 |
| `TableFooter`  | base props                     | The footer band, a hairline above                                              |
| `TableRow`     | base props, `selected`         | A row with a hairline above; `selected` fills it with the look's `rowSelected` |
| `TableHead`    | `children` (string or element) | A column's header cell; a string is drawn in the quiet header text             |
| `TableCell`    | `children`                     | A body or footer cell; a string is drawn in the body text                      |
| `TableCaption` | `children`                     | The caption under the rows; a string is drawn muted                            |

`tableRowClass` is the row's color transition, for a row of your own.
