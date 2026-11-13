// The official resizable scene (`references/nsh/website/demos/el-resizable.tsx`) with this
// library's panels: a sidebar beside an editor with a console under it, the sizes the app's (the
// group reports them when a drag ends and the app passes them back), and an inspector with the
// sizes, the console's visibility and the resize events.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { ResizablePanel, ResizablePanelGroup } from "@/packages/ui/resizable";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, wide } from "./stage";

// The handles take the shared look: a hairline that stays as it is, and a thumb on it, a pill that
// grows in under the pointer and further while dragged.
function App() {
  const sidebar = signal(desktop ? 220 : 140);
  const consoleSize = signal(120);
  const showConsole = signal<"Shown" | "Hidden">("Shown");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  const round = (sizes: number[]) => sizes.map((s) => Math.round(s)).join(" · ");

  const label = (title: string, detail: string) => (
    <View style={{ gap: 4 }}>
      <Text class="text-foreground" style={{ fontSize: 13, fontWeight: "600" }}>
        {title}
      </Text>
      <Text class="text-muted-foreground" style={{ fontSize: 12 }}>
        {detail}
      </Text>
    </View>
  );

  return (
    <DemoPage title="Resizable">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Drag a line between two panels"
          : "Drag a line between two panels with your finger"}
      </Text>

      <Split
        grow
        width={640}
        inspector={
          <>
            <Panel title="sizes">
              <Text class="text-foreground" style={{ fontSize: 13, fontVariant: ["tabular-nums"] }}>
                {`sidebar ${Math.round(sidebar())} · console ${Math.round(consoleSize())}`}
              </Text>
            </Panel>
            <Segmented
              label="console"
              options={["Shown", "Hidden"] as const}
              value={showConsole()}
              onChange={(value) => showConsole.set(value)}
            />
            <Log title="onResize" lines={events()} minHeight={96} />
          </>
        }
      >
        <View style={{ height: wide() ? 360 : 300, ...sectionSurface(), overflow: "hidden" }}>
          <ResizablePanelGroup
            axis="horizontal"
            handleAccessibilityLabel="Resize the sidebar"
            onResize={({ sizes }) => log(`row: ${round(sizes)}`)}
          >
            <ResizablePanel
              size={sidebar()}
              minSize={100}
              maxSize={320}
              onResize={({ size }) => sidebar.set(size)}
            >
              <View style={{ flex: 1, padding: 14, gap: 10, backgroundColor: colors.inset }}>
                {label("Files", `${Math.round(sidebar())} pt, 100 to 320`)}
              </View>
            </ResizablePanel>
            <ResizablePanel minSize={120}>
              <ResizablePanelGroup
                axis="vertical"
                handleAccessibilityLabel="Resize the console"
                onResize={({ sizes }) => log(`column: ${round(sizes)}`)}
              >
                <ResizablePanel minSize={80}>
                  <View style={{ flex: 1, padding: 14 }}>
                    {label("Editor", "Takes the room left")}
                  </View>
                </ResizablePanel>
                <ResizablePanel
                  size={consoleSize()}
                  minSize={60}
                  fixed
                  visible={showConsole() === "Shown"}
                  onResize={({ size }) => consoleSize.set(size)}
                >
                  <View style={{ flex: 1, padding: 14 }}>
                    {label("Console", "Fixed: keeps its height")}
                  </View>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
