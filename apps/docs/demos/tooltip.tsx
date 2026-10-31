import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { Tooltip, TooltipContent, TooltipTrigger } from "../../../packages/ui/tooltip";

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
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Add item</TooltipContent>
      </Tooltip>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Host-prop bubble still works: tooltip={"{"}&lt;Tooltip&gt;Add item&lt;/Tooltip&gt;{"}"}
      </Text>
    </View>
  );
}

mount(App);
