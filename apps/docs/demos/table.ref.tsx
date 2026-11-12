import { mount, Text, View } from "nsh";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "nsh/base";

import { dataTableClasses } from "@/packages/ui/data-table";
import { tableRowClass } from "@/packages/ui/table";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const invoices = [
  { id: "INV001", status: "Paid", amount: 250 },
  { id: "INV002", status: "Pending", amount: 150 },
  { id: "INV003", status: "Unpaid", amount: 350 },
];

function Cell(props: { head?: boolean; children: string }) {
  const Part = props.head ? TableHead : TableCell;
  const className = props.head
    ? `${dataTableClasses.cell} py-2 text-sm font-medium text-muted-foreground`
    : `${dataTableClasses.cell} py-2 flex-1 text-sm text-foreground`;
  return (
    <Part class={className}>
      <Text class={props.head ? undefined : "text-foreground text-sm"}>{props.children}</Text>
    </Part>
  );
}

function App() {
  const total = invoices.reduce((sum, row) => sum + row.amount, 0);
  return (
    <DemoPage title="Table">
      <DemoCard>
        <DemoSection title="Invoices">
          <Table
            accessibilityLabel="Recent invoices"
            class={dataTableClasses.root ?? undefined}
            style={{ width: 320 }}
          >
            <TableHeader class={dataTableClasses.header ?? undefined}>
              <TableRow class={dataTableClasses.row ?? undefined}>
                <Cell head>Invoice</Cell>
                <Cell head>Status</Cell>
                <Cell head>Amount</Cell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((row) => (
                <TableRow
                  class={`${tableRowClass} ${dataTableClasses.row} ${row.status === "Paid" ? dataTableClasses.rowSelected : ""}`}
                >
                  <Cell>{row.id}</Cell>
                  <Cell>{row.status}</Cell>
                  <Cell>{`$${row.amount.toFixed(2)}`}</Cell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter class={`${dataTableClasses.header ?? ""} border-border border-t`}>
              <TableRow class={dataTableClasses.row ?? undefined}>
                <Cell head>Total</Cell>
                <Cell>{""}</Cell>
                <Cell>{`$${total.toFixed(2)}`}</Cell>
              </TableRow>
            </TableFooter>
            <TableCaption class="px-2 py-2">
              <Text class="text-muted-foreground text-xs">A list of your recent invoices.</Text>
            </TableCaption>
          </Table>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
