import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { RadioGroup, RadioGroupItem } from "../../../packages/ui/radio-group";

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
        <RadioGroupItem
          checked={radio() === "a"}
          onChange={({ checked }) => checked && radio.set("a")}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>Option A</Text>
        </RadioGroupItem>
        <RadioGroupItem
          checked={radio() === "b"}
          onChange={({ checked }) => checked && radio.set("b")}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>Option B</Text>
        </RadioGroupItem>
        <RadioGroupItem
          checked={radio() === "c"}
          onChange={({ checked }) => checked && radio.set("c")}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>Option C</Text>
        </RadioGroupItem>
      </RadioGroup>
      <RadioGroupItem disabled checked={false}>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Disabled</Text>
      </RadioGroupItem>
      <RadioGroup style={{ gap: 16 }}>
        <RadioGroupItem
          checked={radio() === "a"}
          onChange={() => radio.set("a")}
          style={{ gap: 12 }}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>Style merge</Text>
        </RadioGroupItem>
      </RadioGroup>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Selected: {() => radio()}</Text>
    </View>
  );
}

mount(App);
