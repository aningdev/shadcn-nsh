import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { Link, linkColor } from "../../../packages/ui/link";

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Link</Text>
      <Link href="https://nsh.dev" onPress={() => {}}>
        <Text style={{ color: linkColor(), fontSize: 14 }}>Open nsh.dev</Text>
      </Link>
      <Link href="https://nsh.dev" current onPress={() => {}}>
        <Text style={{ color: linkColor(), fontSize: 14, fontWeight: "600" }}>Current page</Text>
      </Link>
      <Link href="https://nsh.dev" disabled>
        <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Disabled</Text>
      </Link>
    </View>
  );
}

mount(App);
