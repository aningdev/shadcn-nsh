import { colors } from "@shadcn-nsh/theme";
import { Button } from "../../../packages/ui/button";
import { Dialog } from "../../../packages/ui/dialog";
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Dialog</Text>
      <Button onPress={() => open.set(true)}>Open dialog</Button>
      <Dialog open={open()} onOpenChange={({ open: v }) => open.set(v)}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
          Confirm action
        </Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          Styled modal with fixed fade animation and card chrome.
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          <Button variant="outline" onPress={() => open.set(false)}>
            Cancel
          </Button>
          <Button onPress={() => open.set(false)}>Confirm</Button>
        </View>
      </Dialog>
    </View>
  );
}

mount(App);
