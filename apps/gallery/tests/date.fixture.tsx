import { mount, platform, signal, Text, View } from "nsh";
import { Button } from "nsh/base";

import {
  Calendar,
  CalendarItem,
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  Picker,
  TimeField,
  calendarLook,
  fieldSize,
  listboxPopup,
  timeFieldClass,
} from "../../../packages/ui";

function popupChrome() {
  const p = listboxPopup();
  if (platform.desktop) {
    return `popup|${p.paddingHorizontal}|${p.paddingVertical}|none`;
  }
  return `sheet|${p.borderTopLeftRadius}|${p.borderTopRightRadius}|${p.maxHeight}|${p.paddingHorizontal}|${p.paddingBottom}`;
}

function pickerSize() {
  // Height is the shared field's. A pointer trigger is at least 180 wide; a touch one is not.
  return `${fieldSize.height}|${platform.desktop ? 180 : 0}`;
}

function timeSize() {
  return timeFieldClass().includes("h-8") ? 32 : 44;
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
      {/* On screen, so `app.layout` can read the trigger. The date picker below the calendars is off screen. */}
      <Picker
        title="Due date"
        open={false}
        testID="due-date-size"
        accessibilityLabel="Due date size"
      />
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
        // The library's day, and a probe that shows while the day is in a previewed range's
        // middle: the state the day's band is drawn from.
        renderItem={(item) => (
          <View style={{ flex: 1 }}>
            <CalendarItem item={item} />
            {item.kind === "day" && item.date ? (
              <View
                testID={`preview-${item.date}`}
                class="hidden h-px group-data-range-preview-middle:flex"
              />
            ) : null}
          </View>
        )}
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
        <DatePickerTrigger testID="due-date" accessibilityLabel="Due date" />
        <DatePickerContent accessibilityLabel="Due" />
      </DatePicker>
      <Text>due={due()}</Text>
      <Text>open={String(open())}</Text>
    </View>
  );
}

mount(App);
