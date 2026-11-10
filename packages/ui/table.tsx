// Source: examples/nsh-gallery-ui/data-table.ts @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, split, Text } from "nsh";
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

/**
 * Theme layer on `nsh/base` Table: a bordered card. Sorting, resize, and selection
 * belong to `DataTable`, a different base control.
 */
export type TableProps = BaseTableProps;

/** The header band: a hairline under a quiet fill. */
export type TableHeaderProps = BaseTableHeaderProps;

/** The body group. */
export type TableBodyProps = BaseTableBodyProps;

/** The footer band: a hairline over a quiet fill. */
export type TableFooterProps = BaseTableFooterProps;

/**
 * A row. `selected` is this wrapper's (base has no selected flag): the reference's
 * `rowSelected`, `primary` at 12%.
 */
export type TableRowProps = BaseTableRowProps & {
  /** Selected, as shadcn `data-[state=selected]`. */
  selected?: boolean;
};

/** A column header. A string is drawn in the quiet header text. */
export type TableHeadProps = Omit<BaseTableHeadProps, "children"> & {
  /** The header. A string is drawn muted and medium. */
  children?: string | JSX.Element;
};

/** A cell. A string is drawn in the body text. */
export type TableCellProps = Omit<BaseTableCellProps, "children"> & {
  /** The cell. A string is drawn in the foreground. */
  children?: string | JSX.Element;
};

/** The caption under the table. A string is drawn muted. */
export type TableCaptionProps = Omit<BaseTableCaptionProps, "children"> & {
  /** The caption. A string is drawn muted, under the rows. */
  children?: string | JSX.Element;
};

/** Rows ease their fill. `motion-reduce` drops it. */
export const tableRowClass = "transition-colors duration-150 motion-reduce:transition-none";

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

function mergeClass(base: string | undefined, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
}

/** The card. `rounded-lg` is `radius.control`; the reference's root is `border` on `background`. */
function tableChrome(): ViewStyle {
  return {
    width: "100%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radius.control,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: colors.background,
  };
}

/** Header band: `bg-muted/50` and a line under it. */
function headerChrome(): ViewStyle {
  return {
    backgroundColor: alpha(colors.muted, 0.5),
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderBottomColor: colors.border,
  };
}

/** Footer band: the same quiet fill, lined off from the body. */
function footerChrome(): ViewStyle {
  return {
    backgroundColor: alpha(colors.muted, 0.5),
    borderTopWidth: 1,
    borderStyle: "solid",
    borderTopColor: colors.border,
  };
}

/** A row's hairline. `border` at 60% is the reference's `border-border/60`. */
function rowChrome(selected?: boolean): ViewStyle {
  return {
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderBottomColor: alpha(colors.border, 0.6),
    ...(selected ? { backgroundColor: alpha(colors.primary, 0.12) } : {}),
  };
}

/** Pointer over a row: `bg-muted/60`. */
function rowHover(): ViewStyle {
  return { backgroundColor: alpha(colors.muted, 0.6) };
}

/**
 * A cell shares the row. `flex` is layout, not the reference's (DataTable sizes its own
 * columns); without it a composition row collapses to its text.
 */
function cellChrome(): ViewStyle {
  return {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
  };
}

function captionChrome(): ViewStyle {
  return { paddingHorizontal: 8, paddingVertical: 8 };
}

function textOf(children: string | JSX.Element | undefined, kind: "head" | "cell" | "caption") {
  if (typeof children !== "string") return children;
  const style =
    kind === "head"
      ? { fontSize: 13, fontWeight: "500" as const, color: colors.mutedForeground }
      : kind === "caption"
        ? { fontSize: 12, color: colors.mutedForeground }
        : { fontSize: 13, color: colors.foreground };
  return <Text style={style}>{children}</Text>;
}

/** A table of the app's rows: a bordered card. Screen readers hear the base roles. */
export function Table(props: TableProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
  ]);
  // Read in the JSX attribute, not in a spread: a spread snapshots the colors.
  const chrome = computed(tableChrome);
  return (
    <BaseTable
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(chrome(), props.style)}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    />
  );
}

/** The header band. */
export function TableHeader(props: TableHeaderProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
  ]);
  const chrome = computed(headerChrome);
  return (
    <BaseTableHeader
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(chrome(), props.style)}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    />
  );
}

/** The body group. No chrome of its own: the rows carry the lines. */
export function TableBody(props: TableBodyProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
  ]);
  return (
    <BaseTableBody
      {...rest}
      class={props.class ?? undefined}
      style={props.style}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    />
  );
}

/** The footer band. */
export function TableFooter(props: TableFooterProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
  ]);
  const chrome = computed(footerChrome);
  return (
    <BaseTableFooter
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(chrome(), props.style)}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    />
  );
}

/** A row: a hairline, a quiet hover, and an optional selected fill. */
export function TableRow(props: TableRowProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "selected",
  ]);
  const chrome = computed(() => rowChrome(props.selected));
  const hover = computed(rowHover);
  return (
    <BaseTableRow
      {...rest}
      class={mergeClass(tableRowClass, props.class)}
      style={mergeStyle(chrome(), props.style)}
      hoverStyle={mergeStyle(hover(), props.hoverStyle)}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    />
  );
}

/** A column's header cell. */
export function TableHead(props: TableHeadProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "children",
  ]);
  return (
    <BaseTableHead
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(cellChrome(), props.style)}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    >
      {textOf(props.children, "head")}
    </BaseTableHead>
  );
}

/** A body or footer cell. */
export function TableCell(props: TableCellProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "children",
  ]);
  return (
    <BaseTableCell
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(cellChrome(), props.style)}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    >
      {textOf(props.children, "cell")}
    </BaseTableCell>
  );
}

/** The caption under the rows. */
export function TableCaption(props: TableCaptionProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "children",
  ]);
  return (
    <BaseTableCaption
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(captionChrome(), props.style)}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusStyle={props.focusStyle}
      disabledStyle={props.disabledStyle}
    >
      {textOf(props.children, "caption")}
    </BaseTableCaption>
  );
}
