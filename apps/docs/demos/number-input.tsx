import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { NumberInput } from "../../../packages/ui/number-input";

function App() {
  const n = signal<number | null>(1);

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        Number Input
      </Text>
      <NumberInput value={n()} min={0} max={99} step={1} onChange={({ value }) => n.set(value)} />
      <NumberInput value={3} disabled />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => (n() == null ? "—" : String(n()))}
      </Text>
    </View>
  );
}

mount(App);
