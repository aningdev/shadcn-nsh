// The official dock scene (`references/nsh/website/demos/el-dock.tsx`) with this library's dock
// area: a workspace of six panels in three groups and two docks, tabs dragged between groups, the
// docks toggled from the inspector, the workspace locked, and every change logged.
import { focusRing } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Button as BareButton, type DockAreaLayout, type DockAreaRef } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { DockArea, DockDragPreview, DockTab, dockTabCloseClass } from "@/packages/ui/dock-area";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Toggle } from "@/packages/ui/toggle";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

// The panels' keys and what each shows. The layout lists the keys; the app renders a panel's
// content from its key, and the content moves with it.
const titles: Record<string, string> = {
  files: "Files",
  readme: "README.md",
  main: "main.rs",
  preview: "Preview",
  terminal: "Terminal",
  problems: "Problems",
};
const lines: Record<string, string[]> = {
  files: ["src/", "  main.rs", "  lib.rs", "README.md", "Cargo.toml"],
  readme: ["# Hopper", "", "A small app with a dockable workspace."],
  main: ["fn main() {", "    hopper::run();", "}"],
  preview: ["Hopper", "A small app with a dockable workspace."],
  terminal: ["$ cargo run", "   Compiling hopper v0.1.0", "    Finished dev in 1.92s"],
  problems: ["No problems"],
};

const initial: DockAreaLayout = {
  center: {
    type: "split",
    axis: "horizontal",
    children: [
      { type: "tabs", panels: ["readme", "main"], activeIndex: 1 },
      { type: "tabs", panels: ["preview"] },
    ],
    sizes: [null, 260],
  },
  left: { layout: { type: "tabs", panels: ["files"] }, size: 180 },
  bottom: { layout: { type: "tabs", panels: ["terminal", "problems"] }, size: 130 },
};

function App() {
  const layout = signal<DockAreaLayout>(initial);
  const locked = signal(false);
  // What shows now, in either presentation: the layout's docks when the area is wide, the drawer or
  // sheet presented when it is narrow. It starts from the layout and follows onDockOpenChange.
  const shown = signal<Record<string, boolean>>({ left: true, bottom: true });
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  let area!: DockAreaRef;

  // A dock shown or the layout locked is on or off: a toggle. Reset is an action: a button.
  const toolbarToggle = (label: string, on: () => boolean, set: (on: boolean) => void) => (
    <Toggle pressed={on()} variant="outline" size="small" onChange={({ pressed }) => set(pressed)}>
      {label}
    </Toggle>
  );
  const toolbarButton = (label: string, onPress: () => void) => (
    <Button variant="secondary" size="small" onPress={onPress}>
      {label}
    </Button>
  );

  return (
    <DemoPage title="Dock area">
      <Text class="text-muted-foreground">
        {desktop
          ? "Drag a tab onto another group, or to a group's edge to split it"
          : "Tap Files or Terminal to open a dock; hold a tab to reorder it"}
      </Text>

      <Split
        grow
        width={720}
        inspector={
          <>
            <Panel title="docks">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {toolbarToggle(
                  "Files",
                  () => !!shown().left,
                  () => area.toggleDock("left"),
                )}
                {toolbarToggle(
                  "Terminal",
                  () => !!shown().bottom,
                  () => area.toggleDock("bottom"),
                )}
                {toolbarToggle("Lock", locked, (on) => locked.set(on))}
                {toolbarButton("Reset", () => layout.set(initial))}
              </View>
            </Panel>
            <Log title="events" lines={events()} minHeight={96} />
          </>
        }
      >
        <View style={{ height: wide() ? 420 : 460, ...sectionSurface(), overflow: "hidden" }}>
          <DockArea
            ref={area}
            class="flex-1"
            layout={layout()}
            onLayoutChange={({ layout: next }) => {
              layout.set(next);
              log("onLayoutChange");
            }}
            onDockOpenChange={({ placement, open }) => {
              shown.set({ ...shown(), [placement]: open });
              log(`${placement} ${open ? "shown" : "hidden"}`);
            }}
            onPanelActiveChange={({ panel, active }) => active && log(`${titles[panel]} shown`)}
            locked={locked()}
            // The demo's two layouts: the full workspace beside the inspector in a wide window, the
            // phone presentation in one column.
            compact={!wide()}
            handleAccessibilityLabel="Resize"
            renderTab={(tab) => (
              // The title, then the close button: with a pointer it fades in over the tab's end; a
              // touch screen shows it on the shown tab.
              <DockTab title={titles[tab.panel]} active={tab.active}>
                {tab.closable && (desktop || tab.active) ? (
                  <BareButton
                    onPress={() => area.closePanel(tab.panel)}
                    accessibilityLabel={`Close ${titles[tab.panel]}`}
                    class={dockTabCloseClass}
                    focusVisibleStyle={focusRing()}
                  >
                    <Text class="text-muted-foreground text-[13px]">×</Text>
                  </BareButton>
                ) : null}
              </DockTab>
            )}
            renderDragPreview={(tab) => <DockDragPreview title={titles[tab.panel]} />}
            renderPanel={(panel) => (
              <View class="flex-1 gap-1 p-3">
                {(lines[panel.id] ?? []).map((line) => (
                  <Text class="text-foreground font-mono text-xs">{line || " "}</Text>
                ))}
              </View>
            )}
            renderEmpty={() => (
              <View class="flex-1 items-center justify-center">
                <Text class="text-muted-foreground text-sm">Every panel is closed</Text>
              </View>
            )}
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
