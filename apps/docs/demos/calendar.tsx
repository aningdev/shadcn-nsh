import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Calendar } from "@/packages/ui/calendar";

function App() {
  const day = signal<string | null>("2026-03-15");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Calendar</Text>
      <Calendar
        value={day()}
        onChange={({ value }) => day.set(typeof value === "string" ? value : null)}
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => day() ?? "—"}
      </Text>
    </View>
  );
}

mount(App);
