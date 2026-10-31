import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Input } from "../../../packages/ui/input";

function App() {
  const value = signal("");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Input</Text>
      <Input placeholder="Your name" value={value()} onChange={({ value: v }) => value.set(v)} />
      <Input placeholder="Disabled" disabled />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => value() || "—"}
      </Text>
    </View>
  );
}

mount(App);
