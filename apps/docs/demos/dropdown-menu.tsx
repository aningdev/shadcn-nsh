import { colors } from "@shadcn-nsh/theme";
import { Button } from "../../../packages/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../../packages/ui/dropdown-menu";
import { mount, signal, Text, View } from "nsh";

function App() {
  const last = signal("—");

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        Dropdown Menu
      </Text>
      <DropdownMenu trigger={<Button onPress={() => {}}>Menu</Button>}>
        <DropdownMenuItem onSelect={() => last.set("Profile")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Profile</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => last.set("Settings")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Settings</Text>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => last.set("Log out")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Log out</Text>
        </DropdownMenuItem>
      </DropdownMenu>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Last: {() => last()}
      </Text>
    </View>
  );
}

mount(App);
