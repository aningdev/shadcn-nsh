// Data table: `dataTableClasses` and the `DataTable` that wears them.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { terminal } from "@shadcn-nsh/theme";
import { platform, split } from "nsh";
import {
  DataTable as BaseDataTable,
  type DataTableClasses,
  type DataTableProps as BaseDataTableProps,
} from "nsh/base";

import { controlSize } from "./lib/surface";

// @port data-table.ts
/** Extra room for this UI layer's cell padding and title/button gap. */
export const dataTableFitPadding = 16;

/** The shared table look. nsh/base owns its structure and interaction. */
export const dataTableClasses: DataTableClasses = {
  // On the card, so the stripes and the header (muted) stand off it in light as in dark.
  root: "rounded-lg border border-border bg-card text-foreground",
  header: "border-b border-border bg-muted/70 text-muted-foreground",
  headerCell: "pl-2 pr-1",
  headerContent: "gap-1",
  headerCellSelected: "bg-primary/10",
  headerCellDragging: "opacity-50",
  groupCell: "border-b border-r border-border px-2",
  sortIndicator: "rounded text-muted-foreground hover:bg-foreground/10 active:bg-foreground/15",
  sortAscending: "text-muted-foreground opacity-60 selected:text-foreground selected:opacity-100",
  sortDescending: "text-muted-foreground opacity-60 selected:text-foreground selected:opacity-100",
  // A terminal's columns stand apart by their spaces: the handle shows,
  // faint, only while the pointer is on it.
  resizeHandle: terminal
    ? "group-hover:bg-muted-foreground/40 group-active:bg-primary"
    : "bg-border group-hover:bg-primary group-active:bg-primary",
  moveIndicator: "bg-primary",
  row: "border-b border-border/60",
  rowOdd: "bg-muted/60",
  rowHover: "bg-muted",
  rowSelected: "bg-primary/12",
  rowActive: "bg-muted",
  cell: "px-2",
  cellSelected: "border border-primary",
  cellColumnSelected: "bg-primary/8",
  cellActive: "border border-primary/50",
  rowHeader: "text-muted-foreground",
  fixedEdge: "bg-border",
};
// @port end

/** A part class: drop it on `null`, append the consumer after the default. */
function mergeClasses(
  base: DataTableClasses,
  consumer?: DataTableClasses | null,
): DataTableClasses {
  if (consumer == null) return base;
  const merged: DataTableClasses = { ...base };
  for (const key of Object.keys(consumer) as (keyof DataTableClasses)[]) {
    const next = consumer[key];
    if (next === undefined) continue;
    if (next === null) {
      delete merged[key];
      continue;
    }
    const prior = merged[key];
    merged[key] = prior ? `${prior} ${next}` : next;
  }
  return merged;
}

/**
 * `nsh/base` DataTable with `dataTableClasses` by default. Sorting, selection,
 * resize, and column moves stay in base.
 */
export type DataTableProps<T = unknown> = BaseDataTableProps<T>;

/** A table that scrolls both ways over any number of rows and columns. */
export function DataTable<T>(props: DataTableProps<T>) {
  const [, rest] = split(props, ["classes", "rowHeight", "headerHeight"]);
  const touch = !platform.desktop;
  const rowTarget = controlSize.row;
  return (
    <BaseDataTable
      {...rest}
      rowHeight={props.rowHeight ?? (touch ? rowTarget : undefined)}
      headerHeight={
        props.headerHeight !== undefined ? props.headerHeight : touch ? rowTarget : undefined
      }
      classes={mergeClasses(dataTableClasses, props.classes)}
    />
  );
}
