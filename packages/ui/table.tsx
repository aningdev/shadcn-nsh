// Table: a bordered card built from `nsh/base` parts, wearing `dataTableClasses`.
// Composition shell only — shared part classes come from `data-table.ts` upstream.
import type { JSX } from "nsh";
import { split, Text } from "nsh";
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

/** Theme layer on `nsh/base` Table: a bordered card. Sorting and selection belong to `DataTable`. */
export type TableProps = BaseTableProps;

/** The header band. */
export type TableHeaderProps = BaseTableHeaderProps;

/** The body group. */
export type TableBodyProps = BaseTableBodyProps;

/** The footer band. */
export type TableFooterProps = BaseTableFooterProps;

/**
 * A row. `selected` is this wrapper's (base has no selected flag): the reference's
 * `rowSelected`.
 */
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

/** Rows ease their fill. `motion-reduce` drops it. */
export const tableRowClass = "transition-colors duration-150 motion-reduce:transition-none";

function mergeClass(base?: string | null, extra?: string | null): string | undefined {
  const a = base ?? undefined;
  const b = extra === null ? undefined : extra;
  if (a && b) return `${a} ${b}`;
  return b ?? a;
}

function textOf(children: string | JSX.Element | undefined, kind: "head" | "cell" | "caption") {
  if (typeof children !== "string") return children;
  const className =
    kind === "head"
      ? "text-sm font-medium text-muted-foreground"
      : kind === "caption"
        ? "text-xs text-muted-foreground"
        : "text-sm text-foreground";
  return <Text class={className}>{children}</Text>;
}

/** A table of the app's rows: a bordered card. Screen readers hear the base roles. */
export function Table(props: TableProps) {
  const [, rest] = split(props, ["class"]);
  return <BaseTable {...rest} class={mergeClass(dataTableClasses.root, props.class)} />;
}

/** The header band. */
export function TableHeader(props: TableHeaderProps) {
  const [, rest] = split(props, ["class"]);
  return <BaseTableHeader {...rest} class={mergeClass(dataTableClasses.header, props.class)} />;
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
      class={mergeClass(`${dataTableClasses.header} border-border border-t`, props.class)}
    />
  );
}

/** A row: a hairline and an optional selected fill. */
export function TableRow(props: TableRowProps) {
  const [, rest] = split(props, ["class", "selected"]);
  const rowClass = mergeClass(
    dataTableClasses.row,
    props.selected ? dataTableClasses.rowSelected : undefined,
  );
  return (
    <BaseTableRow {...rest} class={mergeClass(tableRowClass, mergeClass(rowClass, props.class))} />
  );
}

/** A column's header cell. */
export function TableHead(props: TableHeadProps) {
  const [, rest] = split(props, ["class", "children"]);
  return (
    <BaseTableHead {...rest} class={mergeClass(`${dataTableClasses.cell} py-2`, props.class)}>
      {textOf(props.children, "head")}
    </BaseTableHead>
  );
}

/** A body or footer cell. */
export function TableCell(props: TableCellProps) {
  const [, rest] = split(props, ["class", "children"]);
  return (
    <BaseTableCell
      {...rest}
      class={mergeClass(`${dataTableClasses.cell} flex-1 py-2`, props.class)}
    >
      {textOf(props.children, "cell")}
    </BaseTableCell>
  );
}

/** The caption under the rows. */
export function TableCaption(props: TableCaptionProps) {
  const [, rest] = split(props, ["class", "children"]);
  return (
    <BaseTableCaption {...rest} class={mergeClass("px-2 py-2", props.class)}>
      {textOf(props.children, "caption")}
    </BaseTableCaption>
  );
}
