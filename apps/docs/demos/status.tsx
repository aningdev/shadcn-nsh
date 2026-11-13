// The status has no official example, so this page is the library's own: the services a product
// runs on, each with its state and detail, the seven states in the inspector (a chip each), and a
// check that reports what it found.
import { type Tone } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Status } from "@/packages/ui/status";

import { DemoPage } from "./kit";
import { Chips, Log, Panel, Split, ui } from "./stage";

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
      <Text style={{ color: ui().muted }}>
        {"A quiet state mark: a dot and a word, tinted only for the states that matter."}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="tone">
              {/* Seven tones do not fit one segmented track: `Chips` wraps them. */}
              <Chips
                options={TONES}
                value={tone()}
                onChange={(value) => (tone.set(value), log(`tone → ${value}`))}
              />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Status label={tone()} tone={tone()} />
                <Status label="No tone" />
              </View>
            </Panel>
            <Panel title="services">
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
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
