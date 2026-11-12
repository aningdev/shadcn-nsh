---
title: Table
description: Composition parts for a bordered table card using the shared data-table classes.
component: true
demo: table
---

## Installation

```sh
npx shadcn-nsh@latest add table
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

## Examples

### Selected row

`TableRow` accepts `selected` for the `rowSelected` fill.

### String children

`TableHead`, `TableCell`, and `TableCaption` render strings with muted or foreground text.

## API

Composition exports: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, and `tableRowClass`. Props match [`nsh/base` Table](https://nsh.dev/elements/table) parts except `TableRow.selected`.
