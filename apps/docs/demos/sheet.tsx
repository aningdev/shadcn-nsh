import { colors } from "@shadcn-nsh/theme";
import { Button } from "../../../packages/ui/button";
import { Sheet } from "../../../packages/ui/sheet";
import { mount, signal, Text, View } from "nsh";

function App() {
  const open = signal(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Sheet</Text>
      <Button onPress={() => open.set(true)}>Open sheet</Button>
      <Sheet open={open()} onOpenChange={({ open: v }) => open.set(v)} side="bottom">
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
            Bottom sheet
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Fixed backdrop and panel chrome from the styled wrapper.
          </Text>
          <Button variant="secondary" onPress={() => open.set(false)}>
            Dismiss
          </Button>
        </View>
      </Sheet>
    </View>
  );
}

mount(App);
