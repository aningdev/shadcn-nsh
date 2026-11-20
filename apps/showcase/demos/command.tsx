// Command: the official gallery's scene (`references/nsh/examples/gallery/demos/CommandDemo.tsx`)
// with this library's `Command`. `nsh/base` still owns the filtering (natively, by label and
// keywords), the sections, the highlight, the keyboard and what screen readers hear; its rows are
// virtualized, so 5 000 files filter at every keystroke. The shell sets the search bar's row and
// the placeholder color, and `CommandRow` draws an icon, the label and the shortcut's keys.
import { colors, radius, terminal, TERMINAL_GAP } from "@shadcn-nsh/theme";
import {
  Archive,
  ArrowLeft,
  CircleX,
  Code,
  Download,
  Folder,
  Image,
  Mail,
  MessageSquare,
  Moon,
  Plus,
  SlidersHorizontal,
  Star,
  Sun,
  FileText,
  Search,
  type IconNode,
} from "lucide";
import { keymap, platform, signal, Text, View } from "nsh";
import { Button } from "nsh/base";

import {
  Command,
  CommandEmpty,
  CommandHeading,
  CommandRow,
  type CommandItem,
  type CommandRef,
} from "@/packages/ui/command";
import { Dialog, DialogContent } from "@/packages/ui/dialog";
import { fieldLook, fieldSize } from "@/packages/ui/input";
import { Kbd } from "@/packages/ui/kbd";
import { Icon } from "@/packages/ui/lib/icons";
import { backdrop } from "@/packages/ui/lib/popup";
import { Spinner } from "@/packages/ui/spinner";

import { DemoPage } from "../kit";
import { Card, LastEvent } from "./actions-shared";
import { CaptionRow, LabeledToggle } from "./navigation-shared";

const desktop = platform.desktop;

/** A command of the mail app's palette, with its icon. */
interface Action {
  item: CommandItem;
  icon: IconNode;
}

const ACTIONS: Action[] = [
  {
    item: {
      id: "go:inbox",
      label: "Go to Inbox",
      group: "Go to",
      shortcut: "mod+1",
      keywords: ["mail"],
    },
    icon: Mail,
  },
  {
    item: { id: "go:drafts", label: "Go to Drafts", group: "Go to", shortcut: "mod+2" },
    icon: FileText,
  },
  {
    item: { id: "go:archive", label: "Go to Archive", group: "Go to", shortcut: "mod+3" },
    icon: Archive,
  },
  {
    item: {
      id: "go:settings",
      label: "Open Settings",
      group: "Go to",
      shortcut: "mod+,",
      keywords: ["preferences"],
    },
    icon: SlidersHorizontal,
  },
  {
    item: {
      id: "new",
      label: "New Message",
      group: "Actions",
      shortcut: "mod+n",
      keywords: ["compose", "write"],
    },
    icon: Plus,
  },
  {
    item: { id: "reply", label: "Reply All", group: "Actions", shortcut: "mod+shift+r" },
    icon: ArrowLeft,
  },
  {
    item: { id: "archive", label: "Archive Conversation", group: "Actions", shortcut: "mod+e" },
    icon: Archive,
  },
  {
    item: {
      id: "star",
      label: "Star Conversation",
      group: "Actions",
      shortcut: "mod+shift+l",
      keywords: ["flag", "favorite"],
    },
    icon: Star,
  },
  {
    item: { id: "export", label: "Export Mailbox", group: "Actions", disabled: true },
    icon: Download,
  },
  {
    item: {
      id: "theme:dark",
      label: "Dark Appearance",
      group: "Appearance",
      keywords: ["theme", "night"],
    },
    icon: Moon,
  },
  {
    item: {
      id: "theme:light",
      label: "Light Appearance",
      group: "Appearance",
      keywords: ["theme", "day"],
    },
    icon: Sun,
  },
  {
    item: { id: "help:keys", label: "Keyboard Shortcuts", group: "Help", shortcut: "mod+/" },
    icon: Code,
  },
  { item: { id: "help:feedback", label: "Send Feedback", group: "Help" }, icon: MessageSquare },
];
const actionOf = (id: string) =>
  ACTIONS.find((a) => a.item.id === id || `recent:${a.item.id}` === id);

/** Folders a conversation moves to. */
const FOLDERS: { id: string; label: string; icon: IconNode; detail: string }[] = [
  { id: "inbox", label: "Inbox", icon: Mail, detail: "128 conversations" },
  { id: "archive", label: "Archive", icon: Archive, detail: "4 210 conversations" },
  { id: "projects/nsh", label: "Projects / NSH", icon: Folder, detail: "312 conversations" },
  { id: "projects/site", label: "Projects / Website", icon: Folder, detail: "87 conversations" },
  { id: "receipts", label: "Receipts", icon: FileText, detail: "640 conversations" },
  { id: "spam", label: "Spam", icon: CircleX, detail: "Moved by the server only" },
];

/** 5 000 files in 50 folders, found by name or by extension. */
const EXTENSIONS = ["rs", "tsx", "md", "json", "png"] as const;
const ICONS: Record<(typeof EXTENSIONS)[number], IconNode> = {
  rs: Code,
  tsx: Code,
  md: FileText,
  json: FileText,
  png: Image,
};
const FILES: CommandItem[] = Array.from({ length: 5000 }, (_, i) => {
  const ext = EXTENSIONS[i % EXTENSIONS.length];
  const folder = `module-${String(Math.floor(i / 100) + 1).padStart(2, "0")}`;
  return { id: `f${i}`, label: `${folder}/file-${i + 1}.${ext}`, group: folder, keywords: [ext] };
});

/** The people a server answers for. */
const PEOPLE = [
  "Ada Lovelace",
  "Alan Turing",
  "Brian Kernighan",
  "Bjarne Stroustrup",
  "Claude Shannon",
  "Dennis Ritchie",
  "Donald Knuth",
  "Edsger Dijkstra",
  "Frances Allen",
  "Grace Hopper",
  "Guido van Rossum",
  "Hedy Lamarr",
  "John McCarthy",
  "Ken Thompson",
  "Katherine Johnson",
  "Leslie Lamport",
  "Linus Torvalds",
  "Margaret Hamilton",
  "Niklaus Wirth",
  "Radia Perlman",
  "Rob Pike",
  "Shafi Goldwasser",
  "Sophie Wilson",
  "Tim Berners-Lee",
];
/** 5000 as "5 000". */
const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const roleOf = (i: number) => ["Engineering", "Research", "Design", "Operations"][i % 4];

/**
 * Command: a palette in a dialog (recent commands first, sections, shortcuts), an inline menu of
 * folders with the one in effect checked, 5 000 files filtered natively at every keystroke, and a
 * search the server answers.
 */
function Palette() {
  const open = signal(false);
  const recent = signal<string[]>(["new", "go:inbox"]);
  const highlighted = signal<string | null>(null);
  // Each opening starts from an empty query.
  const query = signal("");
  const show = (next: boolean) => {
    if (next) query.set("");
    open.set(next);
  };
  // Bound while the demo shows; the gallery's own Cmd+K (its search) comes back when it goes.
  keymap.bind("mod+k", () => show(!open()));
  const items = () => [
    ...recent().map((id) => ({ ...actionOf(id)!.item, id: `recent:${id}`, group: "Recent" })),
    ...ACTIONS.map((a) => a.item),
  ];
  const run = (id: string) => {
    const action = actionOf(id)!;
    const plain = action.item.id;
    recent.set([plain, ...recent().filter((r) => r !== plain)].slice(0, 3));
    open.set(false);
    last.set(`Ran ${action.item.label}`);
  };
  return (
    <Card
      title="Command palette"
      subtitle={
        desktop
          ? `${keymap.label("mod+k")} opens it: recent commands, sections, shortcuts`
          : "A dialog of commands, recent ones first"
      }
    >
      {/* A search field that opens the palette, as shadcn's: the fields' well and height, a
          muted prompt and the shortcut's key cap at its end. */}
      <Button
        onPress={() => show(true)}
        accessibilityLabel="Search commands"
        class={fieldLook().class}
        style={{
          ...fieldLook().style,
          height: desktop ? fieldSize.height : 44,
          paddingLeft: fieldSize.pad,
          paddingRight: 6,
          borderRadius: radius.control,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon icon={Search} size={16} tint={colors.mutedForeground} />
        <Text style={{ flex: 1, fontSize: fieldSize.font, color: colors.mutedForeground }}>
          Search commands…
        </Text>
        <If when={desktop}>
          <Kbd>{keymap.label("mod+k")}</Kbd>
        </If>
      </Button>
      <CaptionRow
        label={`Recent: ${recent()
          .map((id) => actionOf(id)!.item.label)
          .join(", ")}`}
      />
      <Dialog open={open()} onOpenChange={({ open: next }) => show(next)}>
        <DialogContent
          backdropStyle={backdrop()}
          style={
            desktop
              ? {
                  padding: 0,
                  gap: 0,
                  marginHorizontal: "auto",
                  marginTop: "12%",
                  width: 560,
                  maxWidth: "92%",
                }
              : {
                  padding: 0,
                  gap: 0,
                  marginHorizontal: 12,
                  marginTop: "calc(env(safe-area-inset-top) + 12px)",
                }
          }
        >
          <Command
            items={items()}
            query={query()}
            onQueryChange={({ query: next }) => query.set(next)}
            // Escape with an empty query: the palette closes.
            onCancel={() => show(false)}
            autoFocus
            placeholder="Type a command or search…"
            accessibilityLabel="Commands"
            searchAccessibilityLabel="Search commands"
            onSelect={({ id }) => run(id)}
            onHighlightChange={({ highlighted: next }) => highlighted.set(next)}
            listClass={desktop ? "max-h-96" : "max-h-80"}
            searchPrefix={<Icon icon={Search} size={16} tint={colors.mutedForeground} />}
            empty={<CommandEmpty label="No commands match" />}
            renderGroup={(group) => <CommandHeading group={group} />}
            renderItem={(entry) => (
              <CommandRow
                entry={entry}
                icon={actionOf(entry.id)?.icon}
                note={entry.disabled ? "Admin" : undefined}
              />
            )}
            footer={
              desktop ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: terminal ? TERMINAL_GAP : 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingHorizontal: 12,
                    height: 32,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.faint }}>↑↓ to move</Text>
                  <Text style={{ fontSize: 11, color: colors.faint }}>↩ to run</Text>
                  <Text style={{ fontSize: 11, color: colors.faint }}>esc to close</Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontSize: 11,
                      color: colors.faint,
                      numberOfLines: 1,
                    }}
                  >
                    {highlighted() ? (actionOf(highlighted()!)?.item.label ?? "") : ""}
                  </Text>
                </View>
              ) : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function MoveTo() {
  const folder = signal("projects/nsh");
  const searchable = signal(true);
  return (
    <Card
      title="Move to"
      subtitle="The folder in effect is checked"
      right={
        <LabeledToggle label="Search" value={searchable()} onChange={(v) => searchable.set(v)} />
      }
    >
      <Command
        items={FOLDERS.map((f) => ({
          id: f.id,
          label: f.label,
          checked: f.id === folder(),
          disabled: f.id === "spam",
        }))}
        searchable={searchable()}
        placeholder="Move to folder…"
        accessibilityLabel="Folders"
        searchAccessibilityLabel="Search folders"
        onSelect={({ id }) => {
          folder.set(id);
          last.set(`Moved to ${FOLDERS.find((f) => f.id === id)!.label}`);
        }}
        searchPrefix={<Icon icon={Folder} size={16} tint={colors.mutedForeground} />}
        empty={<CommandEmpty label="No folder matches" />}
        renderItem={(entry) => {
          const f = FOLDERS.find((x) => x.id === entry.id)!;
          return <CommandRow entry={entry} icon={f.icon} detail={f.detail} />;
        }}
      />
      <CaptionRow
        label={`In ${FOLDERS.find((f) => f.id === folder())!.label}`}
        note={
          searchable()
            ? "Type to filter"
            : desktop
              ? "Tab in: arrows, letters, Space"
              : "Tap a folder"
        }
      />
    </Card>
  );
}

function Files() {
  const count = signal(FILES.length);
  const palette = signal<CommandRef | null>(null);
  return (
    <Card title="5 000 files" subtitle="Filtered natively as you type; try “rs” or “42”">
      <Command
        ref={(r) => palette.set(r)}
        items={FILES}
        placeholder="Search files by name or extension…"
        accessibilityLabel="Files"
        searchAccessibilityLabel="Search files"
        // The ref's methods answer once the query is applied.
        onQueryChange={async () => count.set((await palette()?.matchedCount()) ?? 0)}
        onSelect={({ id }) => last.set(`Opened ${FILES[Number(id.slice(1))].label}`)}
        listClass="h-72"
        searchPrefix={<Icon icon={Search} size={16} tint={colors.mutedForeground} />}
        empty={<CommandEmpty label="No file matches" />}
        renderGroup={(group) => <CommandHeading group={group} />}
        renderItem={(entry) => (
          <CommandRow
            entry={entry}
            icon={ICONS[entry.keywords![0] as (typeof EXTENSIONS)[number]]}
          />
        )}
      />
      <CaptionRow
        label={`${grouped(count())} of ${grouped(FILES.length)} files`}
        note="50 folders"
      />
    </Card>
  );
}

function Directory() {
  const results = signal<CommandItem[]>([]);
  const loading = signal(false);
  const query = signal("");
  const asked = signal(0);
  const search = (q: string) => {
    query.set(q);
    asked.set(asked() + 1);
    const ask = asked();
    if (!q.trim()) {
      loading.set(false);
      results.set([]);
      return;
    }
    loading.set(true);
    // A server's answer, a moment later; an older answer is dropped.
    setTimeout(() => {
      if (ask !== asked()) return;
      const needle = q.trim().toLowerCase();
      results.set(
        PEOPLE.map((name, i) => ({ name, i }))
          .filter(({ name }) => name.toLowerCase().includes(needle))
          // The server ranks the names that start with the query first.
          .sort(
            (a, b) =>
              Number(!a.name.toLowerCase().startsWith(needle)) -
              Number(!b.name.toLowerCase().startsWith(needle)),
          )
          .map(({ name, i }) => ({ id: `p${i}`, label: name, keywords: [roleOf(i)] })),
      );
      loading.set(false);
    }, 450);
  };
  return (
    <Card title="Directory search" subtitle="The server finds and ranks people">
      <Command
        items={results()}
        filterable={false}
        loading={loading()}
        query={query()}
        onQueryChange={({ query: next }) => search(next)}
        placeholder="Search people…"
        accessibilityLabel="People"
        searchAccessibilityLabel="Search people"
        onSelect={({ id }) => last.set(`Messaged ${PEOPLE[Number(id.slice(1))]}`)}
        listClass="max-h-64"
        searchPrefix={<Icon icon={Search} size={16} tint={colors.mutedForeground} />}
        searchSuffix={loading() ? <Spinner size={14} tint={colors.mutedForeground} /> : undefined}
        empty={
          <CommandEmpty
            label={
              query().trim()
                ? `No one matches “${query().trim()}”`
                : "Type a name to search the directory"
            }
          />
        }
        renderItem={(entry) => <CommandRow entry={entry} icon={Mail} detail={entry.keywords![0]} />}
      />
      <CaptionRow
        label={loading() ? "Searching…" : `${results().length} found`}
        note="450 ms latency"
      />
    </Card>
  );
}

function Last() {
  return (
    <Card title="Last event">
      <LastEvent value={last()} hint="Run a command" />
    </Card>
  );
}

/** What the demo's cards report last: one line under the title. */
const last = signal("—");

export function CommandDemo() {
  return (
    <DemoPage title="Command">
      <Palette />
      <MoveTo />
      <Files />
      <Directory />
      <Last />
    </DemoPage>
  );
}
