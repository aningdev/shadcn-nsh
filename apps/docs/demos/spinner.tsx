// The spinner has no official example, so this page is the library's own: a hero ring whose size
// the inspector sets, the sizes and surfaces it takes, and the busy buttons that use it, with a
// save the page runs for a moment to show one.
import type { JSX, ViewStyle } from "nsh";
import { cleanup, mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { insetSurface, sectionSurface } from "@/packages/ui/lib/surface";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Panel, Segmented, Split, ui } from "./stage";

const SIZES = [12, 16, 24] as const;

/** A surface the ring sits on, its size fixed so the three read as one row. */
function Surface(props: { style?: ViewStyle; children: JSX.Element }) {
  return (
    <View
      style={{
        width: 88,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        ...props.style,
      }}
    >
      {props.children}
    </View>
  );
}

function App() {
  const size = signal<number>(24);
  const busy = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  let timer: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
  const save = () => {
    busy.set(true);
    log("Save started");
    timer = setTimeout(() => {
      busy.set(false);
      log("Save done");
    }, 900);
  };
  return (
    <DemoPage title="Spinner">
      <Text style={{ color: ui().muted }}>
        {
          "A ring that turns while work goes on; it stands still when the user asks for less motion."
        }
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="size">
              <Segmented
                options={SIZES}
                value={size()}
                onChange={(value) => (size.set(value), log(`size ${value}`))}
              />
            </Panel>
            <Panel title="busy">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {busy() ? "Saving: the ring is up" : "Idle"}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Button variant="default" busy={busy()} onPress={save}>
                  Save
                </Button>
              </View>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View style={{ alignItems: "center", gap: 10, paddingVertical: 18 }}>
            <Spinner size={size()} tint={ui().accent} />
            <Text style={{ fontSize: 13, color: ui().muted }}>{busy() ? "Saving…" : "Ready"}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <DemoSection title="Size">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <Spinner size={12} tint={ui().muted} />
              <Spinner size={16} tint={ui().accent} />
              <Spinner size={24} tint={ui().accent} />
            </View>
          </DemoSection>
          <DemoSection title="Surface">
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Surface style={{ backgroundColor: ui().raised.backgroundColor }}>
                <Spinner size={16} tint={ui().text} />
              </Surface>
              <Surface style={insetSurface()}>
                <Spinner size={16} tint={ui().accent} />
              </Surface>
              <Surface style={{ backgroundColor: ui().accentFill.backgroundColor }}>
                <Spinner size={16} tint={ui().onAccent} />
              </Surface>
            </View>
          </DemoSection>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Busy button">
          <Button variant="default" busy>
            Saving
          </Button>
          <Button variant="secondary" busy>
            Syncing
          </Button>
          <Button variant="destructive" busy>
            Deleting
          </Button>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
