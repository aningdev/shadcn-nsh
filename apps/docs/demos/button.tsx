import { colors } from "@shadcn-nsh/theme";
// Avoid `@shadcn-nsh/ui` barrel: it pulls wrappers that need a newer `nsh/base`.
import { Button } from "../../../packages/ui/button";
import { mount, signal, Text, View } from "nsh";

function App() {
  const count = signal(0);

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
        Button · clicks {() => count()}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Button onPress={() => count.set(count() + 1)}>Default</Button>
        <Button variant="secondary" onPress={() => count.set(count() + 1)}>
          Secondary
        </Button>
        <Button variant="outline" onPress={() => count.set(count() + 1)}>
          Outline
        </Button>
        <Button variant="ghost" onPress={() => count.set(count() + 1)}>
          Ghost
        </Button>
      </View>
    </View>
  );
}

mount(App);
