---
layout: ../../../layouts/Docs.astro
title: DataTable
description: Styled data table wrapping nsh/base DataTable.
component: true
demo: data-table
demoHeight: 420
---

[`nsh/base`](https://nsh.dev/elements/data-table) owns virtualization, selection, sorting, column resize, and column moves. This package paints the card, the header band, the row hairline, stripe, and selection. For a handful of static rows with no scroll model, use [`Table`](./table).

## Install

```npx tabs
npx shadcn-nsh@latest add data-table
```

```bunx tabs
bunx shadcn-nsh@latest add data-table
```

```pnx tabs
pnx shadcn-nsh@latest add data-table
```

```yarn tabs
yarn dlx shadcn-nsh@latest add data-table
```

## Usage

```tsx
import { DataTable, dataTableFitPadding } from "@workspace/ui/components/ui/data-table";

const columns = [
  { key: "name", title: "Name", width: 160, fixed: true, fitPadding: dataTableFitPadding },
  { key: "score", title: "Score", width: 80, align: "end", sortable: true },
];

<DataTable
  accessibilityLabel="People"
  columns={columns}
  data={rows}
  stripe
  sort={sort}
  onSortChange={(e) => sort.set(e.sort)}
  style={{ width: 320, height: 240 }}
/>;
```

The app sorts. `onSortChange` reports the next `{ key, direction }` (`null` to clear); set `sort` so the title shows it.

## API

### Parts

`classes` and `styles` merge onto these defaults. A consumer class is appended. A consumer style wins per key. `null` drops that part's default.

| Part                              | Chrome                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `root`                            | `border`, `radius.control`, `background`, `foreground`                          |
| `header`                          | `muted` at 50%, a line under it, `muted-foreground`                             |
| `headerCell`                      | 8 points of leading padding, 4 of trailing (room for the sort button)           |
| `headerContent`                   | 4 points between the title and the sort button                                  |
| `headerCellSelected`              | `primary` at 10%                                                                |
| `headerCellDragging`              | opacity 0.5                                                                     |
| `groupCell`                       | `border` on the bottom and the trailing edge, 8 points of padding               |
| `sortIndicator`                   | Rounded. Hover is `foreground` at 10%, pressed at 15%                           |
| `sortAscending`, `sortDescending` | `muted-foreground` at 60%. The sorted direction is `foreground` at full opacity |
| `resizeHandle`                    | `border` at rest, `primary` under the pointer and while dragged                 |
| `moveIndicator`                   | `primary`                                                                       |
| `row`                             | `border` at 60% along the bottom                                                |
| `rowOdd`                          | `muted` at 35% (`stripe`)                                                       |
| `rowHover`, `rowActive`           | `muted` at 60%                                                                  |
| `rowSelected`                     | `primary` at 12%                                                                |
| `cell`                            | 8 points of horizontal padding                                                  |
| `cellSelected`                    | 1-point `primary` border                                                        |
| `cellColumnSelected`              | `primary` at 8%                                                                 |
| `cellActive`                      | 1-point `primary` border at 50%                                                 |
| `rowHeader`                       | `muted-foreground`                                                              |
| `rowHeaderCorner`                 | `muted` at 50%                                                                  |
| `fixedEdge`                       | `border`                                                                        |
| `empty`                           | 8 points of padding, `muted-foreground`                                         |

### `dataTableFitPadding`

`16`. Pass it as a column's `fitPadding` when fitting a column to its text, so the measured width includes this layer's padding. The table does not add it on its own.

Every base prop passes through, including `classes` and `styles`.

## Differences

| Topic           | Reference (`data-table.ts`)                   | This package                                                                                         |
| --------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Radius          | `rounded-lg`                                  | `radius.control`                                                                                     |
| Selection fills | `primary` at 10%, 12%, and 8% via classes     | The same opacities, as styles, so they are not limited to the Tailwind scale                         |
| Resize handle   | Hidden until hover in a terminal              | Terminal branch dropped. The handle is a `border` line, `primary` while pointed at                   |
| Rise / fall     | App classes `text-green-600` / `text-red-600` | Not in the shared look. No `up` / `down` tokens. Set `positiveClass` / `negativeClass` on the column |
| `Table`         | Same file was the class source for both       | Composition `Table` is a different control. This is `DataTable`                                      |
| shadcn          | No `DataTable`. `Table` is the static one     | Same split. There is no `data-table` alias of `Table`                                                |

## Accessibility

Base exposes one grid, named by `accessibilityLabel`, with column headers and cells. A selected row, column, or cell is reported selected. The sort control is a button (`sort:<column key>`). Arrow keys, Home, End, Page Up, Page Down, and Tab move the selection once the table has the keyboard. This package does not add a disabled state: turn selection off with `rowSelectable`, `columnSelectable`, or a column's `selectable`.
