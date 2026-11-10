import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { TimeField } from "@/packages/ui/time-field";

function App() {
  const time = signal("09:30");

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Time field</Text>
      <TimeField value={time()} onChange={({ value }) => time.set(value)} />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Value: {time}</Text>
    </View>
  );
}

mount(App);
