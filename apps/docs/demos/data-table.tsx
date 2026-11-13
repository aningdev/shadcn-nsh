import { mount, View } from "nsh";
import type { DataTableColumn } from "nsh/base";

import { DataTable, dataTableFitPadding } from "@/packages/ui/data-table";

import { DemoCard, DemoPage, DemoSection } from "./kit";

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
    <DemoPage title="DataTable">
      <DemoCard>
        <DemoSection title="Default" axis="block">
          <View style={{ height: 200 }}>
            <DataTable
              columns={columns.map((c) => ({ ...c, fitPadding: dataTableFitPadding }))}
              data={people}
              stripe
              style={{ flex: 1 }}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
