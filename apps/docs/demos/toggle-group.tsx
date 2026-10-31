import { colors } from "@shadcn-nsh/theme";
import { Toggle, ToggleGroup } from "../../../packages/ui/toggle-group";
import { mount, signal, Text, View } from "nsh";

function App() {
  const align = signal("left");

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Toggle Group</Text>
      <ToggleGroup>
        <Toggle
          pressed={align() === "left"}
          onChange={({ pressed }) => pressed && align.set("left")}
        >
          <Text style={{ fontSize: 13, color: colors.foreground }}>Left</Text>
        </Toggle>
        <Toggle
          pressed={align() === "center"}
          onChange={({ pressed }) => pressed && align.set("center")}
        >
          <Text style={{ fontSize: 13, color: colors.foreground }}>Center</Text>
        </Toggle>
        <Toggle
          pressed={align() === "right"}
          onChange={({ pressed }) => pressed && align.set("right")}
        >
          <Text style={{ fontSize: 13, color: colors.foreground }}>Right</Text>
        </Toggle>
      </ToggleGroup>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Align: {() => align()}
      </Text>
    </View>
  );
}

mount(App);
