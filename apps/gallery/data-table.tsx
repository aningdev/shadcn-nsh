// DataTable: selection, stripe, sort, a fixed column, and a selected cell, on one 390-wide page.
import { colors } from "@shadcn-nsh/theme";
import { DataTable } from "@shadcn-nsh/ui";
import { Text, View, mount } from "nsh";
import type { DataTableColumn } from "nsh/base";

import { Page, Panel } from "./demo-kit";

const columns: DataTableColumn[] = [
  { key: "name", title: "Name", width: 60, fixed: true },
  { key: "city", title: "City", width: 56 },
  {
    key: "score",
    title: "Score",
    width: 110,
    align: "end",
    sortable: true,
    positiveClass: "text-primary",
    negativeClass: "text-destructive",
  },
  { key: "role", title: "Role", width: 88 },
];

const rows = [
  { name: "Ada", city: "Oslo", score: 12, role: "Engineer" },
  { name: "Linus", city: "Lima", score: 8, role: "Author" },
  { name: "Grace", city: "Kyoto", score: -3, role: "Admiral" },
];

const cellColumns: DataTableColumn[] = [
  { key: "name", title: "Name", width: 120 },
  { key: "city", title: "City", width: 120 },
];

const cellRows = [
  { name: "Nia", city: "Oslo" },
  { name: "Ken", city: "Lima" },
];

/** The table's box. Touch rows are 44, so the frame holds the header and every row. */
const frame = { width: 318, height: 196 };

function Caption(props: { children: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.mutedForeground, numberOfLines: 1 }}>
      {props.children}
    </Text>
  );
}

mount(() => (
  <Page>
    <Panel title="DataTable">
      <Caption>Stripe, selected row, Score descending</Caption>
      <View style={frame}>
        <DataTable
          accessibilityLabel="People"
          style={{ width: 318, height: 196 }}
          columns={columns}
          data={rows}
          stripe
          sort={{ key: "score", direction: "descending" }}
          selection={{ row: 2 }}
        />
      </View>
      <Caption>Selected cell</Caption>
      <View style={{ width: 318, height: 148 }}>
        <DataTable
          accessibilityLabel="Cells"
          style={{ width: 318, height: 148 }}
          columns={cellColumns}
          data={cellRows}
          cellSelectable
          rowHeader={false}
          columnSelectable={false}
          selection={{ row: 0, column: 1 }}
        />
      </View>
    </Panel>
  </Page>
));
