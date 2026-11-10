import { colors } from "@shadcn-nsh/theme";
import { Text, View, mount, signal } from "nsh";

import {
  ColorArea,
  ColorEyeDropper,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
} from "@/packages/ui/color-picker";

function App() {
  const color = signal("#2563eb");
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Color</Text>
      <ColorPicker
        value={color()}
        onChange={(event) => color.set(event.value)}
        style={{ width: 280, gap: 10 }}
      >
        <ColorArea accessibilityLabel="Saturation" style={{ width: 280, height: 96 }} />
        <ColorSlider accessibilityLabel="Hue" channel="hue" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ColorField accessibilityLabel="Hex" style={{ width: 120 }} />
          <ColorSwatch accessibilityLabel="Current" />
          <ColorSwatch color="#b91c1c" accessibilityLabel="Red" />
          <ColorEyeDropper accessibilityLabel="Pick">
            <Text style={{ fontSize: 13, color: colors.foreground }}>Pick</Text>
          </ColorEyeDropper>
        </View>
      </ColorPicker>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{color()}</Text>
    </View>
  );
}

mount(App);
