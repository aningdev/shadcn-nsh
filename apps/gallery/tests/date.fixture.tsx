import { mount, platform, signal, Text, View } from "nsh";
import { Button } from "nsh/base";

import {
  Calendar,
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  TimeField,
  calendarLook,
  listboxPopup,
  pickerLook,
  timeFieldClass,
} from "../../../packages/ui";

function popupChrome() {
  const p = listboxPopup();
  if (platform.desktop) {
    return `popup|${p.padding}|none`;
  }
  return `sheet|${p.borderTopLeftRadius}|${p.borderTopRightRadius}|${p.maxHeight}|${p.paddingHorizontal}|${p.paddingBottom}`;
}

function pickerSize() {
  const look = pickerLook({ open: false });
  return `${look.style.height}|${look.style.minWidth ?? 0}`;
}

function timeSize() {
  return timeFieldClass.includes("h-8") ? 32 : 44;
}

function App() {
  const day = signal("2026-03-10");
  const range = signal("none");
  const time = signal("09:30");
  const due = signal("2031-06-10");
  const open = signal(false);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>desktop={String(platform.desktop)}</Text>
      <Text>
        calendar-size={calendarLook.cell}|{calendarLook.monthGap}|{platform.desktop ? 13 : 15}
      </Text>
      <Text>picker-size={pickerSize()}</Text>
      <Text>popup={popupChrome()}</Text>
      <Text>time-size={timeSize()}</Text>
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
        value={due()}
        open={open()}
        onChange={({ value }) => due.set(typeof value === "string" ? value : "none")}
        onOpenChange={({ open: next }) => open.set(next)}
      >
        <DatePickerTrigger />
        <DatePickerContent accessibilityLabel="Due" />
      </DatePicker>
      <Text>due={due()}</Text>
      <Text>open={String(open())}</Text>
    </View>
  );
}

mount(App);
