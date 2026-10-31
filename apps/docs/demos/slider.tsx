import { colors } from "@shadcn-nsh/theme";
import { Slider } from "../../../packages/ui/slider";
import { mount, signal, Text, View } from "nsh";

function App() {
  const volume = signal(40);

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
        Slider · {() => Math.round(volume() as number)}
      </Text>
      <Slider value={volume()} onChange={({ value }) => volume.set(value as number)} />
      <Slider value={10} disabled />
    </View>
  );
}

mount(App);
