import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../packages/ui/dropdown-menu";

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        Dropdown Menu
      </Text>
      <DropdownMenu open={open()} onOpenChange={(next) => open.set(next)}>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => last.set("Profile")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Profile</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => last.set("Settings")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Settings</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sidebar()}
            closeOnSelect={false}
            onSelect={() => sidebar.set(!sidebar())}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>Show sidebar</Text>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => last.set("Log out")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Log out</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>Top placement</DropdownMenuTrigger>
        <DropdownMenuContent placement="top" align="end">
          <DropdownMenuItem onSelect={() => last.set("Top")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Above, end-aligned</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>Style merge</DropdownMenuTrigger>
        <DropdownMenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
          <DropdownMenuItem style={{ height: 36 }} onSelect={() => last.set("Merged")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Merged chrome</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")} · Last: {() => last()} · Sidebar:{" "}
        {() => (sidebar() ? "on" : "off")}
      </Text>
    </View>
  );
}

mount(App);
