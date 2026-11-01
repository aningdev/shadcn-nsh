import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../packages/ui/select";

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
      <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => fruit() ?? "—"}
      </Text>
    </View>
  );
}

mount(App);
