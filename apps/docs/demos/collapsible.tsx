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
        gap: 12,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Collapsible</Text>
      <Collapsible open={open()} onOpenChange={({ open: v }) => open.set(v)}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingTop: 8 }}>
            Hidden until open.
          </Text>
        </CollapsibleContent>
      </Collapsible>
    </View>
  );
}

mount(App);
