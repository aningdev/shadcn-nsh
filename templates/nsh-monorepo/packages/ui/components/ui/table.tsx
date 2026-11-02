import type { StyleProp, ViewStyle } from "nsh";
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

import { alpha, colors, radius } from "../../lib/theme";

/**
 * Theme layer on `nsh/base` Table parts (shadcn `bases/base` composition).
 * All base props + style hooks pass through; consumer styles shallow-merge
 * over wrapper chrome (consumer wins per key). No variant / size — matches
 * shadcn `bases/base` table.
 */
export type TableProps = BaseTableProps;
export type TableHeaderProps = BaseTableHeaderProps;
export type TableBodyProps = BaseTableBodyProps;
export type TableFooterProps = BaseTableFooterProps;
export type TableRowProps = BaseTableRowProps;
export type TableHeadProps = BaseTableHeadProps;
export type TableCellProps = BaseTableCellProps;
export type TableCaptionProps = BaseTableCaptionProps;

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
}

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

function hostHooks(
  props: {
    class?: string | null;
    style?: StyleProp<ViewStyle>;
    hoverStyle?: StyleProp<ViewStyle>;
    activeStyle?: StyleProp<ViewStyle>;
    focusStyle?: StyleProp<ViewStyle>;
    disabledStyle?: StyleProp<ViewStyle>;
  },
  chrome?: ViewStyle,
  hoverChrome?: ViewStyle,
) {
  const { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle } = props;
  return {
    class: mergeClass(undefined, className),
    style: mergeStyle(chrome, style),
    hoverStyle: mergeStyle(hoverChrome, hoverStyle),
    activeStyle: mergeStyle(undefined, activeStyle),
    focusStyle: mergeStyle(undefined, focusStyle),
    disabledStyle: mergeStyle(undefined, disabledStyle),
  };
}

/** Outer table chrome — bordered card, full width (shadcn container + table). */
function tableChrome(): ViewStyle {
  return {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    overflow: "hidden",
  };
}

function headerChrome(): ViewStyle {
  return { backgroundColor: colors.muted };
}

function footerChrome(): ViewStyle {
  return {
    backgroundColor: alpha(colors.muted, 0.5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };
}

function rowChrome(): ViewStyle {
  return {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };
}

function rowHoverChrome(): ViewStyle {
  return { backgroundColor: alpha(colors.muted, 0.5) };
}

function cellChrome(): ViewStyle {
  return {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    minHeight: 40,
  };
}

function captionChrome(): ViewStyle {
  return {
    paddingHorizontal: 8,
    paddingVertical: 12,
  };
}

export function Table(props: TableProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTable
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        tableChrome(),
      )}
    />
  );
}

export function TableHeader(props: TableHeaderProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableHeader
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        headerChrome(),
      )}
    />
  );
}

export function TableBody(props: TableBodyProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableBody
      {...rest}
      {...hostHooks({
        class: className,
        style,
        hoverStyle,
        activeStyle,
        focusStyle,
        disabledStyle,
      })}
    />
  );
}

export function TableFooter(props: TableFooterProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableFooter
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        footerChrome(),
      )}
    />
  );
}

export function TableRow(props: TableRowProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableRow
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        rowChrome(),
        rowHoverChrome(),
      )}
    />
  );
}

export function TableHead(props: TableHeadProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableHead
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        cellChrome(),
      )}
    />
  );
}

export function TableCell(props: TableCellProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableCell
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        cellChrome(),
      )}
    />
  );
}

export function TableCaption(props: TableCaptionProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;
  return (
    <BaseTableCaption
      {...rest}
      {...hostHooks(
        { class: className, style, hoverStyle, activeStyle, focusStyle, disabledStyle },
        captionChrome(),
      )}
    />
  );
}
