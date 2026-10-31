import { Button } from "@workspace/ui/components/ui/button";
import { colors } from "@workspace/ui/lib/theme";
import { mount, signal, Text, View } from "nsh";

function App() {
  const count = signal(0);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
        gap: 16,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 8,
        }}
      >
        __APP_NAME__
      </Text>
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
        Monorepo starter — UI lives in packages/ui. Clicks: {() => count()}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Button onPress={() => count.set(count() + 1)}>Default</Button>
        <Button variant="secondary" onPress={() => count.set(count() + 1)}>
          Secondary
        </Button>
        <Button variant="outline" onPress={() => count.set(count() + 1)}>
          Outline
        </Button>
      </View>
    </View>
  );
}

mount(App);
