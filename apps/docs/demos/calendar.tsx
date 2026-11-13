// The calendar has no official example of its own (it is the month the official date picker opens):
// the scene below is this library's, on the demo adapter the official examples are written against
// — a day and a range, the week's start in the inspector, the value in a `Panel` and every pick in
// the `Log`.
import { mount, signal, Text, View } from "nsh";

import { Calendar } from "@/packages/ui/calendar";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui } from "./stage";

const WEEKS = ["Sunday", "Monday"] as const;

function App() {
  const day = signal<string | null>("2026-11-11");
  const range = signal<[string | null, string | null]>([null, null]);
  const week = signal<(typeof WEEKS)[number]>("Sunday");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  return (
    <DemoPage title="Calendar">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Arrows move between days, Return picks; Page Up and Down change the month"
          : "Tap a day; the arrows change the month"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text
                style={{ fontSize: 13, color: ui().text }}
              >{`day ${JSON.stringify(day())}`}</Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`range ${JSON.stringify(range())}`}
              </Text>
            </Panel>
            <Panel title="firstDayOfWeek">
              <Segmented
                options={WEEKS}
                value={week()}
                onChange={(value) => {
                  week.set(value);
                  log(`firstDayOfWeek: ${value === "Sunday" ? 0 : 1}`);
                }}
              />
            </Panel>
            <Log title="onChange({ value })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <DemoSection title="Day">
            <Calendar
              value={day()}
              firstDayOfWeek={week() === "Sunday" ? 0 : 1}
              onChange={({ value }) => {
                const next = typeof value === "string" ? value : (value?.[0] ?? null);
                day.set(next);
                log(`Day → ${next ?? "cleared"}`);
              }}
            />
          </DemoSection>
          <DemoSection title="Range: the first press starts it, the second ends it">
            <Calendar
              range
              value={range()}
              firstDayOfWeek={week() === "Sunday" ? 0 : 1}
              onChange={({ value }) => {
                const next = Array.isArray(value) ? value : [value, null];
                range.set([next[0] ?? null, next[1] ?? null]);
                log(`Range → ${JSON.stringify(next)}`);
              }}
            />
          </DemoSection>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
