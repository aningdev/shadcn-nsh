// DataTable: selection, stripe, sort, a fixed column, and a selected cell, on one 390-wide page.
import { colors } from "@shadcn-nsh/theme";
import { DataTable } from "@shadcn-nsh/ui";
import { Text, View, mount } from "nsh";
import type { DataTableColumn } from "nsh/base";

import { Page, Panel } from "./demo-kit";

const columns: DataTableColumn[] = [
  { key: "name", title: "Name", width: 96, fixed: true },
  { key: "city", title: "City", width: 84 },
  {
    key: "score",
    title: "Score",
    width: 72,
    align: "end",
    sortable: true,
    positiveClass: "text-primary",
    negativeClass: "text-destructive",
  },
  { key: "role", title: "Role", width: 96 },
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

/** The table's box. Wider than the viewport so the fixed edge is on screen. */
const frame = { width: 280, height: 140 };

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
          style={{ width: 280, height: 140 }}
          columns={columns}
          data={rows}
          stripe
          sort={{ key: "score", direction: "descending" }}
          selection={{ row: 2 }}
        />
      </View>
      <Caption>Selected cell</Caption>
      <View style={{ width: 280, height: 108 }}>
        <DataTable
          accessibilityLabel="Cells"
          style={{ width: 280, height: 108 }}
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
