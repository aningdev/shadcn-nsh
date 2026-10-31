import { colors } from "@shadcn-nsh/theme";
import { Select } from "../../../packages/ui/select";
import { mount, signal, Text, View } from "nsh";

function App() {
  const fruit = signal<string | null>("apple");

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Select</Text>
      <Select
        value={fruit()}
        onChange={({ value }) => fruit.set(value)}
        items={[
          { value: "apple", title: "Apple" },
          { value: "banana", title: "Banana" },
          { value: "orange", title: "Orange" },
        ]}
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => fruit() ?? "—"}
      </Text>
    </View>
  );
}

mount(App);
