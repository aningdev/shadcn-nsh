// The reference of `badge.tsx`: the same page. The capsule is upstream's own component (`Badge` in
// `packages/ui/badge.tsx`), so this page draws it too: the case declares itself a self-reference.
import { colors, type Tone } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Toggle } from "@/packages/ui/toggle";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Panel, Segmented, Split } from "./stage";

const TONES: Tone[] = ["neutral", "accent", "info", "warn", "danger", "up", "down"];

const DEPLOYS: { name: string; detail: string; label: string; tone: Tone }[] = [
  { name: "web · production", detail: "Deployed 4 minutes ago", label: "Active", tone: "up" },
  { name: "api · production", detail: "Deploys are paused", label: "Paused", tone: "neutral" },
  { name: "worker · staging", detail: "Third in the queue", label: "Queued", tone: "info" },
  { name: "cron · nightly", detail: "One run is slow", label: "Warning", tone: "warn" },
  { name: "migrate", detail: "Stopped at step 3 of 7", label: "Failed", tone: "danger" },
];

function App() {
  const tone = signal<Tone>("accent");
  const outline = signal<"filled" | "outline">("filled");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  return (
    <DemoPage title="Badge">
      <Text style={{ color: colors.muted }}>
        {"A state or a tag in a capsule, quiet enough to sit in a row of its own."}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="tone">
              {/* Seven tones do not fit one segmented track: a chip each, wrapped. */}
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
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Badge label={tone()} tone={tone()} outline={outline() === "outline"} />
                <Badge label="12" tone={tone()} outline={outline() === "outline"} />
              </View>
            </Panel>
            <Panel title="outline">
              <Segmented
                options={["filled", "outline"] as const}
                value={outline()}
                onChange={(value) => (outline.set(value), log(`outline ${value}`))}
              />
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          {DEPLOYS.map((deploy, i) => (
            <View style={plainRow({ first: i === 0 })}>
              <RowLabel label={deploy.name} detail={deploy.detail} />
              <Badge label={deploy.label} tone={deploy.tone} />
            </View>
          ))}
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Tone">
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {TONES.map((value) => (
              <Badge label={value} tone={value} />
            ))}
          </View>
        </DemoSection>
        <DemoSection title="Outline">
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {TONES.map((value) => (
              <Badge label={value} tone={value} outline />
            ))}
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
