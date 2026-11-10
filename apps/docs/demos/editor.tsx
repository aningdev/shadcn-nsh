import { colors } from "@shadcn-nsh/theme";
import { Text, View, mount, signal } from "nsh";

import { Editor } from "@/packages/ui/editor";

function App() {
  const source = signal("const n = 1\n");
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Editor</Text>
      <Editor
        accessibilityLabel="Source"
        language="ts"
        value={source()}
        onChange={(event) => source.set(event.value)}
        style={{ width: 320, height: 120 }}
      />
    </View>
  );
}

mount(App);
