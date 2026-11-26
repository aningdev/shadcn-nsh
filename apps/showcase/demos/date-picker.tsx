// DatePicker: the official gallery's calendar scenes (`references/nsh/examples/gallery/demos/Controls.tsx`:
// `Dates`, `Reminder` when `nsh/mobile` is available, `Booking`, `Deadline`, `Slots`) with this library's
// `DatePicker`, `DatePickerTrigger`, `DatePickerContent`, `Badge`, `Button`, and `RadioGroup` parts.
// Compact triggers sit at the end of `plainRow` rows (or `flex-start` in `Booking`) so every calendar
// popup is sized by its calendar and aligned to its trigger rather than stretched across the card.
import { colors, finish, rounded, shape, type Tone } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { platform, signal, Text, View, windowSize } from "nsh";
import type { DateMatcher, DateRangePreset } from "nsh/base";
import { DateTimePicker, isAvailable } from "nsh/mobile";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import {
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  type DatePickerValue,
} from "@/packages/ui/date-picker";
import {
  controlSize,
  density,
  plainRow,
  RowDivider,
  RowLabel,
  sectionSurface,
} from "@/packages/ui/lib/surface";
import { Radio, RadioGroup } from "@/packages/ui/radio-group";

import { Caption, DemoPage } from "../kit";

const pointer = platform.desktop;

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
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** A day's ISO date (`"2026-10-28"`), in local time as the calendar's days are. */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** An ISO date's month and day as a trigger shows them: `Oct 28`. */
const monthDay = (value: string) =>
  `${MONTHS[Number(value.slice(5, 7)) - 1].slice(0, 3)} ${Number(value.slice(8, 10))}`;

/** An ISO date (and time) as a trigger shows it: `Oct 28, 2026`, `Oct 28, 2026 · 09:30`. */
const shortDate = (value: string) =>
  `${monthDay(value)}, ${value.slice(0, 4)}${value.length > 10 ? ` · ${value.slice(11, 16)}` : ""}`;

/** An ISO date's day, in local time. */
const dateOf = (value: string) =>
  new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)));
const weekday = (value: string) => dateOf(value).getDay();

/** An ISO date as a row of a booking or deadline shows it: `Thu, Oct 29`. */
const dayTitle = (value: string) => `${DAY_NAMES[weekday(value)]}, ${monthDay(value)}`;

/** The days from one ISO date to another. */
const daysBetween = (from: string, to: string) => {
  const day = (v: string) =>
    Date.UTC(Number(v.slice(0, 4)), Number(v.slice(5, 7)) - 1, Number(v.slice(8, 10)));
  return Math.round((day(to) - day(from)) / 86_400_000);
};

/** A night's rate: Fridays and Saturdays cost more. */
const nightRate = (value: string) => (weekday(value) === 5 || weekday(value) === 6 ? 220 : 180);
const CLEANING = 40;
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "15:30", "16:00"];
const slotTaken = (date: string, i: number) => (Number(date.slice(8, 10)) + i * 3) % 5 === 0;

/** An amount in dollars and cents: `$1,204.50`. */
const money = (n: number) => {
  const [whole, cents] = n.toFixed(2).split(".");
  return `$${Number(whole).toLocaleString("en-US")}.${cents}`;
};

/** A card matching `DemoCard` with an optional trailing header slot for a status badge. */
function SectionCard(props: {
  title: string;
  subtitle?: string;
  right?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <View style={[sectionSurface({ padded: true }), { gap: density.gap + 4 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.subtitle}</Text>
          </If>
        </View>
        {props.right}
      </View>
      {props.children}
    </View>
  );
}

/** A line of a bill: what it is for, and the amount. */
function BillLine(props: { label: string; amount: number; total?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: controlSize.gap }}>
      <Text
        style={{
          flex: 1,
          fontSize: props.total ? controlSize.label : controlSize.detail,
          fontWeight: props.total ? "600" : "400",
          color: props.total ? colors.foreground : colors.mutedForeground,
        }}
      >
        {props.label}
      </Text>
      <Text
        style={{
          fontSize: props.total ? controlSize.label + 2 : controlSize.detail,
          fontWeight: props.total ? "600" : "500",
          color: props.total ? colors.foreground : colors.mutedForeground,
          fontVariant: ["tabular-nums"],
          textAlign: "right",
        }}
      >
        {money(props.amount)}
      </Text>
    </View>
  );
}

const today = new Date();

export function DatePickerDemo() {
  const last = signal("—");

  // Dates card state
  const dueBasic = signal<string | null>(null);
  const trip = signal<DatePickerValue>(null);
  const meeting = signal<string | null>(null);
  const twoMonths = () => pointer && windowSize().width >= 600;
  const saturday = addDays(today, (6 - today.getDay() + 7) % 7);
  const trips: DateRangePreset[] = [
    { label: "Weekend", value: [iso(saturday), iso(addDays(saturday, 1))] },
    { label: "Next 7 days", value: [iso(today), iso(addDays(today, 6))] },
    { label: "Next 30 days", value: [iso(today), iso(addDays(today, 29))] },
  ];
  const tripTitle = () => {
    const r = trip();
    return Array.isArray(r) && r[0] && r[1]
      ? `${monthDay(r[0])} – ${monthDay(r[1])}`
      : "Pick dates";
  };

  // Reminder card state (nsh/mobile only)
  const starts = signal(`${iso(addDays(today, 1))}T08:00`);
  const at = signal("09:30");
  const until = signal(iso(addDays(today, 30)));
  const reminderDays = () => daysBetween(starts().slice(0, 10), until()) + 1;

  // Booking card state
  const first = iso(today);
  const soldOut = [iso(addDays(today, 8)), iso(addDays(today, 9))];
  const bookingClosed: DateMatcher = (date) => date < first || soldOut.includes(date);
  const stay = signal<DatePickerValue>(null);
  const completeStay = (): [string, string] | null => {
    const s = stay();
    return Array.isArray(s) && s[0] && s[1] ? [s[0], s[1]] : null;
  };
  const nights = () => {
    const c = completeStay();
    return c ? daysBetween(c[0], c[1]) : 0;
  };
  const lodging = () => {
    const c = completeStay();
    let sum = 0;
    for (let i = 0; c && i < nights(); i++) sum += nightRate(iso(addDays(dateOf(c[0]), i)));
    return sum;
  };
  const bookingTotal = () => (nights() ? lodging() + CLEANING : 0);
  const stayTitle = () => {
    const c = completeStay();
    return c ? `${dayTitle(c[0])} – ${dayTitle(c[1])}` : "Check-in – Check-out";
  };

  // Deadline card state
  const due = signal<string | null>(iso(addDays(today, 2)));
  const monday = addDays(today, (8 - today.getDay()) % 7 || 7);
  const quick: DateRangePreset[] = [
    { label: "Today", value: iso(today) },
    { label: "Tomorrow", value: iso(addDays(today, 1)) },
    { label: "Next Monday", value: iso(monday) },
    { label: "In two weeks", value: iso(addDays(today, 14)) },
  ];
  const soon = (): { label: string; tone: Tone } => {
    const d = due();
    if (!d) return { label: "No deadline", tone: "neutral" };
    const days = daysBetween(iso(today), d);
    if (days === 0) return { label: "Due today", tone: "destructive" };
    if (days === 1) return { label: "Due tomorrow", tone: "warn" };
    return { label: `Due in ${days} days`, tone: days <= 3 ? "warn" : "neutral" };
  };

  // Slots card state
  const slotsClosed: DateMatcher = (date) =>
    date <= first || weekday(date) === 0 || weekday(date) === 6;
  const soonest = (() => {
    let day = addDays(today, 1);
    while (day.getDay() === 0 || day.getDay() === 6) day = addDays(day, 1);
    return day;
  })();
  const openDay = signal<string | null>(iso(soonest));
  const slot = signal<string | null>(null);
  const free = () => (openDay() ? SLOTS.filter((_, i) => !slotTaken(openDay()!, i)).length : 0);
  const chip = (on: boolean) => ({
    width: pointer ? 62 : ("31.5%" as const),
    height: pointer ? 30 : 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...rounded(shape.control),
    borderWidth: 1,
    borderColor: on ? colors.brand : colors.border,
    backgroundColor: on ? colors.primary : colors.raised,
    boxShadow: on ? "none" : finish.raised.boxShadow,
  });

  return (
    <DemoPage title="DatePicker" note={() => last()}>
      <SectionCard title="DatePicker" subtitle="A date, a range, or a date and time">
        <View>
          <View style={plainRow({ first: true })}>
            <RowLabel label="Due date" detail="Weekdays; clearable" />
            <DatePicker
              value={dueBasic()}
              cleanable
              onChange={({ value }) => {
                const next = typeof value === "string" ? value : null;
                dueBasic.set(next);
                last.set(`Due: ${next ?? "none"}`);
              }}
            >
              <DatePickerTrigger
                title={dueBasic() ? shortDate(dueBasic()!) : "No due date"}
                placeholder={!dueBasic()}
                accessibilityLabel="Due date"
              />
              <DatePickerContent
                accessibilityLabel="Due date"
                disabledMatcher={[0, 6]}
                align="end"
                clearButtonAccessibilityLabel="Clear the due date"
              />
            </DatePicker>
          </View>
          <View style={plainRow({ first: false })}>
            <RowLabel
              label="Trip"
              detail={twoMonths() ? "A range over two months" : "A range: press its two ends"}
            />
            <DatePicker
              value={trip()}
              onChange={({ value }) => {
                const next = Array.isArray(value) ? value : null;
                trip.set(next);
                last.set(next ? `Trip: ${next[0]} → ${next[1]}` : "Trip: none");
              }}
            >
              <DatePickerTrigger
                title={tripTitle()}
                placeholder={!trip()}
                accessibilityLabel="Trip"
              />
              <DatePickerContent
                range
                accessibilityLabel="Trip"
                numberOfMonths={twoMonths() ? 2 : 1}
                presets={trips}
                align="end"
              />
            </DatePicker>
          </View>
          <View style={plainRow({ first: false })}>
            <RowLabel label="Meeting" detail="A day, then its time" />
            <DatePicker
              value={meeting()}
              onChange={({ value }) => {
                const next = typeof value === "string" ? value : null;
                meeting.set(next);
                last.set(`Meeting: ${next ?? "none"}`);
              }}
            >
              <DatePickerTrigger
                title={meeting() ? shortDate(meeting()!) : "Not scheduled"}
                placeholder={!meeting()}
                accessibilityLabel="Meeting"
              />
              <DatePickerContent
                accessibilityLabel="Meeting"
                timePrecision="minute"
                hourCycle="h23"
                defaultTime="09:00"
                align="end"
                timeLabel={
                  <Text style={{ fontSize: controlSize.label, color: colors.mutedForeground }}>
                    Time
                  </Text>
                }
                timeAccessibilityLabel="Meeting time"
              />
            </DatePicker>
          </View>
        </View>
      </SectionCard>

      <If when={isAvailable}>
        <SectionCard
          title="Reminder"
          subtitle="The system's picker: a day, a time, or both"
          right={
            <Badge tone={reminderDays() > 0 ? "neutral" : "warn"}>
              {reminderDays() > 0 ? `${reminderDays()} days` : "Ends before it starts"}
            </Badge>
          }
        >
          <View>
            <View style={plainRow({ first: true })}>
              <RowLabel label="Starts" detail="The first reminder" />
              <DateTimePicker
                testID="reminder-starts"
                accessibilityLabel="Starts"
                mode="dateTime"
                value={starts()}
                min={`${iso(today)}T00:00`}
                minuteInterval={15}
                onChange={({ value }) => {
                  starts.set(value);
                  last.set(`Starts: ${value}`);
                }}
              />
            </View>
            <View style={plainRow({ first: false })}>
              <RowLabel label="Every day at" detail="Five-minute steps" />
              <DateTimePicker
                testID="reminder-at"
                accessibilityLabel="Every day at"
                mode="time"
                value={at()}
                minuteInterval={5}
                onChange={({ value }) => {
                  at.set(value);
                  last.set(`Every day at: ${value}`);
                }}
              />
            </View>
            <View style={plainRow({ first: false })}>
              <RowLabel label="Until" detail="No later than a year" />
              <DateTimePicker
                testID="reminder-until"
                accessibilityLabel="Until"
                value={until()}
                min={starts().slice(0, 10)}
                max={iso(addDays(today, 365))}
                onChange={({ value }) => {
                  until.set(value);
                  last.set(`Until: ${value}`);
                }}
              />
            </View>
          </View>
        </SectionCard>
      </If>

      <SectionCard
        title="Booking"
        subtitle="Nights and price follow the dates"
        right={
          <Badge tone={nights() ? "accent" : "neutral"}>
            {nights() ? `${nights()} ${nights() === 1 ? "night" : "nights"}` : "No dates"}
          </Badge>
        }
      >
        <View style={{ alignSelf: "flex-start" }}>
          <DatePicker
            value={stay()}
            onChange={({ value }) => {
              const next = Array.isArray(value) ? value : null;
              stay.set(next);
              last.set(next ? `Stay: ${next[0]} → ${next[1]}` : "Stay: none");
            }}
          >
            <DatePickerTrigger
              title={stayTitle()}
              placeholder={!completeStay()}
              accessibilityLabel="Stay"
            />
            <DatePickerContent
              range
              accessibilityLabel="Stay"
              numberOfMonths={twoMonths() ? 2 : 1}
              disabledMatcher={bookingClosed}
              align="start"
            />
          </DatePicker>
        </View>
        <If
          when={nights()}
          else={<Caption>Fridays and Saturdays are $220 a night, other nights $180</Caption>}
        >
          <View style={{ gap: 6 }}>
            <BillLine
              label={`${nights()} ${nights() === 1 ? "night" : "nights"}`}
              amount={lodging()}
            />
            <BillLine label="Cleaning" amount={CLEANING} />
            <RowDivider show />
            <BillLine label="Total" amount={bookingTotal()} total />
          </View>
        </If>
        <View style={{ alignItems: pointer ? "flex-end" : "stretch" }}>
          <Button
            disabled={!nights()}
            onPress={() => {
              const c = completeStay()!;
              last.set(`Reserved: ${c[0]} → ${c[1]}, ${money(bookingTotal())}`);
            }}
          >
            Reserve
          </Button>
        </View>
      </SectionCard>

      <SectionCard title="Deadline" subtitle="Presets beside the calendar; no past days">
        <View>
          <View style={plainRow({ first: true })}>
            <View style={{ flex: 1, gap: 4, alignItems: "flex-start" }}>
              <Text style={{ fontSize: controlSize.label, color: colors.foreground }}>
                Deadline
              </Text>
              <Badge tone={soon().tone}>{soon().label}</Badge>
            </View>
            <DatePicker
              value={due()}
              cleanable
              onChange={({ value }) => {
                const next = typeof value === "string" ? value : null;
                due.set(next);
                last.set(`Deadline: ${next ?? "none"}`);
              }}
            >
              <DatePickerTrigger
                testID="deadline"
                title={due() ? dayTitle(due()!) : "None"}
                placeholder={!due()}
                accessibilityLabel="Deadline"
              />
              <DatePickerContent
                accessibilityLabel="Deadline"
                presets={quick}
                disabledMatcher={{ before: iso(today) }}
                align="end"
                clearButtonAccessibilityLabel="Clear the deadline"
              />
            </DatePicker>
          </View>
          <View style={plainRow({ first: false })}>
            <RowLabel label="Sprint start" detail="Locked once the sprint began" />
            <DatePicker value={iso(addDays(today, -9))} disabled>
              <DatePickerTrigger
                title={dayTitle(iso(addDays(today, -9)))}
                accessibilityLabel="Sprint start"
              />
              <DatePickerContent accessibilityLabel="Sprint start" />
            </DatePicker>
          </View>
        </View>
      </SectionCard>

      <SectionCard
        title="Time slots"
        subtitle="A weekday, then an open time"
        right={<Badge>{`${free()} open`}</Badge>}
      >
        <View style={plainRow({ first: true })}>
          <RowLabel label="Day" detail="From tomorrow, on weekdays" />
          <DatePicker
            value={openDay()}
            onChange={({ value }) => {
              const next = typeof value === "string" ? value : null;
              openDay.set(next);
              slot.set(null);
              last.set(`Day: ${next ?? "none"}`);
            }}
          >
            <DatePickerTrigger
              title={openDay() ? dayTitle(openDay()!) : "Pick a day"}
              placeholder={!openDay()}
              accessibilityLabel="Appointment day"
            />
            <DatePickerContent
              accessibilityLabel="Appointment day"
              disabledMatcher={slotsClosed}
              align="end"
            />
          </DatePicker>
        </View>
        <RadioGroup
          accessibilityLabel="Appointment time"
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: pointer ? "flex-start" : "space-between",
          }}
        >
          <Each of={SLOTS}>
            {(s, i) => (
              <Radio
                checked={slot() === s()}
                disabled={!openDay() || slotTaken(openDay()!, i())}
                onChange={() => {
                  slot.set(s());
                  last.set(`Slot: ${openDay()} ${s()}`);
                }}
                indicator={false}
                style={chip(slot() === s())}
                activeStyle={{ transform: [{ scale: 0.95 }] }}
                disabledStyle={{ opacity: 0.5 }}
              >
                <Text
                  style={{
                    fontSize: controlSize.detail,
                    fontWeight: "500",
                    fontVariant: ["tabular-nums"],
                    color: slot() === s() ? colors.brand : colors.foreground,
                    textDecorationLine:
                      openDay() && slotTaken(openDay()!, i()) ? "line-through" : "none",
                  }}
                >
                  {s()}
                </Text>
              </Radio>
            )}
          </Each>
        </RadioGroup>
        <View style={{ alignItems: pointer ? "flex-end" : "stretch" }}>
          <Button
            testID="book-slot"
            disabled={!slot() || !openDay()}
            onPress={() => last.set(`Booked: ${dayTitle(openDay()!)} at ${slot()}`)}
          >
            {slot() && openDay() ? `Book ${dayTitle(openDay()!)} at ${slot()}` : "Pick a time"}
          </Button>
        </View>
      </SectionCard>
    </DemoPage>
  );
}
