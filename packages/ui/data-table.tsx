// Data table: `dataTableClasses` and the `DataTable` that wears them.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { terminal } from "@shadcn-nsh/theme";
import { split } from "nsh";
import {
  DataTable as BaseDataTable,
  type DataTableClasses,
  type DataTableProps as BaseDataTableProps,
} from "nsh/base";

import { mergeClasses } from "./lib/utils";

/** Extra room for this UI layer's cell padding and title/button gap. */
export const dataTableFitPadding = 16;

/** The chosen column's arrow: both directions print it at the same strength, so only the arrow's turn says which. */
const sortChosen = "text-muted-foreground opacity-60 selected:text-foreground selected:opacity-100";

/** The shared table look. nsh/base owns its structure and interaction. */
export const dataTableClasses: DataTableClasses = {
  // On the card, so the stripes and the header (muted) stand off it in light as in dark.
  root: "rounded-(--radius-container) border border-border bg-card text-foreground",
  header: "border-b border-border bg-muted/70 text-muted-foreground",
  headerCell: "pl-2 pr-1",
  headerContent: "gap-1",
  headerCellSelected: "bg-primary/10",
  headerCellDragging: "opacity-50",
  groupCell: "border-b border-r border-border px-2",
  sortIndicator: "rounded text-muted-foreground hover:bg-foreground/10 active:bg-foreground/15",
  sortAscending: sortChosen,
  sortDescending: sortChosen,
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

/**
 * `nsh/base` DataTable with `dataTableClasses` by default. Sorting, selection,
 * resize, and column moves stay in base.
 */
export type DataTableProps<T = unknown> = BaseDataTableProps<T>;

/**
 * A table that scrolls both ways over any number of rows and columns. Its rows stay 32 points in
 * both idioms (the table has no size axis): nine of a phone's fit, where six finger-sized rows
 * would.
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const [, rest] = split(props, ["classes"]);
  return <BaseDataTable {...rest} classes={mergeClasses(dataTableClasses, props.classes)} />;
}

/** The classes of a table's parts (`dataTableClasses`), from `nsh/base`. */
export type { DataTableClasses };
