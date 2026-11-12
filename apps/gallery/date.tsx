import { mount, signal, Text } from "nsh";

// Dates: calendar states, time segments, and a closed date picker.
import { colors } from "../../packages/theme";
import { Calendar, DatePicker, DateTrigger, TimeField } from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

const fill = { flex: 1, alignSelf: "stretch" as const };

function iso(year: number, month: number, day: number) {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const today = now.getDate();
const rangeStart = today > 10 ? 2 : 20;
const disabledDay = today > 10 ? 8 : 12;
const range: [string, string] = [iso(year, month, rangeStart), iso(year, month, rangeStart + 3)];
const disabled = iso(year, month, disabledDay);

function DatesPage() {
  const due = iso(year, month, Math.min(today, 28));
  const open = signal(false);
  const emptyOpen = signal(false);
  const clearOpen = signal(false);
  const clearVal = signal(due);
  return (
    <Page>
      <Panel title="Calendar">
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Range, today, other months, disabled
        </Text>
        <Calendar
          range
          value={range}
          disabledMatcher={(date) => date === disabled}
          style={{ alignSelf: "flex-start" }}
        />
      </Panel>
      <Panel title="Time">
        <Row label="minute">
          <TimeField accessibilityLabel="Alarm" value="09:30" style={fill} />
        </Row>
        <Row label="seconds">
          <TimeField
            accessibilityLabel="Seconds"
            precision="second"
            value="09:30:00"
            style={fill}
          />
        </Row>
        <Row label="12-hour">
          <TimeField accessibilityLabel="Twelve hour" hourCycle="h12" value="21:15" style={fill} />
        </Row>
        <Row label="disabled">
          <TimeField accessibilityLabel="Disabled time" value="09:30" disabled style={fill} />
        </Row>
      </Panel>
      <Panel title="Date picker">
        <Row label="value">
          <DatePicker
            value={due}
            open={open()}
            onOpenChange={({ open: next }) => open.set(next)}
            style={fill}
            trigger={<DateTrigger title={due} placeholder={false} open={open()} style={fill} />}
          />
        </Row>
        <Row label="empty">
          <DatePicker
            open={emptyOpen()}
            onOpenChange={({ open: next }) => emptyOpen.set(next)}
            style={fill}
            trigger={
              <DateTrigger title="Pick a date" placeholder open={emptyOpen()} style={fill} />
            }
          />
        </Row>
        <Row label="clear">
          <DatePicker
            value={clearVal()}
            open={clearOpen()}
            onOpenChange={({ open: next }) => clearOpen.set(next)}
            onChange={({ value }) => {
              if (typeof value === "string") clearVal.set(value);
            }}
            style={fill}
            trigger={
              <DateTrigger
                title={clearVal()}
                placeholder={false}
                open={clearOpen()}
                clearable
                style={fill}
              />
            }
          />
        </Row>
        <Row label="disabled">
          <DatePicker
            disabled
            value={due}
            style={fill}
            trigger={
              <DateTrigger title={due} placeholder={false} open={false} disabled style={fill} />
            }
          />
        </Row>
      </Panel>
    </Page>
  );
}

mount(DatesPage);
