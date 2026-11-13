// The data-table demo with `width: "100%"` on its wrapper instead of `alignSelf: "stretch"`:
// the audit's experiment for the empty table (see docs/specs/demo-audit.md). Not a demo.
import { mount, View } from "nsh";
import type { DataTableColumn } from "nsh/base";

import { DataTable, dataTableFitPadding } from "@/packages/ui/data-table";

type Person = { id: number; name: string; city: string; score: number };
const people: Person[] = [
  { id: 1, name: "Ada", city: "Oslo", score: 92 },
  { id: 2, name: "Alan", city: "Lima", score: 81 },
  { id: 3, name: "Grace", city: "Kyoto", score: 97 },
  { id: 4, name: "Linus", city: "Cairo", score: 74 },
];
const columns: DataTableColumn[] = [
  { key: "id", title: "ID", width: 56, align: "end", sortable: true },
  { key: "name", title: "Name", width: 120, sortable: true },
  { key: "city", title: "City", width: 100, sortable: true },
  { key: "score", title: "Score", width: 72, align: "end", sortable: true },
];

function App() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ height: 200, width: "100%" }}>
        <DataTable
          columns={columns.map((c) => ({ ...c, fitPadding: dataTableFitPadding }))}
          data={people}
          stripe
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

mount(App);
