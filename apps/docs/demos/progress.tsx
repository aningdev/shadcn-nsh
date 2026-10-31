import { colors } from "@shadcn-nsh/theme";
import { Button } from "../../../packages/ui/button";
import { Progress } from "../../../packages/ui/progress";
import { mount, signal, Text, View } from "nsh";

function App() {
  const value = signal(55);

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
        Progress · {() => value()}%
      </Text>
      <Progress value={value()} />
      <Progress indeterminate />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button variant="outline" onPress={() => value.set(Math.max(0, value() - 10))}>
          −10
        </Button>
        <Button variant="outline" onPress={() => value.set(Math.min(100, value() + 10))}>
          +10
        </Button>
      </View>
    </View>
  );
}

mount(App);
