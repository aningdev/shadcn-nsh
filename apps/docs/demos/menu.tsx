import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from "@/packages/ui/menu";

function App() {
  const open = signal(false);
  const last = signal("—");
  const sidebar = signal(true);

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Menu</Text>
      <Menu open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <MenuTrigger>Open menu</MenuTrigger>
        <MenuContent>
          <MenuLabel>Account</MenuLabel>
          <MenuItem onSelect={() => last.set("Profile")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Profile</Text>
          </MenuItem>
          <MenuItem onSelect={() => last.set("Settings")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Settings</Text>
          </MenuItem>
          <MenuSeparator />
          <MenuCheckboxItem
            checked={sidebar()}
            closeOnSelect={false}
            onSelect={() => sidebar.set(!sidebar())}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>Show sidebar</Text>
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuItem onSelect={() => last.set("Log out")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Log out</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Top placement</MenuTrigger>
        <MenuContent placement="top" align="end">
          <MenuItem onSelect={() => last.set("Top")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Above, end-aligned</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Style merge</MenuTrigger>
        <MenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
          <MenuItem style={{ height: 36 }} onSelect={() => last.set("Merged")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Merged chrome</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")} · Last: {() => last()} · Sidebar:{" "}
        {() => (sidebar() ? "on" : "off")}
      </Text>
    </View>
  );
}

mount(App);
