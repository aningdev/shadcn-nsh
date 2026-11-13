// The official table scene (`references/nsh/website/demos/el-table.tsx`) with this library's
// parts: four invoices, their status and method, a footer with the total and a caption under
// them, in the table's own card on a stage.
import { mount, Text } from "nsh";

import { controlSize } from "@/packages/ui/lib/surface";
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

import { DemoPage } from "./kit";
import { Stage } from "./stage";

// A few rows the app writes out: the parts give screen readers a table, the look gives it its
// card and its hairlines.
const invoices = [
  { id: "INV001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV002", status: "Pending", method: "Transfer", amount: 150 },
  { id: "INV003", status: "Unpaid", method: "Card", amount: 350 },
  { id: "INV004", status: "Paid", method: "Cash", amount: 450 },
];

/** A cell's text: the header's quiet label, the body's, and a figure at the trailing edge. */
function Cell(props: { head?: boolean; end?: boolean; children: string }) {
  const Part = props.head ? TableHead : TableCell;
  // The figures take a little more of the row than the names: a phone's card still holds them.
  return (
    <Part class="flex-1" style={{ flexGrow: props.end ? 1.3 : 1 }}>
      <Text
        class={props.head ? "text-muted-foreground font-medium" : "text-foreground"}
        style={{
          fontSize: controlSize.label - 1,
          textAlign: props.end ? "right" : "left",
          numberOfLines: 1,
        }}
      >
        {props.children}
      </Text>
    </Part>
  );
}

function App() {
  const total = invoices.reduce((sum, i) => sum + i.amount, 0);
  return (
    <DemoPage title="Table">
      <Stage width={520}>
        <Table accessibilityLabel="Recent invoices" class="overflow-hidden">
          <TableHeader>
            <TableRow>
              {["Invoice", "Status", "Method", "Amount"].map((title, i) => (
                <Cell head end={i === 3}>
                  {title}
                </Cell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow>
                <Cell>{inv.id}</Cell>
                <Cell>{inv.status}</Cell>
                <Cell>{inv.method}</Cell>
                <Cell end>{`$${inv.amount.toFixed(2)}`}</Cell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <Cell head>Total</Cell>
              <Cell>{""}</Cell>
              <Cell>{""}</Cell>
              <Cell end>{`$${total.toFixed(2)}`}</Cell>
            </TableRow>
          </TableFooter>
          <TableCaption>A list of your recent invoices.</TableCaption>
        </Table>
      </Stage>
    </DemoPage>
  );
}

mount(App);
