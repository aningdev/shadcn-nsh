// The reference of `command.tsx`: `commandClasses` / `CommandRow` on `nsh/base`'s Command.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Command, type CommandItem } from "nsh/base";

import { CommandEmpty, CommandHeading, CommandRow, commandClasses } from "@/packages/ui/command";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const items: CommandItem[] = [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open File", group: "File", disabled: true },
  { id: "theme", label: "Toggle Theme", group: "View", checked: true },
  { id: "settings", label: "Settings", group: "View", shortcut: "mod+comma" },
];

function App() {
  const chosen = signal("none");
  const chrome = commandClasses;
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
              class={chrome.root}
              searchBarClass={chrome.searchBar}
              searchClass={chrome.search}
              listClass={chrome.list}
              itemClass={chrome.item}
              groupClass={chrome.group}
              separatorClass={chrome.separator}
              placeholder="Type a command or search…"
              searchPrefix={<Icon name="search" size={16} tint={colors.muted} />}
              renderItem={(entry) => <CommandRow entry={entry} />}
              renderGroup={(group) => <CommandHeading group={group} />}
              empty={<CommandEmpty label="No results." />}
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
