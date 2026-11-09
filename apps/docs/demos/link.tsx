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
        gap: 14,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Link</Text>
      <Link href="https://nsh.dev" onPress={() => {}}>
        Open nsh.dev
      </Link>
      <Link href="https://nsh.dev" current onPress={() => {}}>
        Current page
      </Link>
      <Link href="https://nsh.dev" onPress={() => {}}>
        <Text style={{ color: linkColor(), fontSize: 14, textDecorationLine: "underline" }}>
          Custom Text child
        </Text>
      </Link>
      <Link href="https://nsh.dev" disabled>
        Disabled
      </Link>
    </View>
  );
}

mount(App);
