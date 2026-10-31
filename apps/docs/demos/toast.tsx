import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { Button } from "../../../packages/ui/button";
import { toast, Toaster } from "../../../packages/ui/toast";

function App() {
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Toast</Text>
      <Button onPress={() => toast("Copied", { description: "Link on clipboard" })}>
        Show toast
      </Button>
      <Toaster placement="topRight" />
    </View>
  );
}

mount(App);
