// The official tree scene (`references/nsh/website/demos/el-tree.tsx`) with this library's Tree:
// a project's files with their sizes, a folder the app keeps out of reach, a file revealed from
// the toolbar, and an inspector with the selection, the open folders and the events.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import type { TreeItem, TreeRef } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Tree, TreeRow } from "@/packages/ui/tree";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

// A project's files: folders that open with their chevron, files, sizes at the end, a folder the
// app keeps out of reach (`disabled`). The tree owns the keys and the semantics; every pixel of a
// row is the row look over the item's depth.
const files: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/main.rs", label: "main.rs" },
      { id: "src/lib.rs", label: "lib.rs" },
      {
        id: "src/ui",
        label: "ui",
        children: [
          { id: "src/ui/mod.rs", label: "mod.rs" },
          { id: "src/ui/tree.rs", label: "tree.rs" },
          { id: "src/ui/sidebar.rs", label: "sidebar.rs" },
          {
            id: "src/ui/icons",
            label: "icons",
            children: [
              { id: "src/ui/icons/folder.svg", label: "folder.svg" },
              { id: "src/ui/icons/file.svg", label: "file.svg" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tests",
    label: "tests",
    children: [
      { id: "tests/tree.rs", label: "tree.rs" },
      { id: "tests/keys.rs", label: "keys.rs" },
    ],
  },
  {
    id: "target",
    label: "target",
    disabled: true,
    children: [{ id: "target/debug", label: "debug" }],
  },
  { id: "Cargo.toml", label: "Cargo.toml" },
  { id: "README.md", label: "README.md" },
];

const sizes: Record<string, string> = {
  "src/main.rs": "1.2 KB",
  "src/lib.rs": "4.8 KB",
  "src/ui/mod.rs": "640 B",
  "src/ui/tree.rs": "21 KB",
  "src/ui/sidebar.rs": "6.3 KB",
  "src/ui/icons/folder.svg": "412 B",
  "src/ui/icons/file.svg": "388 B",
  "tests/tree.rs": "18 KB",
  "tests/keys.rs": "3.1 KB",
  "Cargo.toml": "906 B",
  "README.md": "2.4 KB",
};

const expanded = signal(["src", "src/ui"]);
const selected = signal<string | null>("src/ui/tree.rs");
const events = signal<string[]>([]);
const log = (line: string) => events.set([line, ...events()].slice(0, 4));
let tree: TreeRef | undefined;

function App() {
  return (
    <DemoPage title="Tree">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a folder, or Tab in and use the arrows: Right opens and enters, Left closes and leaves; double-click a file or press Return to act on it"
          : "Tap a folder to open it, a file to select it; double-tap a file to act on it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="selected">
              <Text class="text-foreground" style={{ fontSize: 13 }}>
                {selected() ?? "none"}
              </Text>
            </Panel>
            <Panel title="expanded">
              <Text class="text-foreground" style={{ fontSize: 13 }}>
                {expanded().join(", ") || "none"}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View
          style={{
            width: wide() ? 300 : undefined,
            alignSelf: wide() ? "center" : "stretch",
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Button
              variant="secondary"
              size="small"
              onPress={() => tree?.revealItem("src/ui/icons/file.svg")}
            >
              Reveal file.svg
            </Button>
            <Button
              variant="ghost"
              size="small"
              disabled={expanded().length === 0}
              onPress={() => {
                expanded.set([]);
                log("collapse all");
              }}
            >
              Collapse all
            </Button>
          </View>
          <Tree
            ref={(r) => (tree = r)}
            items={files}
            expanded={expanded()}
            selected={selected()}
            accessibilityLabel="Project files"
            style={{ ...sectionSurface(), height: desktop ? 320 : 360 }}
            onExpandedChange={({ expanded: next }) => expanded.set(next)}
            onSelectedChange={({ selected: next }) => {
              selected.set(next);
              log(`onSelectedChange({ selected: "${next}" })`);
            }}
            onExpand={({ id }) => log(`onExpand({ id: "${id}" })`)}
            onCollapse={({ id }) => log(`onCollapse({ id: "${id}" })`)}
            onAction={({ id }) => log(`onAction({ id: "${id}" })`)}
            renderItem={(entry) => (
              <TreeRow entry={entry} detail={entry.disabled ? "excluded" : sizes[entry.id]} />
            )}
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
