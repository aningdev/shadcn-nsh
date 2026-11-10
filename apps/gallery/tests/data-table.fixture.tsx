import { DataTable } from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton, type DataTableColumn } from "nsh/base";

const columns: DataTableColumn[] = [
  { key: "name", title: "Name", width: 100 },
  { key: "city", title: "City", width: 80 },
  { key: "score", title: "Score", width: 70, align: "end", sortable: true },
];

const rows = [
  { name: "Ada", city: "Oslo", score: 12 },
  { name: "Linus", city: "Lima", score: 8 },
  { name: "Grace", city: "Kyoto", score: -3 },
];

const cellColumns: DataTableColumn[] = [
  { key: "name", title: "Name", width: 100 },
  { key: "city", title: "City", width: 100 },
];

const cellRows = [
  { name: "Nia", city: "Oslo" },
  { name: "Ken", city: "Lima" },
];

function App() {
  const row = signal("none");
  const sort = signal("none");
  const locked = signal(false);
  const cell = signal("none");
  return (
    <View>
      <DataTable
        accessibilityLabel="People"
        style={{ width: 280, height: 160 }}
        columns={columns}
        data={rows}
        rowSelectable={!locked()}
        onSelectionChange={(e) =>
          row.set(e.selection?.row == null ? "none" : String(e.selection.row))
        }
        onSortChange={(e) =>
          sort.set(e.sort ? `${e.sort.key}:${e.sort.direction ?? "ascending"}` : "none")
        }
      />
      <Text>{`sel=${row()}`}</Text>
      <Text>{`sort=${sort()}`}</Text>
      <BaseButton onPress={() => locked.set(true)}>
        <Text>Lock</Text>
      </BaseButton>

      <DataTable
        accessibilityLabel="Cells"
        style={{ width: 240, height: 120 }}
        columns={cellColumns}
        data={cellRows}
        cellSelectable
        rowHeader={false}
        onSelectionChange={(e) => {
          const next = e.selection;
          cell.set(next?.row == null ? "none" : `${next.row},${next.column ?? ""}`);
        }}
      />
      <Text>{`cell=${cell()}`}</Text>
    </View>
  );
}

mount(App);
