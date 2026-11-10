import { colors } from "@shadcn-nsh/theme";
import { Text, View, mount } from "nsh";

import { TextView } from "@/packages/ui/text-view";

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Text</Text>
      <TextView
        markdown={"See the [guide](https://example.com).\n\n> [!NOTE]\n> Short note"}
        style={{ width: 320 }}
      />
    </View>
  );
}

mount(App);
