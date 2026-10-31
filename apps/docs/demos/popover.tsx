import { colors } from "@shadcn-nsh/theme";
import { Button } from "../../../packages/ui/button";
import { Popover } from "../../../packages/ui/popover";
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Popover</Text>
      <Popover
        open={open()}
        onOpenChange={({ open: v }) => open.set(v)}
        trigger={<Button onPress={() => open.set(true)}>Open popover</Button>}
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            Quick tip
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Popover content with fixed offset and surface chrome.
          </Text>
          <Button variant="outline" onPress={() => open.set(false)}>
            Close
          </Button>
        </View>
      </Popover>
    </View>
  );
}

mount(App);
