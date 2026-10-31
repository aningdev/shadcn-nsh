import { colors } from "@shadcn-nsh/theme";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../../../packages/ui/context-menu";
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
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Context Menu</Text>
      <ContextMenu
        trigger={
          <View
            style={{
              padding: 20,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.muted,
              minHeight: 96,
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>
              Right-click (or long-press) this area
            </Text>
          </View>
        }
      >
        <ContextMenuItem onSelect={() => last.set("Copy")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Copy</Text>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => last.set("Paste")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Paste</Text>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => last.set("Delete")}>
          <Text style={{ fontSize: 14, color: colors.foreground }}>Delete</Text>
        </ContextMenuItem>
      </ContextMenu>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Last: {() => last()}
      </Text>
    </View>
  );
}

mount(App);
