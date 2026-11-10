import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Link } from "@/packages/ui/link";
import { Toggle } from "@/packages/ui/toggle";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/packages/ui/toolbar";

function App() {
  const italic = signal(true);
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Toolbar</Text>
      <Toolbar accessibilityLabel="Formatting">
        <ToolbarGroup accessibilityLabel="Marks">
          <Button variant="ghost" size="sm" accessibilityLabel="Bold">
            Bold
          </Button>
          <Toggle
            accessibilityLabel="Italic"
            pressed={italic()}
            onChange={({ pressed }) => italic.set(pressed)}
          >
            Italic
          </Toggle>
        </ToolbarGroup>
        <ToolbarSeparator />
        <Link href="https://nsh.dev" openWith="app">
          Site
        </Link>
        <Button variant="ghost" size="sm" disabled>
          Off
        </Button>
      </Toolbar>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {() => `Italic: ${italic() ? "on" : "off"}`}
      </Text>
    </View>
  );
}

mount(App);
