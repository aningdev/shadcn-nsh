import { mount, Text, View } from "nsh";
import type { CommandItem } from "nsh/base";

// Command palette: groups, shortcut, checked, disabled, and an empty query.
// The shot window is 390 wide, so each palette has a fixed width and labels stay one line.
import { colors } from "../../packages/theme";
import { Command } from "../../packages/ui";
import { Page, Panel } from "./demo-kit";

const commands: CommandItem[] = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "theme", label: "Toggle Theme", group: "View", checked: true, keywords: ["dark", "light"] },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];

const box = { width: 300 };

function Caption(props: { children: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.muted, numberOfLines: 1 }}>{props.children}</Text>
  );
}

function CommandPage() {
  return (
    <Page>
      <Panel title="Command">
        <View style={{ gap: 8 }}>
          <Caption>Groups, shortcut, checked, disabled</Caption>
          <Command
            style={box}
            items={commands}
            autoFocus
            accessibilityLabel="Commands"
            searchAccessibilityLabel="Search commands"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Caption>Empty query</Caption>
          <Command
            style={box}
            items={commands}
            query="zzzz"
            accessibilityLabel="No matches"
            searchAccessibilityLabel="Empty search"
          />
        </View>
      </Panel>
    </Page>
  );
}

mount(CommandPage);
