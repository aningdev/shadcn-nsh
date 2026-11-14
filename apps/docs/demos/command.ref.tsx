// The reference of `command.tsx`: `commandClasses` and the row parts on `nsh/base`'s Command, the
// way the official example (`references/nsh/website/demos/el-command.tsx`) writes it. It differs
// from the component page only in what it names: the classes of each part.
import { colors } from "@shadcn-nsh/theme";
import {
  Download,
  FileText,
  Folder,
  MessageSquare,
  Moon,
  PanelLeft,
  Plus,
  Replace,
  Search,
  Share,
  Sun,
  Terminal,
  type IconNode,
} from "lucide";
import { keymap, mount, signal, Text, View } from "nsh";
import { Command, type CommandItem, type CommandRef } from "nsh/base";

import { CommandEmpty, CommandHeading, CommandRow, commandClasses } from "@/packages/ui/command";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

// A command palette: the command owns the filtering, the highlight, the keys and the semantics;
// every pixel is the palette's classes and its rows.
const icons: Record<string, IconNode> = {
  new: Plus,
  open: Folder,
  save: Download,
  share: Share,
  find: Search,
  replace: Replace,
  terminal: Terminal,
  sidebar: PanelLeft,
  dark: Moon,
  light: Sun,
  docs: FileText,
  feedback: MessageSquare,
};

const appearance = signal<"dark" | "light">("dark");
const highlighted = signal<string | null>(null);
const query = signal("");
const events = signal<string[]>([]);
const log = (line: string) => events.set([line, ...events()].slice(0, 4));
let palette: CommandRef | undefined;

const items = (): CommandItem[] => [
  { id: "new", label: "New File", group: "File", shortcut: "mod+n" },
  { id: "open", label: "Open Folder…", group: "File", shortcut: "mod+o" },
  { id: "save", label: "Save All", group: "File", shortcut: "mod+alt+s" },
  { id: "share", label: "Share Project", group: "File", disabled: true },
  {
    id: "find",
    label: "Find in Files",
    group: "Edit",
    shortcut: "mod+shift+f",
    keywords: ["search", "grep"],
  },
  { id: "replace", label: "Replace in Files", group: "Edit", shortcut: "mod+shift+h" },
  {
    id: "terminal",
    label: "Toggle Terminal",
    group: "View",
    shortcut: "ctrl+j",
    keywords: ["console", "shell"],
  },
  { id: "sidebar", label: "Toggle Sidebar", group: "View", shortcut: "mod+b" },
  {
    id: "dark",
    label: "Dark Appearance",
    group: "View",
    keywords: ["theme"],
    checked: appearance() === "dark",
  },
  {
    id: "light",
    label: "Light Appearance",
    group: "View",
    keywords: ["theme"],
    checked: appearance() === "light",
  },
  {
    id: "docs",
    label: "Open Documentation",
    group: "Help",
    keywords: ["guide", "manual"],
  },
  { id: "feedback", label: "Send Feedback", group: "Help" },
];

function App() {
  keymap.bind("mod+k", () => palette?.focus());
  return (
    <DemoPage title="Command">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? `Type to filter, the arrows to move, Return to run, Escape to clear; ${keymap.label("mod+k")} focuses it`
          : "Type to filter, tap a command to run it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="highlighted">
              <Text class="text-foreground" style={{ fontSize: 13 }}>
                {highlighted() ?? "none"}
              </Text>
            </Panel>
            <Panel title="query">
              <Text class="text-foreground" style={{ fontSize: 13 }}>
                {query() ? `“${query()}”` : "empty"}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ width: wide() ? 380 : undefined, alignSelf: wide() ? "center" : "stretch" }}>
          <Command
            ref={(r) => (palette = r)}
            items={items()}
            query={query()}
            onQueryChange={({ query: next }) => query.set(next)}
            onHighlightChange={({ highlighted: next }) => highlighted.set(next)}
            onCancel={() => log("onCancel()")}
            onSelect={({ id }) => {
              if (id === "dark" || id === "light") appearance.set(id);
              log(`onSelect({ id: "${id}" })`);
            }}
            accessibilityLabel="Commands"
            searchAccessibilityLabel="Search commands"
            class={commandClasses.root}
            searchBarClass={commandClasses.searchBar}
            searchClass={commandClasses.search}
            listClass={commandClasses.list}
            itemClass={commandClasses.item}
            groupClass={commandClasses.group}
            separatorClass={commandClasses.separator}
            placeholder="Type a command or search…"
            style={{ height: desktop ? 360 : 400 }}
            searchPrefix={<Icon icon={Search} size={16} tint={colors.muted} />}
            empty={<CommandEmpty label="No commands match" />}
            renderGroup={(group) => <CommandHeading group={group} />}
            renderItem={(entry) => (
              <CommandRow
                entry={entry}
                icon={icons[entry.id]}
                note={entry.disabled ? "Pro" : undefined}
              />
            )}
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
