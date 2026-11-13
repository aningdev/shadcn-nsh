// The reference of `date-picker.tsx`: the same scene as upstream writes it, `datePickerLook` and
// `DateTrigger` spread on `nsh/base`'s DatePicker. The render check requires the two to draw the
// same pixels.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import type { DatePickerValue, DateRangePreset, HourCycle } from "nsh/base";
import { DatePicker } from "nsh/base";

import { DateTrigger, datePickerLook } from "@/packages/ui/date-picker";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { clearButtonLook } from "@/packages/ui/select";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, wide } from "./stage";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** A day's ISO date (`"2026-10-28"`), in local time as the calendar's days are. */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
/** An ISO date's month and day: `Oct 28`. */
const monthDay = (value: string) =>
  `${MONTHS[Number(value.slice(5, 7)) - 1].slice(0, 3)} ${Number(value.slice(8, 10))}`;

/** A time `"HH:MM"` on the picked clock: `14:30`, or `2:30 PM`. */
function clock(time: string, cycle: HourCycle) {
  if (cycle === "h23") return time;
  const hour = Number(time.slice(0, 2));
  return `${hour % 12 === 0 ? 12 : hour % 12}:${time.slice(3, 5)} ${hour < 12 ? "AM" : "PM"}`;
}

/** A trigger's width: set with a pointer, the field's on a touch screen. */
const trigger = desktop ? { width: 260 } : undefined;

/** A label over its control, a quieter line under the label. */
function Field(props: { label: string; detail: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>{props.label}</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>{props.detail}</Text>
      </View>
      {props.children}
    </View>
  );
}

function App() {
  const due = signal<string | null>(null);
  const stay = signal<DatePickerValue>(null);
  const meeting = signal<string | null>(null);
  const cycle = signal<HourCycle>("h12");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 8));
  // The presets from today.
  const today = new Date();
  const monday = addDays(today, (8 - today.getDay()) % 7 || 7);
  const dues: DateRangePreset[] = [
    { label: "Today", value: iso(today) },
    { label: "Tomorrow", value: iso(addDays(today, 1)) },
    { label: "Next Monday", value: iso(monday) },
  ];
  const stays: DateRangePreset[] = [
    { label: "This week", value: [iso(today), iso(addDays(today, (7 - today.getDay()) % 7))] },
    { label: "Next 7 nights", value: [iso(today), iso(addDays(today, 7))] },
  ];
  const stayTitle = () => {
    const r = stay();
    return Array.isArray(r) && r[0] && r[1]
      ? `${monthDay(r[0])} – ${monthDay(r[1])}, ${r[1].slice(0, 4)}`
      : undefined;
  };
  const meetingTitle = () => {
    const v = meeting();
    return v ? `${monthDay(v)}, ${v.slice(0, 4)} · ${clock(v.slice(11, 16), cycle())}` : undefined;
  };

  return (
    <DemoPage title="Date Picker">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Arrows move between days, Return picks; the trigger takes Delete to clear"
          : "Tap a day; the meeting's time takes digits"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text
                style={{ fontSize: 13, color: colors.text }}
              >{`due ${JSON.stringify(due())}`}</Text>
              <Text
                style={{ fontSize: 13, color: colors.text }}
              >{`stay ${JSON.stringify(stay())}`}</Text>
              <Text
                style={{ fontSize: 13, color: colors.text }}
              >{`meeting ${JSON.stringify(meeting())}`}</Text>
            </Panel>
            <Segmented
              label="hourCycle"
              options={["h12", "h23"] as const}
              value={cycle()}
              onChange={(value) => cycle.set(value)}
            />
            <Log title="onChange" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 20 }}>
          <Field label="Due" detail="Weekdays only, presets beside the calendar, a clear button">
            <DatePicker
              value={due()}
              cleanable
              onChange={({ value }) => {
                due.set(typeof value === "string" ? value : null);
                log(`Due → ${JSON.stringify(value)}`);
              }}
              disabledMatcher={[0, 6]}
              presets={dues}
              clearButtonAccessibilityLabel="Clear the due date"
              trigger={
                <DateTrigger
                  title={due() ? `${monthDay(due()!)}, ${due()!.slice(0, 4)}` : "No due date"}
                  placeholder={!due()}
                  open={false}
                  clearable={due() !== null}
                  style={trigger}
                />
              }
              {...datePickerLook()}
              {...clearButtonLook({ over: true })}
            />
          </Field>
          <Field
            label="Stay"
            detail={
              wide()
                ? "A range over two months: the first press starts it"
                : "A range: the first press starts it, the second ends it"
            }
          >
            <DatePicker
              value={stay()}
              onChange={({ value }) => {
                stay.set(value);
                log(`Stay → ${JSON.stringify(value)}`);
              }}
              range
              numberOfMonths={wide() ? 2 : 1}
              firstDayOfWeek={1}
              presets={stays}
              trigger={
                <DateTrigger
                  title={stayTitle() ?? "Check-in – check-out"}
                  placeholder={!stayTitle()}
                  open={false}
                  style={trigger}
                />
              }
              {...datePickerLook({ months: () => (wide() ? 2 : 1), firstDayOfWeek: 1 })}
            />
          </Field>
          <Field
            label="Meeting"
            detail={
              desktop
                ? "A day, then its time; the day again closes the calendar"
                : "A tap picks the day; open it again for the time"
            }
          >
            <DatePicker
              value={meeting()}
              onChange={({ value }) => {
                meeting.set(typeof value === "string" ? value : null);
                log(`Meeting → ${JSON.stringify(value)}`);
              }}
              timePrecision="minute"
              hourCycle={cycle()}
              defaultTime="09:00"
              timeLabel={<Text style={{ fontSize: 13, color: colors.muted }}>Time</Text>}
              timeAccessibilityLabel="Meeting time"
              trigger={
                <DateTrigger
                  title={meetingTitle() ?? "Not scheduled"}
                  placeholder={!meetingTitle()}
                  open={false}
                  style={trigger}
                />
              }
              {...datePickerLook()}
            />
          </Field>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
