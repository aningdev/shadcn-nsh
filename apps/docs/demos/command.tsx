import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import type { CommandItem } from "nsh/base";

import { Command } from "@/packages/ui/command";

const commands: CommandItem[] = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "theme", label: "Toggle Theme", group: "View", checked: true },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];

function App() {
  const chosen = signal("none");
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Command</Text>
      <Command
        items={commands}
        accessibilityLabel="Commands"
        searchAccessibilityLabel="Search commands"
        onSelect={({ id }) => chosen.set(id)}
        style={{ width: 320 }}
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground, numberOfLines: 1 }}>
        Chosen: {chosen()}
      </Text>
    </View>
  );
}

mount(App);
