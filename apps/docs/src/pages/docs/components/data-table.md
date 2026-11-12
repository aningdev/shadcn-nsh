---
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

## API

Uses `dataTableClasses` and `dataTableFitPadding`. Every prop of [`nsh/base` DataTable](https://nsh.dev/elements/data-table) passes through.
