// The reference of `status.tsx`: the same page. The mark is upstream's own component (`Status` in
// `packages/ui/status.tsx`), so this page draws it too: the case declares itself a self-reference.
import { colors, type Tone } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Status } from "@/packages/ui/status";
import { Toggle } from "@/packages/ui/toggle";

import { DemoPage } from "./kit";
import { Log, Panel, Split } from "./stage";

const TONES: Tone[] = ["neutral", "accent", "info", "warn", "danger", "up", "down"];

const SERVICES: { name: string; detail: string; label: string; tone: Tone }[] = [
  { name: "API", detail: "42 ms at the 95th percentile", label: "Online", tone: "up" },
  { name: "Database", detail: "3 connections left", label: "Busy", tone: "accent" },
  { name: "Cache", detail: "Hit rate 98%", label: "Idle", tone: "neutral" },
  { name: "Search", detail: "Reindexing 4 of 9 shards", label: "Degraded", tone: "warn" },
  { name: "Jobs", detail: "The worker stopped at 03:12", label: "Offline", tone: "danger" },
  { name: "Webhooks", detail: "Version 2 is out", label: "Update available", tone: "info" },
  { name: "Exports", detail: "Back at 06:00", label: "Down", tone: "down" },
];

function App() {
  const tone = signal<Tone>("up");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  const healthy = () =>
    SERVICES.filter((service) => service.tone === "up" || service.tone === "accent").length;
  return (
    <DemoPage title="Status">
      <Text style={{ color: colors.muted }}>
        {"A quiet state mark: a dot and a word, tinted only for the states that matter."}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="tone">
              {/* Seven states do not fit one segmented track: a chip each, wrapped. */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {TONES.map((value) => (
                  <Toggle
                    size="small"
                    pressed={tone() === value}
                    onChange={() => (tone.set(value), log(`tone → ${value}`))}
                  >
                    {value}
                  </Toggle>
                ))}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Status label={tone()} tone={tone()} />
                <Status label="No tone" />
              </View>
            </Panel>
            <Panel title="services">
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {`${SERVICES.length} services · ${healthy()} healthy`}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Button
                  variant="secondary"
                  onPress={() => log(`Checked: ${SERVICES.length} services, ${healthy()} healthy`)}
                >
                  Check now
                </Button>
              </View>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          {SERVICES.map((service, i) => (
            <View style={plainRow({ first: i === 0 })}>
              <RowLabel label={service.name} detail={service.detail} />
              <Status label={service.label} tone={service.tone} />
            </View>
          ))}
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
