---
title: DataTable
description: A striped table with sortable, resizable columns.
component: true
demo: data-table
---

## Installation

```npm
npx shadcn-nsh@latest add data-table
```

## Usage

```tsx
import { DataTable } from "@/components/ui/data-table";
```

```tsx
<DataTable columns={columns} data={rows} stripe />
```

## Examples

### Columns

`width`, `align` and `sortable` are per column.

```tsx
const columns: DataTableColumn[] = [
  { key: "id", title: "ID", width: 56, align: "end", sortable: true },
  { key: "name", title: "Name", width: 120, sortable: true },
  { key: "score", title: "Score", width: 72, align: "end", sortable: true },
];
```

### Stripes

```tsx
<DataTable columns={columns} data={people} stripe />
```

### A fixed body

The table fills and scrolls in the box it is given.

```tsx
<View style={{ height: 200 }}>
  <DataTable columns={columns} data={people} style={{ flex: 1 }} />
</View>
```

### Fit padding

A column fitted to its content takes `fitPadding` for the room the drawing adds beside the text: a
column of this look sets **16** — 8 points before a cell's text, 4 after it, and the 4-point gap
before a header's sort button.

```tsx
columns.map((column) => ({ ...column, fitPadding: 16 }));
```

### Fixed columns

`fixed: true` pins a column at the leading edge (`"left"` and `"right"` say which edge) while the
rest scroll horizontally under it. Fixed columns lead the row, take their width from `width`
(content cannot set it) and keep their place in the header too; the seam between a pinned column
and the scrolling body is `fixedEdge` in `dataTableClasses`. Give the table more columns than fit
the box to see it work.

```tsx
const columns: DataTableColumn[] = [
  { key: "id", title: "ID", width: 70, align: "end", fixed: true, sortable: true },
  { key: "name", title: "Name", width: 150, fixed: true, sortable: true },
  { key: "city", title: "City", width: 120, sortable: true },
  { key: "team", title: "Team", width: 110 },
  { key: "level", title: "Level", width: 90 },
  { key: "joined", title: "Joined", width: 110 },
  { key: "score", title: "Score", width: 90, align: "end", sortable: true },
  { key: "handle", title: "Handle", width: 140 },
];

<View style={{ height: 300 }}>
  <DataTable columns={columns} data={people} style={{ flex: 1 }} />
</View>;
```

### Selecting

Rows select by default; `columnSelectable` lets titles select columns and `cellSelectable` lets
cells select. `onSelectionChange` reports the `{ row, column }` selection (both zero-based), and
`selection` sets it back — a controlled selection, so what stays selected is the app's call. A
selection of a kind that does not select is cleared.

```tsx
const mode = signal<"row" | "cell" | "column">("row");
const selection = signal<DataTableSelection | null>(null);

const setMode = (next: "row" | "cell" | "column") => {
  mode.set(next);
  selection.set(null);
};

<DataTable
  columns={columns}
  data={people}
  rowSelectable={mode() === "row"}
  cellSelectable={mode() === "cell"}
  columnSelectable={mode() === "column"}
  selection={selection()}
  onSelectionChange={({ selection: next }) => selection.set(next)}
  onRowPress={({ row, column }) => log(`row ${row}, column ${column}`)}
/>;
```

A selection of several is the app's too: set `selectOnModifierPress={false}`, keep your own range or
set in `onRowPress` / `onColumnPress` (each reports Shift, Control, Option and the clicks), and paint
it with `rowClasses`, `cellClasses` or the columns' `headerClass` / `cellClass`.

## API

| Part        | Props                                                              | Description                             |
| ----------- | ------------------------------------------------------------------ | --------------------------------------- |
| `DataTable` | every `nsh/base` DataTable prop; `classes` over `dataTableClasses` | A striped table, sortable and resizable |

Uses `dataTableClasses`. Every prop of [`nsh/base` DataTable](https://nsh.dev/elements/data-table) passes through.
