import { colors } from "@shadcn-nsh/theme";
import { Radio, RadioGroup } from "../../../packages/ui/radio-group";
import { mount, signal, Text, View } from "nsh";

function App() {
  const radio = signal("a");

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Radio Group</Text>
      <RadioGroup>
        <Radio checked={radio() === "a"} onChange={({ checked: v }) => v && radio.set("a")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Option A</Text>
        </Radio>
        <Radio checked={radio() === "b"} onChange={({ checked: v }) => v && radio.set("b")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Option B</Text>
        </Radio>
        <Radio checked={radio() === "c"} onChange={({ checked: v }) => v && radio.set("c")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Option C</Text>
        </Radio>
      </RadioGroup>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Selected: {() => radio()}
      </Text>
    </View>
  );
}

mount(App);
