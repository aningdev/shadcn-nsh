import {
  Calendar,
  calendarVariants,
  DatePicker,
  DatePickerTrigger,
  DatePickerValue,
  datePickerPopupChrome,
  datePickerVariants,
  TimeField,
  timeFieldVariants,
} from "@shadcn-nsh/ui";
import { mount, platform, signal, Text, View } from "nsh";
import { Button } from "nsh/base";

function App() {
  const day = signal("2026-03-10");
  const range = signal("none");
  const time = signal("09:30");
  const due = signal("2031-06-10");
  const open = signal(false);
  const calendar = calendarVariants();
  const picker = datePickerVariants();
  const field = timeFieldVariants();
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>desktop={String(platform.desktop)}</Text>
      <Text>
        calendar-size={calendar.cell}|{calendar.monthGap}|{calendar.day}
      </Text>
      <Text>
        picker-size={picker.style.minHeight}|{picker.style.minWidth ?? 0}
      </Text>
      <Text>popup={datePickerPopupChrome()}</Text>
      <Text>time-size={field.style.minHeight}</Text>
      <Calendar
        value={day()}
        disabledMatcher={(date) => date === "2026-03-16"}
        onChange={({ value }) => day.set(typeof value === "string" ? value : "none")}
      />
      <Text>day={day()}</Text>
      <Calendar
        range
        defaultValue={["2026-04-10", "2026-04-12"]}
        onChange={({ value }) =>
          range.set(Array.isArray(value) ? `${value[0] ?? ""}..${value[1] ?? ""}` : "none")
        }
      />
      <Text>range={range()}</Text>
      <TimeField
        accessibilityLabel="Alarm"
        value={time()}
        onChange={({ value }) => time.set(value)}
      />
      <Text>time={time()}</Text>
      <Button accessibilityLabel="Set time" onPress={() => time.set("11:11")}>
        <Text>Set time</Text>
      </Button>
      <DatePicker
        accessibilityLabel="Due"
        value={due()}
        onChange={({ value }) => due.set(typeof value === "string" ? value : "none")}
        onOpenChange={({ open: next }) => open.set(next)}
      >
        <DatePickerTrigger testID="due">
          <DatePickerValue />
        </DatePickerTrigger>
      </DatePicker>
      <Text>due={due()}</Text>
      <Text>open={String(open())}</Text>
    </View>
  );
}

mount(App);
