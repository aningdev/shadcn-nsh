import { mount, signal, Text, View } from "nsh";
import type { CommandItem } from "nsh/base";

import { Command } from "@/packages/ui/command";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const items: CommandItem[] = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "theme", label: "Toggle Theme", group: "View", checked: true },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];

function App() {
  const chosen = signal("none");
  return (
    <DemoPage title="Command" note={() => `Chosen: ${chosen()}`}>
      <DemoCard>
        <DemoSection title="Default">
          <View style={{ gap: 8 }}>
            <Command
              items={items}
              accessibilityLabel="Commands"
              searchAccessibilityLabel="Search commands"
              onSelect={({ id }) => chosen.set(id)}
              style={{ width: 320, maxHeight: 280 }}
            />
            <Text style={{ fontSize: 13 }}>{`Chosen: ${chosen()}`}</Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
