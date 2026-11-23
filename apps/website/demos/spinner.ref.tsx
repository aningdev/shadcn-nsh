// The reference of `spinner.tsx`: the same page. The ring is upstream's own component (`Spinner`
// in `packages/ui/spinner.tsx`), so this page draws it too: the case declares itself a
// self-reference.
import { colors } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { cleanup, mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { insetSurface, sectionSurface } from "@/packages/ui/lib/surface";
import { Spinner, type SpinnerSize } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Panel, Segmented, Split } from "./stage";

const SIZES = ["sm", "default", "lg"] as const;

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
  const size = signal<SpinnerSize>("lg");
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
      <Text style={{ color: colors.mutedForeground }}>
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
              <Text style={{ fontSize: 13, color: colors.foreground }}>
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
            <Spinner size={size()} tint={colors.brand} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              {busy() ? "Saving…" : "Ready"}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <DemoSection title="Size">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <Spinner size="sm" tint={colors.mutedForeground} />
              <Spinner size="default" tint={colors.brand} />
              <Spinner size="lg" tint={colors.brand} />
            </View>
          </DemoSection>
          <DemoSection title="Surface">
            {/* Three fixed 88-point surfaces: they wrap in a card narrower than the row. */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", maxWidth: "100%", gap: 12 }}>
              <Surface style={{ backgroundColor: colors.raised }}>
                <Spinner size="default" tint={colors.foreground} />
              </Surface>
              <Surface style={insetSurface()}>
                <Spinner size="default" tint={colors.brand} />
              </Surface>
              <Surface style={{ backgroundColor: colors.primary }}>
                <Spinner size="default" tint={colors.primaryForeground} />
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
