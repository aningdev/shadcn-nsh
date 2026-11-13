// The meter has no official example, so this page is the library's own: three readings of a disk
// (with a limit marked on the first), the value and the marker the inspector sets, and the seven
// tones under them.
import { colors, type Tone } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Meter } from "@/packages/ui/meter";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Panel, Segmented, Split } from "./stage";

const TONES: Tone[] = ["neutral", "accent", "info", "warn", "danger", "up", "down"];

const READINGS = [
  { label: "Library", detail: "212 GB of 256 GB", value: 0.83 },
  { label: "Photos", detail: "48 GB of 256 GB", value: 0.48 },
  { label: "Cache", detail: "12 GB, cleared weekly", value: 0.12 },
];

const MARKERS = ["none", "80%", "90%"] as const;

function App() {
  const library = signal(0.83);
  const marker = signal<(typeof MARKERS)[number]>("90%");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const limit = () => (marker() === "none" ? undefined : marker() === "80%" ? 0.8 : 0.9);
  return (
    <DemoPage title="Meter">
      <Text style={{ color: colors.muted }}>
        {"A thin bar with an optional mark: how full something is, and where its limit lies."}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Segmented
                options={[25, 55, 83]}
                value={Math.round(library() * 100)}
                onChange={(value) => (library.set(value / 100), log(`Library ${value}%`))}
              />
              <Text style={{ fontSize: 13, color: colors.text }}>
                {`Library ${Math.round(library() * 100)}% · Photos 48% · Cache 12%`}
              </Text>
            </Panel>
            <Panel title="marker">
              <Segmented
                options={MARKERS}
                value={marker()}
                onChange={(value) => (marker.set(value), log(`marker ${value}`))}
              />
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
          {READINGS.map((reading, i) => {
            const value = i === 0 ? library() : reading.value;
            return (
              <View style={{ gap: 6 }}>
                <View style={plainRow({ first: i === 0, dense: true })}>
                  <RowLabel label={reading.label} detail={reading.detail} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {`${Math.round(value * 100)}%`}
                  </Text>
                </View>
                <Meter value={value} marker={i === 0 ? limit() : undefined} />
              </View>
            );
          })}
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Tone" axis="block">
          {TONES.map((tone, i) => (
            <View style={plainRow({ first: i === 0, dense: true })}>
              <Text style={{ width: 64, fontSize: 13, color: colors.muted }}>{tone}</Text>
              <View style={{ flex: 1 }}>
                <Meter value={0.62} tone={tone} />
              </View>
              <Text style={{ fontSize: 12, color: colors.muted, width: 34 }}>62%</Text>
            </View>
          ))}
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
