import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import {
  Table as BaseTable,
  TableBody as BaseTableBody,
  TableCaption as BaseTableCaption,
  TableCell as BaseTableCell,
  TableFooter as BaseTableFooter,
  TableHead as BaseTableHead,
  TableHeader as BaseTableHeader,
  TableRow as BaseTableRow,
} from "nsh/base";

export function Table(props: { accessibilityLabel?: string | null; children?: JSX.Element }) {
  return (
    <BaseTable
      accessibilityLabel={props.accessibilityLabel}
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {props.children}
    </BaseTable>
  );
}

export function TableHeader(props: { children?: JSX.Element }) {
  return (
    <BaseTableHeader style={{ backgroundColor: colors.muted }}>{props.children}</BaseTableHeader>
  );
}

export function TableBody(props: { children?: JSX.Element }) {
  return <BaseTableBody>{props.children}</BaseTableBody>;
}

export function TableFooter(props: { children?: JSX.Element }) {
  return (
    <BaseTableFooter style={{ backgroundColor: colors.muted }}>{props.children}</BaseTableFooter>
  );
}

export function TableRow(props: { children?: JSX.Element }) {
  return (
    <BaseTableRow
      style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      {props.children}
    </BaseTableRow>
  );
}

export function TableHead(props: { children?: JSX.Element }) {
  return (
    <BaseTableHead style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }}>
      {props.children}
    </BaseTableHead>
  );
}

export function TableCell(props: { children?: JSX.Element }) {
  return (
    <BaseTableCell style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }}>
      {props.children}
    </BaseTableCell>
  );
}

export function TableCaption(props: { children?: JSX.Element }) {
  return <BaseTableCaption style={{ padding: 12 }}>{props.children}</BaseTableCaption>;
}
