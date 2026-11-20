import { colors } from "@shadcn-nsh/theme";
// Tree: the official gallery's scene (`references/nsh/examples/gallery/demos/TreeDemo.tsx`) with
// this library's parts — a project explorer whose rows report their long presses, a settings
// sidebar with the section's words beside it, 10 100 items that stay fast, and a read-only
// outline that locks. `nsh/base`'s Tree owns which items are expanded, which one is selected, the
// keyboard and what screen readers hear; its rows are virtualized, so a collapsed folder's
// children are never made.
import {
  Bell,
  Database,
  FileText,
  LineChart,
  List,
  Lock,
  Mail,
  SlidersHorizontal,
  Sun,
  X,
  type IconNode,
} from "lucide";
import { platform, signal, Text, View } from "nsh";
import type { TreeItem, TreeRef } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { Tree, TreeRow } from "@/packages/ui/tree";

import { DemoCard, DemoPage } from "../kit";
import { CaptionRow, LabeledToggle } from "./navigation-shared";

const pointer = platform.desktop;

/** A row of this library's tree: 28 points with a pointer, 44 on a touch screen. */
const treeRowHeight = pointer ? 28 : 44;

/** A well as tall as its first `rows` rows and the list's padding, so nothing is left blank below
 * the last one; more rows scroll. */
const tall = (rows: number) => ({ height: rows * treeRowHeight + 12 });

const project: TreeItem[] = [
  {
    id: "app",
    label: "app",
    children: [
      {
        id: "app/src",
        label: "src",
        children: [
          { id: "app/src/main.rs", label: "main.rs" },
          { id: "app/src/router.rs", label: "router.rs" },
          {
            id: "app/src/views",
            label: "views",
            children: [
              { id: "app/src/views/inbox.rs", label: "inbox.rs" },
              { id: "app/src/views/thread.rs", label: "thread.rs" },
              { id: "app/src/views/compose.rs", label: "compose.rs" },
            ],
          },
        ],
      },
      {
        id: "app/assets",
        label: "assets",
        children: [
          { id: "app/assets/logo.svg", label: "logo.svg" },
          { id: "app/assets/inter.ttf", label: "inter.ttf" },
        ],
      },
      { id: "app/Cargo.toml", label: "Cargo.toml" },
    ],
  },
  {
    id: "target",
    label: "target",
    disabled: true,
    children: [{ id: "target/release", label: "release" }],
  },
  { id: "nsh.json", label: "nsh.json" },
  { id: "README.md", label: "README.md" },
];

const sizes: Record<string, string> = {
  "app/src/main.rs": "1.4 KB",
  "app/src/router.rs": "3.8 KB",
  "app/src/views/inbox.rs": "12 KB",
  "app/src/views/thread.rs": "9.6 KB",
  "app/src/views/compose.rs": "7.1 KB",
  "app/assets/logo.svg": "2.2 KB",
  "app/assets/inter.ttf": "310 KB",
  "app/Cargo.toml": "740 B",
  "nsh.json": "512 B",
  "README.md": "3.0 KB",
};

/** Settings, each section with an icon and its words. */
const settings: { item: TreeItem; icon: IconNode; text: string }[] = [
  {
    item: { id: "general", label: "General" },
    icon: SlidersHorizontal,
    text: "Language, region and what opens at launch.",
  },
  {
    item: { id: "appearance", label: "Appearance" },
    icon: Sun,
    text: "Light, dark, or as the system is; the accent color.",
  },
  {
    item: { id: "notifications", label: "Notifications" },
    icon: Bell,
    text: "Which accounts alert you, and how quietly.",
  },
  {
    item: { id: "privacy", label: "Privacy" },
    icon: Lock,
    text: "Read receipts, tracking protection and remote content.",
  },
  {
    item: { id: "privacy/blocked", label: "Blocked senders" },
    icon: X,
    text: "Mail from them goes straight to the trash.",
  },
  {
    item: { id: "privacy/data", label: "Data and storage" },
    icon: Database,
    text: "What is kept on this device, and for how long.",
  },
  {
    item: { id: "accounts", label: "Accounts" },
    icon: Mail,
    text: "Your mailboxes, their signatures and aliases.",
  },
  {
    item: { id: "accounts/work", label: "Work" },
    icon: Mail,
    text: "work@example.com, synced every minute.",
  },
  {
    item: { id: "accounts/home", label: "Home" },
    icon: Mail,
    text: "me@example.com, synced as mail arrives.",
  },
  { item: { id: "billing", label: "Billing", disabled: true }, icon: LineChart, text: "" },
];
const settingOf = (id: string) => settings.find((s) => s.item.id === id)!;
const child = (id: string) => settingOf(id).item;
const sidebar: TreeItem[] = [
  child("general"),
  child("appearance"),
  child("notifications"),
  { ...child("privacy"), children: [child("privacy/blocked"), child("privacy/data")] },
  { ...child("accounts"), children: [child("accounts/work"), child("accounts/home")] },
  child("billing"),
];

/** 100 folders of 100 files: 10 100 items. */
const large: TreeItem[] = Array.from({ length: 100 }, (_, f) => ({
  id: `f${f}`,
  label: `Folder ${String(f + 1).padStart(3, "0")}`,
  children: Array.from({ length: 100 }, (_, i) => ({
    id: `f${f}/${i}`,
    label: `file-${f + 1}-${i + 1}.log`,
  })),
}));

/** A project explorer: a double click (a double tap) opens a file; a long press reports the
 * row; Reveal finds a buried file. */
function Files(props: { log: (text: string) => void }) {
  const expanded = signal(["app", "app/src"]);
  const selected = signal<string | null>("app/src/router.rs");
  const opened = signal<string | null>(null);
  const tree = signal<TreeRef | undefined>(undefined);
  return (
    <DemoCard
      title="Files"
      subtitle={`${pointer ? "A double click" : "A double tap"} opens a file; a long press reports the row`}
    >
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => tree()?.revealItem("app/src/views/compose.rs")}
        >
          Reveal compose.rs
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={expanded().length === 0}
          onPress={() => expanded.set([])}
        >
          Collapse all
        </Button>
      </View>
      <Tree
        ref={(r) => tree.set(r)}
        items={project}
        expanded={expanded()}
        selected={selected()}
        reveal
        accessibilityLabel="Project files"
        style={tall(pointer ? 10 : 8)}
        onExpandedChange={({ expanded: next }) => expanded.set(next)}
        onSelectedChange={({ selected: next }) => {
          selected.set(next);
          props.log(`Selected ${next}`);
        }}
        onExpand={({ id }) => props.log(`Expanded ${id}`)}
        onCollapse={({ id }) => props.log(`Collapsed ${id}`)}
        // The arrows select row by row; a file opens only on the action
        // (a folder's action is its press, which already opened it).
        onAction={({ id }) => {
          if (!(id in sizes)) return;
          opened.set(id);
          props.log(`Opened ${id}`);
        }}
        // A row's own long press (its menu on a touchscreen) keeps the
        // tree's taps: a view that listens only to `onLongPress` leaves
        // them to the row around it.
        renderItem={(entry) => (
          <View onLongPress={() => props.log(`Long pressed ${entry.id}`)}>
            <TreeRow entry={entry} detail={entry.disabled ? "excluded" : sizes[entry.id]} />
          </View>
        )}
      />
      <CaptionRow
        label={`Selected: ${selected() ?? "none"}`}
        note={opened() ? `Open: ${opened()!.split("/").pop()}` : `${expanded().length} open`}
      />
    </DemoCard>
  );
}

/** A settings sidebar: sections with their icons, the section's words beside it; Privacy starts
 * open. */
function Settings(props: { log: (text: string) => void }) {
  const section = signal("notifications");
  return (
    <DemoCard title="Settings" subtitle="Sections in a sidebar; Privacy starts open">
      <View style={{ flexDirection: pointer ? "row" : "column", gap: 12 }}>
        <Tree
          items={sidebar}
          defaultExpanded={["privacy"]}
          defaultSelected="notifications"
          accessibilityLabel="Settings"
          style={{ ...tall(8), width: pointer ? 210 : undefined }}
          onSelectedChange={({ selected: next }) => {
            section.set(next);
            props.log(`Section ${settingOf(next).item.label}`);
          }}
          renderItem={(entry) => {
            const s = settingOf(entry.id);
            return (
              <TreeRow
                entry={entry}
                icon={s.icon}
                tint={entry.disabled ? colors.faint : colors.mutedForeground}
                detail={entry.disabled ? "Admin" : undefined}
              />
            );
          }}
        />
        <View style={{ flex: pointer ? 1 : undefined, minWidth: 0, gap: 6, padding: 4 }}>
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.foreground }}>
            {settingOf(section()).item.label}
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 19 }}>
            {settingOf(section()).text}
          </Text>
        </View>
      </View>
    </DemoCard>
  );
}

/** 10 100 items: only the rows in view are made. */
function Large(props: { log: (text: string) => void }) {
  const expanded = signal(["f0"]);
  const selected = signal<string | null>(null);
  const tree = signal<TreeRef | undefined>(undefined);
  return (
    <DemoCard title="10 100 items" subtitle="Only the rows in view are made">
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Button variant="secondary" size="sm" onPress={() => tree()?.revealItem("f86/41")}>
          Reveal file-87-42
        </Button>
      </View>
      <Tree
        ref={(r) => tree.set(r)}
        items={large}
        expanded={expanded()}
        selected={selected()}
        accessibilityLabel="Logs"
        style={tall(pointer ? 10 : 7)}
        onExpandedChange={({ expanded: next }) => expanded.set(next)}
        onSelectedChange={({ selected: next }) => {
          selected.set(next);
          props.log(`Selected ${next}`);
        }}
        renderItem={(entry) => <TreeRow entry={entry} />}
      />
      <CaptionRow
        label={`Selected: ${selected() ?? "none"}`}
        note={`${expanded().length} of 100 folders open`}
      />
    </DemoCard>
  );
}

/** A read-only outline: locked, it shows its state and takes no input. */
function ReadOnly(props: { log: (text: string) => void }) {
  const locked = signal(true);
  return (
    <DemoCard title="Read-only" subtitle="An outline to read, not to change">
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }} />
        <LabeledToggle label="Lock" value={locked()} onChange={(v) => locked.set(v)} />
      </View>
      <Tree
        items={[
          {
            id: "q4",
            label: "Q4 plan",
            children: [
              { id: "q4/goals", label: "Goals" },
              {
                id: "q4/hiring",
                label: "Hiring",
                children: [{ id: "q4/hiring/eng", label: "Engineering" }],
              },
              { id: "q4/budget", label: "Budget" },
            ],
          },
        ]}
        defaultExpanded={["q4", "q4/hiring"]}
        defaultSelected="q4/goals"
        disabled={locked()}
        accessibilityLabel="Outline"
        style={tall(5)}
        onSelectedChange={({ selected: next }) => props.log(`Outline ${next}`)}
        renderItem={(entry) => <TreeRow entry={entry} icon={entry.folder ? List : FileText} />}
      />
      <CaptionRow
        label={
          locked()
            ? "Locked: it shows its state and takes no input"
            : "Unlocked: press a row, or Tab in and use the arrows"
        }
      />
    </DemoCard>
  );
}

export function TreeDemo() {
  const last = signal("—");
  const log = (text: string) => last.set(text);
  return (
    <DemoPage title="Tree" note={() => `Last event: ${last()}`}>
      <Files log={log} />
      <Settings log={log} />
      <Large log={log} />
      <ReadOnly log={log} />
    </DemoPage>
  );
}
