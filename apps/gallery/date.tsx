// Dates: calendar states, time segments, and a closed date picker.
// The shot is 390 wide, so nothing here opens a popup over the rows.
import { colors } from "@shadcn-nsh/theme";
import {
  Calendar,
  DatePicker,
  DatePickerTrigger,
  DatePickerValue,
  TimeField,
} from "@shadcn-nsh/ui";
import { mount, Text } from "nsh";

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
// Keep today, a short range, and one disabled day on screen together.
const rangeStart = today > 10 ? 2 : 20;
const disabledDay = today > 10 ? 8 : 12;
const range: [string, string] = [iso(year, month, rangeStart), iso(year, month, rangeStart + 3)];
const disabled = iso(year, month, disabledDay);

function DatesPage() {
  return (
    <Page>
      <Panel title="Calendar">
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
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
          <DatePicker value={iso(year, month, Math.min(today, 28))} style={fill}>
            <DatePickerTrigger>
              <DatePickerValue />
            </DatePickerTrigger>
          </DatePicker>
        </Row>
        <Row label="empty">
          <DatePicker style={fill}>
            <DatePickerTrigger>
              <DatePickerValue placeholder="Pick a date" />
            </DatePickerTrigger>
          </DatePicker>
        </Row>
        <Row label="clear">
          <DatePicker cleanable value={iso(year, month, Math.min(today, 28))} style={fill}>
            <DatePickerTrigger>
              <DatePickerValue />
            </DatePickerTrigger>
          </DatePicker>
        </Row>
        <Row label="disabled">
          <DatePicker disabled value={iso(year, month, Math.min(today, 28))} style={fill}>
            <DatePickerTrigger>
              <DatePickerValue />
            </DatePickerTrigger>
          </DatePicker>
        </Row>
      </Panel>
    </Page>
  );
}

mount(DatesPage);
