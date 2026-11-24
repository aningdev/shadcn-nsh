// The official command palette scene (`references/nsh/website/demos/el-command.tsx`) with this
// library's Command: sections with headings, shortcuts as the platform writes them, a disabled
// command, the appearance in effect checked, keywords that find a command by another word, and an
// inspector with the highlight, the query and the events.
import {
  Download,
  FileCode,
  FileJson,
  FileText,
  Folder,
  Image,
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
import type { CommandItem, CommandRef } from "nsh/base";

import { Command, CommandEmpty, CommandHeading, CommandRow } from "@/packages/ui/command";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui, wide } from "./stage";

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

// A palette over a list no one reads to the end: fifty folders of a hundred files, found by name
// or by extension.
const EXTENSIONS = ["rs", "tsx", "md", "json", "png"] as const;
const FILES: CommandItem[] = Array.from({ length: 5000 }, (_, index) => {
  const extension = EXTENSIONS[index % EXTENSIONS.length];
  const folder = `module-${String(Math.floor(index / 100) + 1).padStart(2, "0")}`;
  return {
    id: `file-${index}`,
    label: `${folder}/file-${index + 1}.${extension}`,
    group: folder,
    keywords: [extension],
  };
});
const fileIcons: Record<string, IconNode> = {
  rs: FileCode,
  tsx: FileCode,
  md: FileText,
  json: FileJson,
  png: Image,
};
const files = signal(FILES.length);
let archive: CommandRef | undefined;

/** The extension of a file's label: what picks its icon. */
const extensionOf = (label: string) => label.slice(label.lastIndexOf(".") + 1);

function App() {
  keymap.bind("mod+k", () => palette?.focus());
  return (
    <DemoPage title="Command">
      <Text style={{ color: ui().muted }}>
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
            style={{ height: desktop ? 360 : 400 }}
            searchPrefix={<Icon icon={Search} size={16} tint={ui().muted} />}
            empty={<CommandEmpty label="No commands match" />}
            renderGroup={(group) => <CommandHeading group={group} />}
            renderItem={(entry) => (
              <CommandRow
                entry={entry}
                icon={icons[entry.id]}
                detail={entry.id === "open" ? "A folder on this Mac" : undefined}
                note={entry.disabled ? "Pro" : undefined}
              />
            )}
          />
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="A long list" axis="block">
          <Text style={{ color: ui().muted }}>
            Five thousand files in fifty folders: the field finds one by name or by extension, and
            the count under it is the palette's own, from its ref.
          </Text>
          <View style={{ width: wide() ? 380 : undefined, alignSelf: "flex-start" }}>
            <Command
              ref={(r) => (archive = r)}
              items={FILES}
              accessibilityLabel="Files"
              searchAccessibilityLabel="Search files"
              placeholder="Search files by name or extension…"
              listClass="h-60"
              onQueryChange={() => void archive?.matchedCount().then((count) => files.set(count))}
              empty={<CommandEmpty label="No file matches" />}
              renderItem={(entry) => (
                <CommandRow entry={entry} icon={fileIcons[extensionOf(entry.label)]} />
              )}
            />
            <Text
              style={{
                paddingTop: 8,
                fontSize: 12,
                color: ui().muted,
                fontVariant: ["tabular-nums"],
              }}
            >
              {`${files().toLocaleString("en-US")} of ${FILES.length.toLocaleString("en-US")} files, 50 folders`}
            </Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
