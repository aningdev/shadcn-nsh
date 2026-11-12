import { mount } from "nsh";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/packages/ui/table";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const invoices = [
  { id: "INV001", status: "Paid", amount: 250 },
  { id: "INV002", status: "Pending", amount: 150 },
  { id: "INV003", status: "Unpaid", amount: 350 },
];

function App() {
  const total = invoices.reduce((sum, row) => sum + row.amount, 0);
  return (
    <DemoPage title="Table">
      <DemoCard>
        <DemoSection title="Invoices">
          <Table accessibilityLabel="Recent invoices" style={{ width: 320 }}>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((row) => (
                <TableRow selected={row.status === "Paid"}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{`$${row.amount.toFixed(2)}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableHead>Total</TableHead>
                <TableCell>{""}</TableCell>
                <TableCell>{`$${total.toFixed(2)}`}</TableCell>
              </TableRow>
            </TableFooter>
            <TableCaption>A list of your recent invoices.</TableCaption>
          </Table>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
