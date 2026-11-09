import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { toast, Toaster } from "@/packages/ui/toast";

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
      <Button
        variant="secondary"
        onPress={() =>
          toast("Style merge", {
            description: "Consumer stackStyle / toast chrome still apply.",
          })
        }
      >
        Another toast
      </Button>
      <Button variant="outline" onPress={() => toast.dismiss()}>
        Dismiss all
      </Button>
      <Toaster placement="topRight" stackStyle={{ maxWidth: 360 }} />
    </View>
  );
}

mount(App);
