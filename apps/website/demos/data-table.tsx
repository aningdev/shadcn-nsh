// The official data table scene (`references/nsh/website/demos/el-data-table.tsx`) with this
// library's `DataTable`: two thousand rows, two columns pinned at the leading edge while the rest
// scroll, a sort the app applies and reports, selection by row, cell or column that the app owns,
// and an inspector beside it that follows both.
import { mount, signal, Text, View } from "nsh";
import type { DataTableColumn, DataTableSelection, DataTableSort } from "nsh/base";

import { DataTable } from "@/packages/ui/data-table";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Segmented, Split, ui, wide } from "./stage";

const NAMES = ["Ada", "Alan", "Grace", "Linus", "Margaret", "Dennis", "Barbara", "Ken"];
const CITIES = ["Oslo", "Lima", "Kyoto", "Cairo", "Perth", "Quito", "Turin", "Hanoi"];
const LEVELS = ["Staff", "Senior", "Mid"];

type Person = {
  id: number;
  name: string;
  city: string;
  team: string;
  level: string;
  joined: string;
  score: number;
  handle: string;
};

const people: Person[] = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  name: `${NAMES[i % NAMES.length]} ${i + 1}`,
  city: CITIES[(i * 7) % CITIES.length],
  team: `Team ${(i % 6) + 1}`,
  level: LEVELS[i % LEVELS.length],
  joined: `202${i % 6}-0${(i % 8) + 1}`,
  score: (i * 37) % 1000,
  handle: `@${NAMES[i % NAMES.length].toLowerCase()}${i + 1}`,
}));

// Two columns are pinned at the leading edge (`fixed: true`); the rest scroll sideways under
// them. The widths add up past the box, which is what makes the body scroll at all.
const columns: DataTableColumn[] = [
  { key: "id", title: "ID", width: 70, align: "end", fixed: true, sortable: true },
  { key: "name", title: "Name", width: 150, fixed: true, sortable: true },
  { key: "city", title: "City", width: 120, sortable: true },
  { key: "team", title: "Team", width: 110 },
  { key: "level", title: "Level", width: 90 },
  { key: "joined", title: "Joined", width: 110 },
  { key: "score", title: "Score", width: 90, align: "end", sortable: true },
  { key: "handle", title: "Handle", width: 140 },
];

// Sorting is the app's: the table reports the next sort (`onSortChange`),
// the app orders its rows and sets `sort`. Selection works the same way: the
// table reports what was picked (`onSelectionChange`) and the app decides what
// stays selected, which is how a selection of several would be built.
function App() {
  const mode = signal<"row" | "cell" | "column">("row");
  const sort = signal<DataTableSort | undefined>(undefined);
  const selection = signal<DataTableSelection | null>(null);
  const rows = signal<Person[]>(people);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  const sortBy = (next: DataTableSort | undefined) => {
    sort.set(next);
    if (!next) return rows.set(people);
    const key = next.key as keyof Person;
    const sign = next.direction === "descending" ? -1 : 1;
    rows.set([...people].sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0)));
  };

  const pick = (next: DataTableSelection | null) => {
    selection.set(next);
    log(`onSelectionChange: ${next ? JSON.stringify(next) : "none"}`);
  };

  const setMode = (next: "row" | "cell" | "column") => {
    mode.set(next);
    pick(null);
  };

  return (
    <DemoPage title="Data table">
      <Text style={{ color: ui().muted }}>
        Press a title to sort, drag its edge to resize or the title to move it
      </Text>

      <Split
        width={680}
        inspector={
          <>
            <Segmented
              label="selection"
              options={["row", "cell", "column"] as const}
              value={mode()}
              onChange={setMode}
            />
            <Log title="events" lines={events()} minHeight={96} />
          </>
        }
      >
        <DemoCard>
          <DemoSection title="Fixed columns" axis="block">
            <View style={{ height: wide() ? 300 : 280 }}>
              <DataTable
                columns={columns}
                data={rows()}
                rowHeader={false}
                stripe
                sort={sort()}
                onSortChange={({ sort: next }) => {
                  sortBy(next ?? undefined);
                  log(`onSortChange: ${next ? `${next.key} ${next.direction}` : "none"}`);
                }}
                onColumnResize={({ key, width }) =>
                  log(`onColumnResize: ${key} ${Math.round(width)}`)
                }
                style={{ flex: 1 }}
              />
            </View>
          </DemoSection>

          <DemoSection title="Selecting" axis="block">
            <View style={{ height: wide() ? 300 : 280 }}>
              <DataTable
                columns={columns}
                data={rows()}
                rowHeader={false}
                stripe
                rowSelectable={mode() === "row"}
                cellSelectable={mode() === "cell"}
                columnSelectable={mode() === "column"}
                selection={selection()}
                sort={sort()}
                onSortChange={({ sort: next }) => {
                  sortBy(next ?? undefined);
                  log(`onSortChange: ${next ? `${next.key} ${next.direction}` : "none"}`);
                }}
                onSelectionChange={({ selection: next }) => pick(next)}
                onRowPress={({ row, column }) =>
                  log(`onRowPress: row ${row}${column != null ? `, column ${column}` : ""}`)
                }
                onColumnPress={({ column }) =>
                  log(`onColumnPress: ${columns[column]?.title ?? column}`)
                }
                onColumnResize={({ key, width }) =>
                  log(`onColumnResize: ${key} ${Math.round(width)}`)
                }
                style={{ flex: 1 }}
              />
            </View>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
