// Source: examples/nsh-gallery-ui/data-table.ts @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors, radius } from "@shadcn-nsh/theme";
import type { StyleProp, TextStyle } from "nsh";
import { computed, split } from "nsh";
import {
  DataTable as BaseDataTable,
  type DataTableClasses,
  type DataTableProps as BaseDataTableProps,
  type DataTableStyles,
} from "nsh/base";

import { isPointer, TOUCH_TARGET } from "./lib/density";

/**
 * Theme layer on `nsh/base` DataTable. Every base prop passes through.
 * Sorting, selection, resize, and column moves stay in base.
 */
export type DataTableProps<T = any> = BaseDataTableProps<T>;

/** Part classes and styles. State variants that a style cannot express stay classes. */
export type DataTableLook = {
  /** Default part classes, appended before the consumer's. */
  classes: DataTableClasses;
  /** Default part styles from the theme. The consumer wins per key. */
  styles: DataTableStyles;
};

/**
 * Extra room, in points, for this layer's cell padding when a column is fitted
 * to its text. Set it on a column's `fitPadding`; the table does not apply it itself.
 */
export const dataTableFitPadding = 16;

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

/** A part style: drop it on `null`, else the consumer wins per key. */
function mergeStyles(base: DataTableStyles, consumer?: DataTableStyles | null): DataTableStyles {
  if (consumer == null) return base;
  const merged: DataTableStyles = { ...base };
  for (const key of Object.keys(consumer) as (keyof DataTableStyles)[]) {
    const next = consumer[key];
    if (next === undefined) continue;
    if (next === null) {
      delete merged[key];
      continue;
    }
    const prior = merged[key];
    merged[key] = prior != null ? [prior, next] : next;
  }
  return merged;
}

/**
 * The reference table, in neutral tokens. Call it where the theme is read.
 * Row height is not set here: base virtualizes rows at a fixed 32, which is not a text minimum.
 */
function look(): DataTableLook {
  // Cell padding 8; a title keeps 4 at the end for the sort button; the title row's gap is 4.
  const pad = 8;
  const titleEnd = 4;
  const gap = 4;
  const line = {
    borderStyle: "solid" as const,
    borderColor: colors.border,
  };
  const hairline: StyleProp<TextStyle> = {
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderBottomColor: alpha(colors.border, 0.6),
  };
  return {
    classes: {
      // Hover and pressed fills, and the sorted chevron, are variants on one part.
      // A style would outrank them. The terminal branch (handle hidden until hover) is dropped.
      sortIndicator: "rounded hover:bg-foreground/10 active:bg-foreground/15",
      sortAscending:
        "text-muted-foreground opacity-60 selected:text-foreground selected:opacity-100",
      sortDescending:
        "text-muted-foreground opacity-60 selected:text-foreground selected:opacity-100",
      resizeHandle: "bg-border group-hover:bg-primary group-active:bg-primary",
    },
    styles: {
      root: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: colors.border,
        borderRadius: radius.control,
        borderCurve: "continuous",
        overflow: "hidden",
        backgroundColor: colors.background,
        color: colors.foreground,
      },
      header: {
        backgroundColor: alpha(colors.muted, 0.5),
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderBottomColor: colors.border,
        color: colors.mutedForeground,
      },
      headerCell: { paddingLeft: pad, paddingRight: titleEnd },
      headerContent: { gap },
      headerCellSelected: { backgroundColor: alpha(colors.primary, 0.1) },
      headerCellDragging: { opacity: 0.5 },
      groupCell: {
        ...line,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        paddingHorizontal: pad,
      },
      moveIndicator: { backgroundColor: colors.primary },
      row: hairline,
      rowOdd: { backgroundColor: alpha(colors.muted, 0.35) },
      rowHover: { backgroundColor: alpha(colors.muted, 0.6) },
      rowSelected: { backgroundColor: alpha(colors.primary, 0.12) },
      rowActive: { backgroundColor: alpha(colors.muted, 0.6) },
      cell: { paddingHorizontal: pad },
      cellSelected: { borderWidth: 1, borderStyle: "solid", borderColor: colors.primary },
      cellColumnSelected: { backgroundColor: alpha(colors.primary, 0.08) },
      cellActive: { borderWidth: 1, borderStyle: "solid", borderColor: alpha(colors.primary, 0.5) },
      rowHeader: { color: colors.mutedForeground },
      rowHeaderCorner: { backgroundColor: alpha(colors.muted, 0.5) },
      fixedEdge: { backgroundColor: colors.border },
      empty: { padding: pad, color: colors.mutedForeground },
    },
  };
}

/** The table's default part chrome. Call it where the theme is read. */
export function dataTableVariants(): DataTableLook {
  return look();
}

/** A table that scrolls both ways. Base owns selection, sorting, resize, and moving columns. */
export function DataTable<T>(props: DataTableProps<T>) {
  const [, rest] = split(props, ["classes", "styles", "rowHeight", "headerHeight"]);
  const chrome = computed(look);
  const finger = !isPointer();
  return (
    <BaseDataTable
      {...rest}
      rowHeight={props.rowHeight ?? (finger ? TOUCH_TARGET : undefined)}
      headerHeight={
        props.headerHeight !== undefined ? props.headerHeight : finger ? TOUCH_TARGET : undefined
      }
      classes={mergeClasses(chrome().classes, props.classes)}
      styles={mergeStyles(chrome().styles, props.styles)}
    />
  );
}
