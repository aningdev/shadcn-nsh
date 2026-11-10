---
layout: ../../../layouts/Docs.astro
title: Table
description: Styled table wrapping nsh/base Table parts.
component: true
demo: table
demoHeight: 360
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns the table, row group, row, column header, and cell roles. This package paints the card, the header and footer bands, the row hairline and hover, and an optional selected fill. A string child of `TableHead`, `TableCell`, or `TableCaption` is drawn as themed text; anything else is rendered as it is.

For many rows, sorting, column resize, or a selection model, use `DataTable` on `nsh/base`. That control is out of phase 1 here. The reference look (`data-table.ts`) is that control's classes; the parts below take the chrome that maps onto a composition table.

## Install

```npx tabs
npx shadcn-nsh@latest add table
```

```bunx tabs
bunx shadcn-nsh@latest add table
```

```pnx tabs
pnx shadcn-nsh@latest add table
```

```yarn tabs
yarn dlx shadcn-nsh@latest add table
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

<Table accessibilityLabel="Recent invoices">
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV1</TableCell>
      <TableCell>Paid</TableCell>
    </TableRow>
    <TableRow selected>
      <TableCell>INV2</TableCell>
      <TableCell>Hold</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

## API

### Parts

| Part           | Role          | Chrome                                                                                    |
| -------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `Table`        | table         | Full width, `border`, `radius.control`, `background`                                      |
| `TableHeader`  | header band   | `muted` at 50%, a line under it                                                           |
| `TableBody`    | body          | None. The rows carry the lines                                                            |
| `TableFooter`  | footer band   | `muted` at 50%, a line over it                                                            |
| `TableRow`     | row           | `border` at 60% along the bottom. Hover is `muted` at 60%. `selected` is `primary` at 12% |
| `TableHead`    | column header | Cell padding. A string is muted, medium, 13                                               |
| `TableCell`    | cell          | `flex: 1`, 8 points of padding. A string is foreground, 13                                |
| `TableCaption` | caption       | 8 points of padding. A string is muted, 12                                                |

Every part forwards `class`, `style`, and the state style hooks. A default is merged only where the part has one; the consumer wins per key. `class` is appended after the row's color transition (`duration-150`, cancelled by `motion-reduce`).

### `TableRow`

| Prop       | Type      | Default | Notes                                            |
| ---------- | --------- | ------- | ------------------------------------------------ |
| `selected` | `boolean` | —       | This wrapper's. Base `TableRow` has no such flag |

## Differences

| Topic              | Reference (`data-table.ts`)                         | This package                                                                    |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Control            | `DataTable` classes (`classes={dataTableClasses}`)  | Composition `Table`. `DataTable` is out of phase 1                              |
| Zebra              | `rowOdd` at `muted` 35%                             | Not drawn. Base rows have no index                                              |
| Selection          | Row, cell, and column selection, drawn by DataTable | `selected` on `TableRow` only (`primary` at 12%, the reference's `rowSelected`) |
| Sort, resize, drag | Indicator, handle, and drop line classes            | Not on these parts. Base `Table` has no such state                              |
| Header padding     | `pl-2 pr-1`, leaving room for a sort icon           | Same 8-point padding as the cells, so the text lines up                         |
| Terminal           | The resize handle hides until hover                 | Dropped, with the rest of the terminal branch                                   |
| shadcn             | `Table` + `data-[state=selected]`                   | Same part names. `selected` is a boolean, not a data attribute                  |

## Not forwarded

None — every `nsh/base` prop of each part passes through. `selected` is not a base prop and is not forwarded.
