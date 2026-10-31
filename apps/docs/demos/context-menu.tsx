import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../packages/ui/context-menu";

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
        Context Menu
      </Text>
      <ContextMenu>
        <ContextMenuTrigger>
          <View
            style={{
              width: 180,
              height: 80,
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
          <ContextMenuItem onSelect={() => last.set("Copy")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Copy</Text>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => last.set("Paste")}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Paste</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Last: {() => last()}</Text>
    </View>
  );
}

mount(App);
