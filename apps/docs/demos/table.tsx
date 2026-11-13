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
import { Stage, wide } from "./stage";

// A few rows the app writes out: the parts give screen readers a table, the look gives it its
// card and its hairlines.
const invoices = [
  { id: "INV001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV002", status: "Pending", method: "Transfer", amount: 150 },
  { id: "INV003", status: "Unpaid", method: "Card", amount: 350 },
  { id: "INV004", status: "Paid", method: "Cash", amount: 450 },
];

/**
 * Each column's width: the official scene's in a wide window (the status takes the room the
 * three fixed columns leave); on a phone four equal columns, which wrap the status rather than
 * breaking its words.
 */
const widths = () =>
  wide() ? ["w-24", "flex-1", "w-24", "w-24"] : ["flex-1", "flex-1", "flex-1", "flex-1"];

/** A cell's text: the header's quiet label, the body's, and a figure at the trailing edge. */
function Cell(props: { i: number; head?: boolean; end?: boolean; children: string }) {
  const Part = props.head ? TableHead : TableCell;
  return (
    <Part class={widths()[props.i]}>
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
                <Cell i={i} head end={i === 3}>
                  {title}
                </Cell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow>
                <Cell i={0}>{inv.id}</Cell>
                <Cell i={1}>{inv.status}</Cell>
                <Cell i={2}>{inv.method}</Cell>
                <Cell i={3} end>{`$${inv.amount.toFixed(2)}`}</Cell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <Cell i={0} head>
                Total
              </Cell>
              <Cell i={1}>{""}</Cell>
              <Cell i={2}>{""}</Cell>
              <Cell i={3} end>{`$${total.toFixed(2)}`}</Cell>
            </TableRow>
          </TableFooter>
          <TableCaption>A list of your recent invoices.</TableCaption>
        </Table>
      </Stage>
    </DemoPage>
  );
}

mount(App);
