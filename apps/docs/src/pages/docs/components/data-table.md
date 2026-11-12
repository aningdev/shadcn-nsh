---
layout: ../../../layouts/Docs.astro
title: DataTable
description: A striped table with sortable, resizable columns.
component: true
demo: data-table
---

## Installation

```sh
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

`dataTableFitPadding` on a column lets its content set the width.

```tsx
columns.map((column) => ({ ...column, fitPadding: dataTableFitPadding }));
```

## API

Uses `dataTableClasses` and `dataTableFitPadding`. Every prop of [`nsh/base` DataTable](https://nsh.dev/elements/data-table) passes through.
