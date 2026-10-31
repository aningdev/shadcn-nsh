import { colors } from "@shadcn-nsh/theme";
import { Tab, Tabs } from "../../../packages/ui/tabs";
import { mount, signal, Text, View } from "nsh";

function App() {
  const tab = signal("one");

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Tabs</Text>
      <Tabs>
        <Tab selected={tab() === "one"} onPress={() => tab.set("one")}>
          <Text style={{ fontSize: 13, color: colors.foreground }}>One</Text>
        </Tab>
        <Tab selected={tab() === "two"} onPress={() => tab.set("two")}>
          <Text style={{ fontSize: 13, color: colors.foreground }}>Two</Text>
        </Tab>
        <Tab selected={tab() === "three"} onPress={() => tab.set("three")}>
          <Text style={{ fontSize: 13, color: colors.foreground }}>Three</Text>
        </Tab>
      </Tabs>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Panel: {() => tab()}
      </Text>
    </View>
  );
}

mount(App);
