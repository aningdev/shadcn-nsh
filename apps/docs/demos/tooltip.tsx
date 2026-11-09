import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/packages/ui/tooltip";

function App() {
  const open = signal(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Tooltip</Text>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Add item</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>Bottom placement</TooltipTrigger>
        <TooltipContent placement="bottom" align="start">
          Below the trigger
        </TooltipContent>
      </Tooltip>
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger>Instant</TooltipTrigger>
          <TooltipContent>Shows at once</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Tooltip open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <TooltipTrigger>Pinned</TooltipTrigger>
        <TooltipContent style={{ paddingHorizontal: 14 }}>
          Controlled open — useful on touch
        </TooltipContent>
      </Tooltip>
      <View tooltip={<TooltipContent>Host bubble</TooltipContent>}>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Rest here (host tooltip=)</Text>
      </View>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")}
      </Text>
    </View>
  );
}

mount(App);
