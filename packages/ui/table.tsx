// A table: `nsh/base`'s parts in the card look of `data-table.tsx` (`dataTableClasses`).

import type { JSX } from "nsh";
import { split } from "nsh";
import {
  Table as BaseTable,
  TableBody as BaseTableBody,
  TableCaption as BaseTableCaption,
  TableCell as BaseTableCell,
  TableFooter as BaseTableFooter,
  TableHead as BaseTableHead,
  TableHeader as BaseTableHeader,
  TableRow as BaseTableRow,
  type TableBodyProps as BaseTableBodyProps,
  type TableCaptionProps as BaseTableCaptionProps,
  type TableCellProps as BaseTableCellProps,
  type TableFooterProps as BaseTableFooterProps,
  type TableHeadProps as BaseTableHeadProps,
  type TableHeaderProps as BaseTableHeaderProps,
  type TableProps as BaseTableProps,
  type TableRowProps as BaseTableRowProps,
} from "nsh/base";

import { dataTableClasses } from "./data-table";
import { AsText } from "./lib/as-text";
import { joinClass } from "./lib/class-names";

/** Rows ease their fill. `motion-reduce` drops it. */
export const tableRowClass = "transition-colors duration-150 motion-reduce:transition-none";

/** Theme layer on `nsh/base` Table: a bordered card. Sorting and selection belong to `DataTable`. */
export type TableProps = BaseTableProps;

/** The header band. */
export type TableHeaderProps = BaseTableHeaderProps;

/** The body group. */
export type TableBodyProps = BaseTableBodyProps;

/** The footer band. */
export type TableFooterProps = BaseTableFooterProps;

/** A row. `selected` is this wrapper's (base has no selected flag): the look's `rowSelected`. */
export type TableRowProps = BaseTableRowProps & {
  /** Selected row fill. */
  selected?: boolean;
};

/** A column header. A string is drawn in the quiet header text. */
export type TableHeadProps = Omit<BaseTableHeadProps, "children"> & {
  children?: string | JSX.Element;
};

/** A cell. A string is drawn in the body text. */
export type TableCellProps = Omit<BaseTableCellProps, "children"> & {
  children?: string | JSX.Element;
};

/** The caption under the table. A string is drawn muted. */
export type TableCaptionProps = Omit<BaseTableCaptionProps, "children"> & {
  children?: string | JSX.Element;
};

/** A string child's type, by the part it is drawn in. */
const textClass = {
  head: "text-sm font-medium text-muted-foreground",
  cell: "text-sm text-foreground",
  caption: "text-xs text-muted-foreground",
} as const;

/** A head and a cell share it: the look's cell padding, and the same vertical padding so a column's two rows line up. */
const cellClass = `${dataTableClasses.cell} py-2`;

/** A table of the app's rows: a bordered card. Screen readers hear the base roles. */
export function Table(props: TableProps) {
  const [, rest] = split(props, ["class"]);
  return <BaseTable {...rest} class={joinClass(dataTableClasses.root, props.class)} />;
}

/** The header band. */
export function TableHeader(props: TableHeaderProps) {
  const [, rest] = split(props, ["class"]);
  return <BaseTableHeader {...rest} class={joinClass(dataTableClasses.header, props.class)} />;
}

/** The body group. */
export function TableBody(props: TableBodyProps) {
  const [, rest] = split(props, ["class"]);
  return <BaseTableBody {...rest} class={props.class ?? undefined} />;
}

/** The footer band. */
export function TableFooter(props: TableFooterProps) {
  const [, rest] = split(props, ["class"]);
  return (
    <BaseTableFooter
      {...rest}
      class={joinClass(`${dataTableClasses.header} border-border border-t`, props.class)}
    />
  );
}

/** A row: a hairline and an optional selected fill. */
export function TableRow(props: TableRowProps) {
  const [, rest] = split(props, ["class", "selected"]);
  const rowClass = joinClass(
    `${tableRowClass} ${dataTableClasses.row}`,
    props.selected ? dataTableClasses.rowSelected : undefined,
  );
  return <BaseTableRow {...rest} class={joinClass(rowClass, props.class)} />;
}

/** A column's header cell. */
export function TableHead(props: TableHeadProps) {
  const [, rest] = split(props, ["class", "children"]);
  return (
    <BaseTableHead {...rest} class={joinClass(cellClass, props.class)}>
      <AsText class={textClass.head}>{props.children}</AsText>
    </BaseTableHead>
  );
}

/** A body or footer cell. */
export function TableCell(props: TableCellProps) {
  const [, rest] = split(props, ["class", "children"]);
  return (
    // No width of its own: a column's width is the app's, set on its head and its cells
    // alike (`w-24`, `flex-1`), so the two rows line up.
    <BaseTableCell {...rest} class={joinClass(cellClass, props.class)}>
      <AsText class={textClass.cell}>{props.children}</AsText>
    </BaseTableCell>
  );
}

/** The caption under the rows. */
export function TableCaption(props: TableCaptionProps) {
  const [, rest] = split(props, ["class", "children"]);
  return (
    <BaseTableCaption {...rest} class={joinClass("px-2 py-2", props.class)}>
      <AsText class={textClass.caption}>{props.children}</AsText>
    </BaseTableCaption>
  );
}
