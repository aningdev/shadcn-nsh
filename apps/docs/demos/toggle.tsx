import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Toggle } from "../../../packages/ui/toggle";

function App() {
  const bold = signal(false);
  const italic = signal(true);

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Toggle</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
          <Text style={{ fontSize: 13, color: colors.foreground }}>Bold</Text>
        </Toggle>
        <Toggle pressed={italic()} onChange={({ pressed }) => italic.set(pressed)}>
          <Text style={{ fontSize: 13, color: colors.foreground }}>Italic</Text>
        </Toggle>
        <Toggle disabled pressed>
          <Text style={{ fontSize: 13, color: colors.foreground }}>Disabled</Text>
        </Toggle>
      </View>
    </View>
  );
}

mount(App);
