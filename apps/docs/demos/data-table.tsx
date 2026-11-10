import { colors } from "@shadcn-nsh/theme";
import { Text, View, mount } from "nsh";
import type { DataTableColumn } from "nsh/base";

import { DataTable } from "@/packages/ui/data-table";

const columns: DataTableColumn[] = [
  { key: "name", title: "Name", width: 120, fixed: true },
  { key: "city", title: "City", width: 100 },
  {
    key: "score",
    title: "Score",
    width: 72,
    align: "end",
    sortable: true,
    positiveClass: "text-primary",
    negativeClass: "text-destructive",
  },
];

const rows = [
  { name: "Ada", city: "Oslo", score: 12 },
  { name: "Grace", city: "Kyoto", score: -3 },
  { name: "Linus", city: "Lima", score: 8 },
];

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>DataTable</Text>
      <DataTable
        accessibilityLabel="People"
        style={{ width: 300, height: 160 }}
        columns={columns}
        data={rows}
        stripe
        sort={{ key: "score", direction: "descending" }}
        selection={{ row: 1 }}
      />
    </View>
  );
}

mount(App);
