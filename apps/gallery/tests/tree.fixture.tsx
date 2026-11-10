import { Tree } from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import type { TreeItem } from "nsh/base";

const files: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "main", label: "main.rs" },
      { id: "skip", label: "skip.rs", disabled: true },
      { id: "lib", label: "lib.rs" },
    ],
  },
  { id: "notes", label: "notes.txt" },
];

function App() {
  const expanded = signal<string[]>([]);
  const selected = signal("none");
  const action = signal("none");
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Tree
        testID="files"
        accessibilityLabel="Files"
        items={files}
        expanded={expanded()}
        selected={selected() === "none" ? null : selected()}
        onExpandedChange={({ expanded: next }) => expanded.set(next)}
        onSelectedChange={({ selected: next }) => selected.set(next)}
        onAction={({ id }) => action.set(id)}
        style={{ width: 240, height: 220 }}
      />
      <Tree
        accessibilityLabel="Locked files"
        items={[{ id: "lock", label: "Locked folder", children: [{ id: "x", label: "Hidden" }] }]}
        disabled
        style={{ width: 240, height: 64 }}
      />
      <Text>expanded={expanded().join(",")}</Text>
      <Text>selected={selected()}</Text>
      <Text>action={action()}</Text>
    </View>
  );
}

mount(App);
