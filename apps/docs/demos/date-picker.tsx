import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import type { DatePickerValue } from "nsh/base";

import {
  DatePicker,
  DatePickerTrigger,
  DatePickerValue as DatePickerLabel,
} from "@/packages/ui/date-picker";

function App() {
  const due = signal<DatePickerValue>("2026-03-15");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Date picker</Text>
      <DatePicker value={due()} onChange={({ value }) => due.set(value)}>
        <DatePickerTrigger>
          <DatePickerLabel placeholder="Pick a date" />
        </DatePickerTrigger>
      </DatePicker>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => (typeof due() === "string" ? due() : "—")}
      </Text>
    </View>
  );
}

mount(App);
