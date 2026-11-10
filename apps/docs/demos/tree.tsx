import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import type { TreeItem } from "nsh/base";

import { Tree } from "@/packages/ui/tree";

const files: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "main", label: "main.rs" },
      { id: "skip", label: "skip.rs", disabled: true },
      { id: "ui", label: "ui", children: [{ id: "tree", label: "tree.rs" }] },
    ],
  },
  { id: "cargo", label: "Cargo.toml" },
];

function App() {
  const expanded = signal(["src"]);
  const selected = signal<string | null>("main");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Tree</Text>
      <Tree
        items={files}
        expanded={expanded()}
        selected={selected()}
        onExpandedChange={({ expanded: next }) => expanded.set(next)}
        onSelectedChange={({ selected: next }) => selected.set(next)}
        accessibilityLabel="Files"
        style={{ width: 280, height: 240 }}
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground, numberOfLines: 1 }}>
        Selected: {selected() ?? "none"}
      </Text>
    </View>
  );
}

mount(App);
