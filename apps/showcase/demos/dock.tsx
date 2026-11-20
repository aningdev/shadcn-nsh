import { colors, mono, radius, rounded } from "@shadcn-nsh/theme";
// Dock: the official gallery's scene (`references/nsh/examples/gallery/demos/Dock.tsx`) with this
// library's dock — editor tabs dragged between groups, files in a left dock, a terminal under
// them, closed, zoomed and resized. The shell gives the screen a flex view, so the workspace
// fills it as upstream's does.
import { Plus, Sparkles } from "lucide";
import { platform, signal, Text, untracked, View, windowSize } from "nsh";

import { Button, buttonGlyph, IconButton } from "@/packages/ui/button";
import type { DockAreaLayout, DockAreaRef } from "@/packages/ui/dock-area";
import {
  DockArea,
  DockDragPreview,
  DockTab,
  dockTabCloseClass,
  type DockTabValue,
} from "@/packages/ui/dock-area";
import { Icon } from "@/packages/ui/lib/icons";
import { Toggle } from "@/packages/ui/toggle";

import { hint } from "./documents-shared";

/** The panels, by key: their titles. */
const TITLES: Record<string, string> = {
  files: "Files",
  readme: "README.md",
  main: "main.rs",
  preview: "Preview",
  terminal: "Terminal",
};
const titleOf = (panel: string) => TITLES[panel] ?? panel;

/** The docks' names, by placement. */
const DOCKS: Record<string, string> = { left: "Files", bottom: "Terminal" };
/** The docks' regions, which their headers name (their tabs name the panels). */
const REGIONS: Record<string, string> = { left: "Sidebar", bottom: "Panel" };

type DockNode = DockAreaLayout["center"];
type DockRegion = NonNullable<DockAreaLayout["left"]>;

/** The workspace at first: two editor groups side by side, the files on the left and a terminal under them. */
function initial(): DockAreaLayout {
  return {
    center: {
      type: "split",
      axis: "horizontal",
      children: [
        { type: "tabs", panels: ["readme", "main"], activeIndex: 1 },
        { type: "tabs", panels: ["preview"] },
      ],
      sizes: [300, null],
    },
    left: { layout: { type: "tabs", panels: ["files"] }, size: 200 },
    bottom: { layout: { type: "tabs", panels: ["terminal"] }, size: 160 },
  };
}

/** A layout in words: a group's tabs by name, groups of a split side by side apart by `|`. */
function describe(node: DockNode, nested = false): string {
  if (node.type === "tabs") return node.panels.map(titleOf).join(", ");
  const groups = node.children
    .map((child) => describe(child, true))
    .join(node.axis === "horizontal" ? " | " : " / ");
  return nested ? `(${groups})` : groups;
}

function describeDock(name: string, dock: DockRegion | null | undefined): string {
  if (!dock) return `${name} dock: none`;
  return `${name} dock: ${describe(dock.layout)}, ${Math.round(dock.size ?? 0)} pt, ${dock.open === false ? "closed" : "open"}`;
}

/** The size of the center's first group, when the center is a split. */
function firstSlot(node: DockNode): string {
  if (node.type !== "split") return "the whole center";
  const size = node.sizes?.[0];
  return size == null ? "auto" : `${Math.round(size)} pt`;
}

/** The lines of an editor's file. */
const SOURCES: Record<string, string[]> = {
  main: ["use hopper::App;", "", "fn main() {", "    hopper::run(App::default());", "}"],
  readme: ["# Hopper", "", "A dockable workspace: drag a tab", "to another group or to an edge."],
};

/** An editor: a count of its edits, which survives every move, over its file's lines. */
function EditorPane(props: { panel: string }) {
  const edits = signal(0);
  const lines = SOURCES[props.panel] ?? [];
  return (
    <View style={{ flex: 1, gap: 16, padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Button
          variant="secondary"
          size="sm"
          accessibilityLabel={`Edit ${titleOf(props.panel)}`}
          onPress={() => edits.set(edits() + 1)}
        >
          <>
            <Icon icon={Plus} {...buttonGlyph("secondary", { size: "sm" })} />
            Edit
          </>
        </Button>
        <Text
          style={{ fontSize: 14, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
        >
          {`${titleOf(props.panel)}: ${edits()} ${edits() === 1 ? "edit" : "edits"}`}
        </Text>
      </View>
      <View style={{ gap: 4 }}>
        <Each of={lines}>
          {(line, i) => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text
                style={{
                  width: 16,
                  textAlign: "right",
                  fontFamily: mono(),
                  fontSize: 12,
                  color: colors.faint,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {String(i() + 1)}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: mono(),
                  fontSize: 12,
                  color: colors.code,
                  numberOfLines: 1,
                }}
              >
                {line()}
              </Text>
            </View>
          )}
        </Each>
      </View>
    </View>
  );
}

/** The files' tree: a folder and its files, then the manifest. */
const FILES = [
  { name: "src/", depth: 0, folder: true },
  { name: "src/app.rs", depth: 1, folder: false },
  { name: "src/lib.rs", depth: 1, folder: false },
  { name: "Cargo.toml", depth: 0, folder: false },
];

/** What a panel shows, by key. */
function Panel(props: { panel: string }) {
  switch (props.panel) {
    case "readme":
    case "main":
      return <EditorPane panel={props.panel} />;
    case "files":
      return (
        <View style={{ flex: 1, gap: 2, padding: 8 }}>
          <Each of={FILES}>
            {(file) => (
              <View
                style={{
                  height: 28,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 6,
                  paddingRight: 8,
                  paddingLeft: 8 + file().depth * 14,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: file().folder ? colors.brand : colors.faint,
                  }}
                />
                <Text style={{ fontFamily: mono(), fontSize: 12, color: colors.foreground }}>
                  {file().name}
                </Text>
              </View>
            )}
          </Each>
        </View>
      );
    case "preview":
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 }}
        >
          <Icon icon={Sparkles} size={28} tint={colors.brand} />
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              Live preview
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              Follows the editor beside it
            </Text>
          </View>
        </View>
      );
    default:
      return (
        <View style={{ flex: 1, gap: 4, padding: 12 }}>
          <Text style={{ fontFamily: mono(), fontSize: 12, color: colors.foreground }}>
            $ cargo run
          </Text>
          <Text style={{ fontFamily: mono(), fontSize: 12, color: colors.mutedForeground }}>
            Compiling hopper v0.1.0
          </Text>
          <Text style={{ fontFamily: mono(), fontSize: 12, color: colors.brand }}>
            Finished in 1.92s
          </Text>
        </View>
      );
  }
}

/** A toolbar control: a small secondary button, or a toggle whose label stays lit while on. */
function Tool(props: {
  label: string;
  name: string;
  onPress: () => void;
  on?: boolean;
  toggle?: boolean;
}) {
  return (
    <If
      when={props.toggle}
      else={
        <Button
          variant="secondary"
          size="sm"
          accessibilityLabel={props.label}
          onPress={props.onPress}
        >
          {props.name}
        </Button>
      }
    >
      <Toggle
        pressed={!!props.on}
        text
        size="sm"
        accessibilityLabel={props.label}
        onChange={props.onPress}
      >
        {props.name}
      </Toggle>
    </If>
  );
}

/** A label and a value in the status bar (`"Zoomed: none"`). */
function Status(props: { children: string }) {
  const at = () => props.children.indexOf(": ");
  return (
    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}>
      {at() < 0 ? "" : props.children.slice(0, at() + 2)}
      <Text style={{ color: colors.foreground }}>
        {at() < 0 ? props.children : props.children.slice(at() + 2)}
      </Text>
    </Text>
  );
}

/** The workspace. `area` and the tab-to-group map live on the demo, the panels draw themselves. */
function Workspace(props: {
  area: { (): DockAreaRef | undefined; set: (next: DockAreaRef | undefined) => void };
  layout: { (): DockAreaLayout; set: (next: DockAreaLayout) => void };
  locked: { (): boolean; set: (next: boolean) => void };
  closing: { (): boolean; set: (next: boolean) => void };
  zoomed: { (): string | null; set: (next: string | null) => void };
  shown: {
    (): Record<string, boolean>;
    set: (next: Record<string, boolean>) => void;
  };
  last: { (): string; set: (next: string) => void };
  current: { (): string; set: (next: string) => void };
  groups: Map<string, number>;
}) {
  const pointer = platform.desktop;
  const wide = () => windowSize().width >= (platform.desktop ? 700 : 900);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: wide() ? 24 : 16,
        gap: wide() ? 16 : 12,
      }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Tool
          label="Toggle files"
          name="Files"
          toggle
          on={props.shown().left}
          onPress={() => props.area()?.toggleDock("left")}
        />
        <Tool
          label="Toggle terminal"
          name="Terminal"
          toggle
          on={props.shown().bottom}
          onPress={() => props.area()?.toggleDock("bottom")}
        />
        <Tool
          label="Lock the layout"
          name="Lock"
          toggle
          on={props.locked()}
          onPress={() => props.locked.set(!props.locked())}
        />
        <Tool
          label="Show close buttons"
          name="Close"
          toggle
          on={props.closing()}
          onPress={() => props.closing.set(!props.closing())}
        />
        <Tool
          label="Zoom the group"
          name="Zoom"
          toggle
          on={props.zoomed() !== null}
          onPress={() =>
            props
              .area()
              ?.toggleZoom(
                props.zoomed() === null ? (props.groups.get(props.current()) ?? null) : null,
              )
          }
        />
        <Tool label="Reset the layout" name="Reset" onPress={() => props.layout.set(initial())} />
        <Text
          style={{
            minWidth: 160,
            flex: 1,
            textAlign: "right",
            fontSize: 13,
            color: colors.mutedForeground,
          }}
        >
          {hint(
            "Hold a tab to reorder it",
            "Drag a tab onto another group, or to a group's edge to split it",
          )}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          ...rounded(radius.card),
        }}
      >
        <View style={{ flex: 1, backgroundColor: colors.inset }}>
          <DockArea
            ref={(r) => props.area.set(r)}
            style={{ flex: 1 }}
            layout={props.layout()}
            onLayoutChange={({ layout: next }) => props.layout.set(next)}
            onPanelRemove={({ panel }) => props.last.set(`Closed ${titleOf(panel)}`)}
            onPanelActiveChange={({ panel, active }) => {
              if (!active) return;
              props.current.set(panel);
              props.last.set(`Showing ${titleOf(panel)}`);
            }}
            onZoomChange={({ panel }) => props.zoomed.set(panel)}
            panels={
              props.closing() ? [] : Object.keys(TITLES).map((id) => ({ id, closable: false }))
            }
            onDockOpenChange={({ placement, open }) =>
              props.shown.set({ ...props.shown(), [placement]: open })
            }
            locked={props.locked()}
            handleAccessibilityLabel="Resize"
            renderTab={(tab: DockTabValue) => {
              props.groups.set(tab.panel, tab.group);
              return (
                <DockTab testID={`tab-${tab.panel}`} title={titleOf(tab.panel)} active={tab.active}>
                  <If when={tab.closable && (pointer || tab.active)}>
                    <IconButton
                      size="xs"
                      accessibilityLabel={`Close ${titleOf(tab.panel)}`}
                      class={dockTabCloseClass}
                      onPress={() => props.area()?.closePanel(tab.panel)}
                    >
                      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>×</Text>
                    </IconButton>
                  </If>
                </DockTab>
              );
            }}
            renderDock={(dock) => (
              <View
                style={{
                  height: 32,
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderColor: colors.line,
                  paddingLeft: 12,
                  paddingRight: 4,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: "500",
                    color: colors.mutedForeground,
                  }}
                >
                  {REGIONS[dock.placement] ?? dock.placement}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  accessibilityLabel={`Hide ${DOCKS[dock.placement] ?? dock.placement}`}
                  onPress={() => props.area()?.toggleDock(dock.placement)}
                >
                  Hide
                </Button>
              </View>
            )}
            renderDragPreview={(tab) => <DockDragPreview title={titleOf(tab.panel)} />}
            renderPanel={(panel) => <Panel panel={panel.id} />}
            renderEmpty={() => (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                  Every editor is closed
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  Reset brings them back
                </Text>
              </View>
            )}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: 20,
            rowGap: 4,
            borderTopWidth: 1,
            borderColor: colors.line,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Status>{`Center: ${describe(props.layout().center)}`}</Status>
          <Status>{`First group: ${firstSlot(props.layout().center)}`}</Status>
          <Status>{describeDock("Left", props.layout().left)}</Status>
          <Status>{describeDock("Bottom", props.layout().bottom)}</Status>
          <Status>{`Showing docks: ${
            ["left", "bottom"]
              .filter((p) => props.shown()[p])
              .map((p) => DOCKS[p])
              .join(", ") || "none"
          }`}</Status>
          <Status>{`Zoomed: ${props.zoomed() === null ? "none" : titleOf(props.zoomed()!)}`}</Status>
          <If when={props.last() !== "—"}>
            <Status>{`Last event: ${props.last()}`}</Status>
          </If>
        </View>
      </View>
    </View>
  );
}

/** A workspace of tabs dragged between groups and docks. */
export function DockDemo() {
  const layout = signal<DockAreaLayout>(initial());
  const locked = signal(false);
  const last = signal("—");
  const closing = signal(true);
  const zoomed = signal<string | null>(null);
  const current = signal("main");
  const groups = new Map<string, number>();
  // Open in the full presentation, none at first at compact width (a phone's window).
  const wide = untracked(windowSize).width >= 600;
  const shown = signal<Record<string, boolean>>({ left: wide, bottom: wide });
  const area = signal<DockAreaRef | undefined>(undefined);

  return (
    <Workspace
      area={area}
      layout={layout}
      locked={locked}
      closing={closing}
      zoomed={zoomed}
      shown={shown}
      last={last}
      current={current}
      groups={groups}
    />
  );
}
