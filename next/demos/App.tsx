// The demos app's entry, which `nsh check` and `nsh test` need. Each demo is an entry of its
// own (`nsh run next/demos/button.tsx`); this page only names them.
import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

const demos = ["button", "switch", "dialog"];

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Demos</Text>
      {demos.map((name) => (
        <Text style={{ fontSize: 15, color: colors.muted }}>{name}.tsx</Text>
      ))}
    </View>
  );
}

mount(App);
