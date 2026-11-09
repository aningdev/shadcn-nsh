import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../packages/ui/collapsible";

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Collapsible</Text>
      <Collapsible open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Controlled panel — Hidden until open.
          </Text>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Style merge</CollapsibleTrigger>
        <CollapsibleContent style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Consumer style wins per key over region chrome.
          </Text>
        </CollapsibleContent>
      </Collapsible>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")}
      </Text>
    </View>
  );
}

mount(App);
