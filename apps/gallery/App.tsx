import { colors } from "@shadcn-nsh/theme";
import { Button } from "@shadcn-nsh/ui";
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
        shadcn-nsh
      </Text>
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
        Styled Button on nsh/base. Clicks: {() => count()}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
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
        <Button variant="destructive" onPress={() => count.set(count() + 1)}>
          Destructive
        </Button>
        <Button disabled onPress={() => count.set(count() + 1)}>
          Disabled
        </Button>
      </View>
    </View>
  );
}

mount(App);
