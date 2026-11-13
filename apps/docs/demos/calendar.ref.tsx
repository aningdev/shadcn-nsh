// The reference of `calendar.tsx`: the same page with `calendarLook` and `CalendarItem` spread on
// `nsh/base`'s Calendar, the way the official date picker opens its month. The render check
// requires the two to draw the same pixels.
import { colors, terminal } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Calendar, type CalendarEntry, type CalendarValue } from "nsh/base";

import { CalendarItem, calendarLook } from "@/packages/ui/calendar";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split } from "./stage";

const WEEKS = ["Sunday", "Monday"] as const;

/** A month in the shared look: the calendar's padding, its header, its items and their content. */
function Month(props: {
  value: string | [string | null, string | null] | null;
  range?: boolean;
  firstDayOfWeek: number;
  onChange: (event: { value: CalendarValue }) => void;
}) {
  return (
    <Calendar
      value={props.value}
      range={props.range}
      firstDayOfWeek={props.firstDayOfWeek}
      onChange={props.onChange}
      style={calendarLook.calendar}
      headerStyle={calendarLook.header}
      bodyStyle={terminal ? undefined : { gap: calendarLook.monthGap }}
      itemClass={calendarLook.itemClass}
      renderItem={(item: CalendarEntry) => (
        <CalendarItem item={item} months={1} firstDayOfWeek={props.firstDayOfWeek} />
      )}
    />
  );
}

function App() {
  const day = signal<string | null>("2026-11-11");
  const range = signal<[string | null, string | null]>([null, null]);
  const week = signal<(typeof WEEKS)[number]>("Sunday");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  return (
    <DemoPage title="Calendar">
      <Text style={{ color: colors.muted }}>
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
                style={{ fontSize: 13, color: colors.text }}
              >{`day ${JSON.stringify(day())}`}</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>
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
            <Month
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
            <Month
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
