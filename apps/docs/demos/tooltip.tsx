import { colors } from "@shadcn-nsh/theme";
import { Tooltip } from "../../../packages/ui/tooltip";
import { mount, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Tooltip</Text>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Hover or focus the control (styled Button does not forward tooltip — host is nsh/base).
      </Text>
      <BaseButton
        tooltip={
          <Tooltip>
            <Text style={{ fontSize: 12, color: colors.background }}>Add item</Text>
          </Tooltip>
        }
        onPress={() => {}}
        style={{
          height: 36,
          paddingHorizontal: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: colors.primaryForeground }}>Add</Text>
      </BaseButton>
    </View>
  );
}

mount(App);
