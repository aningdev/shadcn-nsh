import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { signal, Text, View } from "nsh";
// DatePicker: the official gallery's calendar scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Deadline`, `Booking`, `Reminder`, `Slots`) with this library's parts — a deadline on weekdays with presets
// beside the calendar, a stay picked as a range with its bill, a meeting's day and time, and a day whose
// free times are chips.
import type { DatePickerValue, DateRangePreset } from "nsh/base";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { DatePicker, DatePickerContent, DatePickerTrigger } from "@/packages/ui/date-picker";
import { controlSize, narrowWindow, RowDivider } from "@/packages/ui/lib/surface";
import { Radio, RadioGroup } from "@/packages/ui/radio-group";

import { Caption, DemoCard, DemoPage } from "../kit";

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
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Today at midnight: presets and limits count from it. */
const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const daysBetween = (from: string, to: string) =>
  Math.round(
    (new Date(`${to}T00:00`).getTime() - new Date(`${from}T00:00`).getTime()) / 86_400_000,
  );
/** `Oct 28`. */
const monthDay = (value: string) =>
  `${MONTHS[Number(value.slice(5, 7)) - 1].slice(0, 3)} ${Number(value.slice(8, 10))}`;
/** `Wednesday, Oct 28`. */
const dayTitle = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00`);
  return `${WEEKDAYS[date.getDay()]}, ${monthDay(value)}`;
};
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "15:30", "16:00"];
/** Whether a day's `i`th time is taken already: a few a day, a different few each day. */
const slotTaken = (date: string, i: number) => (Number(date.slice(8, 10)) + i * 3) % 5 === 0;

const NIGHT = 180;
const WEEKEND_NIGHT = 220;
const CLEANING = 60;

function Row(props: { first?: boolean; children: JSX.Element }) {
  return (
    <View>
      <RowDivider show={!props.first} />
      <View
        style={{
          flexDirection: narrowWindow() ? "column" : "row",
          alignItems: narrowWindow() ? "stretch" : "center",
          gap: narrowWindow() ? 8 : 12,
          paddingVertical: 10,
          minHeight: controlSize.row,
        }}
      >
        {props.children}
      </View>
    </View>
  );
}

function Label(props: { label: string; detail?: string }) {
  return (
    <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
      <Text style={{ fontSize: controlSize.label, color: colors.foreground, fontWeight: "500" }}>
        {props.label}
      </Text>
      {props.detail ? (
        <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
          {props.detail}
        </Text>
      ) : null}
    </View>
  );
}

export function DatePickerDemo() {
  const last = signal("—");

  const due = signal<string | null>(iso(addDays(today, 2)));
  const monday = addDays(today, (8 - today.getDay()) % 7 || 7);
  const presets: DateRangePreset[] = [
    { label: "Today", value: iso(today) },
    { label: "Tomorrow", value: iso(addDays(today, 1)) },
    { label: "Next Monday", value: iso(monday) },
    { label: "In two weeks", value: iso(addDays(today, 14)) },
  ];
  const soon = () => {
    const d = due();
    if (!d) return { label: "No deadline", tone: "neutral" as const };
    const days = daysBetween(iso(today), d);
    if (days === 0) return { label: "Due today", tone: "destructive" as const };
    if (days === 1) return { label: "Due tomorrow", tone: "warn" as const };
    return {
      label: days < 0 ? `${-days} days late` : `Due in ${days} days`,
      tone: days < 0 || days <= 3 ? ("warn" as const) : ("neutral" as const),
    };
  };

  const stay = signal<DatePickerValue>(null);
  const nights = () => {
    const r = stay();
    if (!Array.isArray(r) || !r[0] || !r[1]) return 0;
    return Math.max(daysBetween(r[0], r[1]), 0);
  };
  const lodging = () => {
    const r = stay();
    if (!Array.isArray(r) || !r[0]) return 0;
    let total = 0;
    for (let i = 0; i < nights(); i++) {
      const day = new Date(`${r[0]}T00:00`);
      day.setDate(day.getDate() + i);
      const weekend = day.getDay() === 5 || day.getDay() === 6;
      total += weekend ? WEEKEND_NIGHT : NIGHT;
    }
    return total;
  };
  const total = () => (nights() ? lodging() + CLEANING : 0);
  const stayTitle = () => {
    const r = stay();
    return Array.isArray(r) && r[0] && r[1]
      ? `${monthDay(r[0])} – ${monthDay(r[1])}, ${r[1].slice(0, 4)}`
      : undefined;
  };

  // Time slots: the next weekday to book, and one of its free times.
  const soonest = (() => {
    let day = addDays(today, 1);
    while (day.getDay() === 0 || day.getDay() === 6) day = addDays(day, 1);
    return day;
  })();
  const openDay = signal<string | null>(iso(soonest));
  const slot = signal<string | null>(null);
  const closed = (date: string) => {
    const week = new Date(`${date.slice(0, 10)}T00:00`).getDay();
    return date <= iso(today) || week === 0 || week === 6;
  };
  const free = () => (openDay() ? SLOTS.filter((_, i) => !slotTaken(openDay()!, i)).length : 0);
  const taken = (i: number) => (openDay() ? slotTaken(openDay()!, i) : false);
  /** A time's chip: raised while free, in the accent while chosen, struck through while taken. */
  const chip = (on: boolean) => ({
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: 32,
    width: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: on ? colors.brandEdge : colors.border,
    backgroundColor: on ? colors.brandFill : colors.raised,
  });

  const meeting = signal<string | null>(null);
  const meetingTitle = () => {
    const v = meeting();
    if (!v) return undefined;
    const hour = Number(v.slice(11, 13));
    const clock = `${hour % 12 === 0 ? 12 : hour % 12}:${v.slice(14, 16)} ${hour < 12 ? "AM" : "PM"}`;
    return `${dayTitle(v)}, ${clock}`;
  };

  return (
    <DemoPage title="Date Picker" note={() => last()}>
      <DemoCard title="Deadline" subtitle="Weekdays only, presets beside the calendar">
        <View>
          <Row first>
            <Label label="Deadline" detail="Nothing in the past" />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Badge tone={soon().tone}>{soon().label}</Badge>
              <DatePicker
                value={due()}
                cleanable
                placeholder="No deadline"
                onChange={({ value }) => {
                  const next = typeof value === "string" ? value : null;
                  due.set(next);
                  last.set(`Deadline: ${next ? dayTitle(next) : "none"}`);
                }}
              >
                <DatePickerTrigger
                  title={due() ? monthDay(due()!) : "No deadline"}
                  testID="deadline"
                  accessibilityLabel="Deadline"
                  style={{ width: narrowWindow() ? "100%" : 200 }}
                />
                <DatePickerContent
                  disabledMatcher={{ before: iso(today) }}
                  presets={presets}
                  clearButtonAccessibilityLabel="Clear the deadline"
                />
              </DatePicker>
            </View>
          </Row>
          <Row>
            <Label label="Sprint start" detail="Locked once the sprint began" />
            <DatePicker value={iso(addDays(today, -9))} disabled onChange={() => {}}>
              <DatePickerTrigger
                title={monthDay(iso(addDays(today, -9)))}
                style={{ width: narrowWindow() ? "100%" : 200 }}
              />
              <DatePickerContent />
            </DatePicker>
          </Row>
        </View>
      </DemoCard>

      <DemoCard title="Stay" subtitle="A range over two months, weekends priced higher">
        <DatePicker
          value={stay()}
          onChange={({ value }) => {
            stay.set(value);
            const r = value;
            last.set(
              Array.isArray(r) && r[0] && r[1]
                ? `Stay: ${r[0]} → ${r[1]}, ${nights()} nights`
                : "Stay: picking",
            );
          }}
        >
          <DatePickerTrigger
            title={stayTitle() ?? "Check-in – check-out"}
            style={{ width: "100%" }}
          />
          <DatePickerContent range numberOfMonths={2} firstDayOfWeek={1} />
        </DatePicker>
        {nights() ? (
          <View style={{ gap: 6, marginTop: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: controlSize.label }}>
                {`${nights()} ${nights() === 1 ? "night" : "nights"}`}
              </Text>
              <Text style={{ fontSize: controlSize.label, fontVariant: ["tabular-nums"] }}>
                {money(lodging())}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: controlSize.label }}>Cleaning</Text>
              <Text style={{ fontSize: controlSize.label, fontVariant: ["tabular-nums"] }}>
                {money(CLEANING)}
              </Text>
            </View>
            <RowDivider show />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: controlSize.label, fontWeight: "600" }}>Total</Text>
              <Text
                style={{
                  fontSize: controlSize.label,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {money(total())}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: narrowWindow() ? "column" : "row",
              alignItems: narrowWindow() ? "flex-start" : "center",
              gap: 12,
              marginTop: 10,
            }}
          >
            <Caption>Fridays and Saturdays are $220 a night, other nights $180</Caption>
            {narrowWindow() ? null : <View style={{ flex: 1 }} />}
            <Button disabled>Reserve</Button>
          </View>
        )}
        {nights() ? (
          <View style={{ alignItems: "flex-end", marginTop: 12 }}>
            <Button onPress={() => last.set(`Reserved: ${money(total())}`)}>Reserve</Button>
          </View>
        ) : null}
      </DemoCard>

      <DemoCard title="Meeting" subtitle="A day, then its time; the day again closes it">
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: controlSize.label, fontWeight: "500" }}>Scheduled for</Text>
          <DatePicker
            value={meeting()}
            onChange={({ value }) => {
              const next = typeof value === "string" ? value : null;
              meeting.set(next);
              last.set(`Meeting: ${next ?? "not scheduled"}`);
            }}
          >
            <DatePickerTrigger
              title={meetingTitle() ?? "Not scheduled"}
              style={{ width: "100%" }}
            />
            <DatePickerContent
              timePrecision="minute"
              hourCycle="h12"
              defaultTime="09:00"
              timeLabel={<Text style={{ fontSize: controlSize.detail }}>Time</Text>}
              timeAccessibilityLabel="Meeting time"
            />
          </DatePicker>
          <Caption>
            {meeting()
              ? "Open it again to move the day or the time; the value is a local ISO date-time"
              : "Days first: the time follows in the same calendar"}
          </Caption>
        </View>
      </DemoCard>
      <DemoCard title="Time slots" subtitle="A weekday first, then one of its free times">
        <Row first>
          <Label label="Day" detail="From tomorrow, on weekdays" />
          <DatePicker
            value={openDay()}
            onChange={({ value }) => {
              const next = typeof value === "string" ? value : null;
              openDay.set(next);
              slot.set(null);
              last.set(`Day: ${next ? dayTitle(next) : "none"}`);
            }}
          >
            <DatePickerTrigger
              title={openDay() ? dayTitle(openDay()!) : "Pick a day"}
              style={{ width: narrowWindow() ? "100%" : 180 }}
            />
            <DatePickerContent disabledMatcher={closed} accessibilityLabel="Appointment day" />
          </DatePicker>
        </Row>
        <RadioGroup
          accessibilityLabel="Appointment time"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 10 }}
        >
          <Each of={SLOTS}>
            {(time, i) => (
              <Radio
                checked={slot() === time()}
                disabled={!openDay() || taken(i())}
                onChange={() => {
                  slot.set(time());
                  last.set(`Slot: ${monthDay(openDay()!)} at ${time()}`);
                }}
                indicator={false}
                style={chip(slot() === time())}
                disabledStyle={{ opacity: 0.5 }}
              >
                <Text
                  style={{
                    fontSize: controlSize.detail,
                    fontWeight: "500",
                    fontVariant: ["tabular-nums"],
                    color: slot() === time() ? colors.brand : colors.foreground,
                    textDecorationLine: taken(i()) ? "line-through" : "none",
                  }}
                >
                  {time()}
                </Text>
              </Radio>
            )}
          </Each>
        </RadioGroup>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Badge tone={free() ? "neutral" : "warn"}>{`${free()} open`}</Badge>
          <View style={{ flex: 1 }} />
          <Button
            disabled={!slot() || !openDay()}
            onPress={() => last.set(`Booked: ${dayTitle(openDay()!)} at ${slot()}`)}
          >
            {slot() && openDay() ? `Book at ${slot()}` : "Pick a time"}
          </Button>
        </View>
      </DemoCard>
    </DemoPage>
  );
}
