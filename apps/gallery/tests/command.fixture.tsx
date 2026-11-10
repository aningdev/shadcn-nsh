import { Command } from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import type { CommandItem } from "nsh/base";

const items: CommandItem[] = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "theme", label: "Toggle Theme", group: "View", keywords: ["dark", "light"] },
];

function App() {
  const chosen = signal("none");
  const hi = signal("none");
  const query = signal("");
  const cancel = signal(0);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Command
        testID="palette"
        items={items}
        autoFocus
        accessibilityLabel="Commands"
        searchAccessibilityLabel="Search commands"
        onSelect={({ id }) => chosen.set(id)}
        onHighlightChange={({ highlighted }) => hi.set(highlighted ?? "none")}
        onQueryChange={({ query: next }) => query.set(next)}
        onCancel={() => cancel.set(cancel() + 1)}
        style={{ width: 280, height: 280 }}
      />
      <Text>chosen={chosen()}</Text>
      <Text>hi={hi()}</Text>
      <Text>query={query()}</Text>
      <Text>cancel={cancel()}</Text>
    </View>
  );
}

mount(App);
