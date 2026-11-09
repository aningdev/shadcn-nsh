import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../../packages/ui/context-menu";

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
        Context Menu
      </Text>
      <ContextMenu open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <ContextMenuTrigger>
          <View
            style={{
              width: 200,
              height: 96,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: "dashed",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.muted,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Right-click / long-press
            </Text>
          </View>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuItem onSelect={() => last.set("Copy")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Copy</Text>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => last.set("Paste")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Paste</Text>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={sidebar()}
            closeOnSelect={false}
            onSelect={() => sidebar.set(!sidebar())}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>Show sidebar</Text>
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => last.set("Delete")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Delete</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ContextMenu>
        <ContextMenuTrigger>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.foreground }}>Style merge target</Text>
          </View>
        </ContextMenuTrigger>
        <ContextMenuContent popupStyle={{ minWidth: 220, padding: 8 }} offset={8}>
          <ContextMenuItem style={{ height: 36 }} onSelect={() => last.set("Merged")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Merged chrome</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")} · Last: {() => last()} · Sidebar:{" "}
        {() => (sidebar() ? "on" : "off")}
      </Text>
    </View>
  );
}

mount(App);
