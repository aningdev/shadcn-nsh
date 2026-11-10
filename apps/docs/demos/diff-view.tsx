import { colors } from "@shadcn-nsh/theme";
import { Text, View, mount } from "nsh";

import { DiffView } from "@/packages/ui/diff-view";

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Diff</Text>
      <DiffView
        layout="unified"
        oldValue={"alpha\nbeta"}
        newValue={"alpha\ngamma"}
        style={{ width: 320, height: 140 }}
      />
    </View>
  );
}

mount(App);
