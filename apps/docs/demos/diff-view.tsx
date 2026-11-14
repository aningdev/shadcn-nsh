// The official diff view scene (`references/nsh/website/demos/el-diff-view.tsx`) with this
// library's DiffView: a Rust file changed in two places, reverted or kept a change at a time, with
// the layout, the inline style and the stats in the inspector. The chips over a change are the
// shared look's, in the tone of the row they sit on.
import { mount, signal, Text, View } from "nsh";
import type { DiffViewRef } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { DiffHunkActions, DiffView, diffHunkTone } from "@/packages/ui/diff-view";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui, wide } from "./stage";

const OLD = `fn greet(name: &str) -> String {
    format!("Hello, {}", name)
}

fn main() {
    let names = vec!["Ada", "Grace"];
    for name in names {
        println!("{}", greet(name));
    }
}
`;

const NEW = `fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

fn main() {
    let names = ["Ada", "Grace", "Linus"];
    for name in names {
        println!("{}", greet(name));
    }
}
`;

// The texts are the app's: a change reverted or kept is reported (`onChange`) and set back as
// `oldValue` and `newValue`.
function App() {
  const layout = signal<"split" | "unified">(wide() ? "split" : "unified");
  const inline = signal<"wordAlt" | "char" | "none">("wordAlt");
  const oldValue = signal(OLD);
  const newValue = signal(NEW);
  const stats = signal("");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  let diff: DiffViewRef | undefined;
  const count = async () => {
    const s = await diff?.stats();
    stats.set(s ? `+${s.added} −${s.deleted} · ${s.hunks} changes` : "");
  };

  return (
    <DemoPage title="Diff view">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click Revert or Keep on a change, or a line number"
          : "Tap Revert or Keep on a change, or a line number"}
      </Text>

      <Split
        grow
        width={680}
        inspector={
          <>
            <Segmented
              label="layout"
              options={["split", "unified"] as const}
              value={layout()}
              onChange={(value) => layout.set(value)}
            />
            <Segmented
              label="inline"
              options={["wordAlt", "char", "none"] as const}
              value={inline()}
              onChange={(value) => inline.set(value)}
            />
            <Panel title="stats">
              <Text class="text-foreground" style={{ fontSize: 13, fontVariant: ["tabular-nums"] }}>
                {stats()}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    oldValue.set(OLD);
                    newValue.set(NEW);
                    setTimeout(count, 0);
                  }}
                >
                  Reset
                </Button>
              </View>
            </Panel>
            <Log title="events" lines={events()} minHeight={96} />
          </>
        }
      >
        <View style={{ height: wide() ? 360 : 320, ...sectionSurface(), overflow: "hidden" }}>
          <DiffView
            ref={(r) => {
              diff = r;
              count();
            }}
            oldValue={oldValue()}
            newValue={newValue()}
            language="rust"
            layout={layout()}
            inline={inline()}
            contextLines={1}
            renderHunkActions={(hunk) => (
              <DiffHunkActions
                index={hunk.index}
                iconOnly={!wide()}
                tone={diffHunkTone(hunk, layout())}
                onRevert={() => diff?.revertHunk(hunk.index)}
                onKeep={() => diff?.acceptHunk(hunk.index)}
              />
            )}
            onChange={({ change }) => {
              oldValue.set(change.oldValue);
              newValue.set(change.newValue);
              log(`onChange: ${change.newValue.split("\n").length - 1} lines`);
              count();
            }}
            onLineNumberPress={({ line }) =>
              log(`onLineNumberPress: ${line.side} ${line.line + 1}`)
            }
            style={{ flex: 1 }}
          />
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Hunk actions">
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text class="text-muted-foreground" style={{ fontSize: 12, width: 132 }}>
                on an added line
              </Text>
              <DiffHunkActions index={0} tone="up" onRevert={() => {}} onKeep={() => {}} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text class="text-muted-foreground" style={{ fontSize: 12, width: 132 }}>
                on a deleted line
              </Text>
              <DiffHunkActions index={1} tone="down" onRevert={() => {}} onKeep={() => {}} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text class="text-muted-foreground" style={{ fontSize: 12, width: 132 }}>
                icon only
              </Text>
              <DiffHunkActions index={2} iconOnly onRevert={() => {}} onKeep={() => {}} />
            </View>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
