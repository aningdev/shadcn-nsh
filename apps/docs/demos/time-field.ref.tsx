// The reference of `time-field.tsx`: the same page with `timeFieldClass` on `nsh/base`'s TimeField.
// The render check requires the two to draw the same pixels.
import { mount, signal, Text, View } from "nsh";
import { TimeField } from "nsh/base";

import { calendarLook, TimeSegment } from "@/packages/ui/calendar";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { timeFieldClass } from "@/packages/ui/time-field";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui } from "./stage";

const PRECISIONS = ["minute", "second"] as const;
const CYCLES = ["h12", "h23"] as const;

function App() {
  const start = signal("09:30");
  const end = signal("17:00");
  const precision = signal<(typeof PRECISIONS)[number]>("minute");
  const cycle = signal<(typeof CYCLES)[number]>("h23");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  return (
    <DemoPage title="Time Field">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a segment and type its digits; ↑ ↓ step it, ← → move between segments"
          : "Tap a segment and type its digits; the arrows step it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: ui().text }}>{`start ${start()}`}</Text>
              <Text style={{ fontSize: 13, color: ui().text }}>{`end ${end()}`}</Text>
            </Panel>
            <Panel title="precision">
              <Segmented
                options={PRECISIONS}
                value={precision()}
                onChange={(value) => {
                  precision.set(value);
                  log(`precision: ${value}`);
                }}
              />
            </Panel>
            <Panel title="hourCycle">
              <Segmented
                options={CYCLES}
                value={cycle()}
                onChange={(value) => {
                  cycle.set(value);
                  log(`hourCycle: ${value}`);
                }}
              />
            </Panel>
            <Log title="onChange({ value })" lines={events()} minHeight={62} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <DemoSection title="Starts">
            <TimeField
              value={start()}
              precision={precision()}
              hourCycle={cycle()}
              accessibilityLabel="Starts at"
              onChange={({ value }) => {
                start.set(value);
                log(`start → ${value}`);
              }}
              class={timeFieldClass}
              segmentClass={calendarLook.segmentClass}
              separatorStyle={calendarLook.separator}
              renderSegment={(segment) => <TimeSegment label={segment.label} />}
            />
          </DemoSection>
          <DemoSection title="Ends">
            <TimeField
              value={end()}
              precision={precision()}
              hourCycle={cycle()}
              accessibilityLabel="Ends at"
              onChange={({ value }) => {
                end.set(value);
                log(`end → ${value}`);
              }}
              class={timeFieldClass}
              segmentClass={calendarLook.segmentClass}
              separatorStyle={calendarLook.separator}
              renderSegment={(segment) => <TimeSegment label={segment.label} />}
            />
          </DemoSection>
          <DemoSection title="Disabled">
            <TimeField
              value="12:00"
              disabled
              accessibilityLabel="Disabled time"
              class={timeFieldClass}
              segmentClass={calendarLook.segmentClass}
              separatorStyle={calendarLook.separator}
              renderSegment={(segment) => <TimeSegment label={segment.label} />}
            />
          </DemoSection>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
