import { colors } from "@shadcn-nsh/theme";
import { Toast, ToastStack } from "../../../packages/ui/toast";
import { mount, Text, View } from "nsh";

function App() {
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Toast</Text>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        ToastStack hosts one or more Toast children (placement topRight).
      </Text>
      <ToastStack placement="topRight">
        <Toast title="Saved" description="Your changes were saved." />
        <Toast title="Heads up" description="A second toast in the stack." />
      </ToastStack>
    </View>
  );
}

mount(App);
