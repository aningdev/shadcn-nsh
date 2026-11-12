import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/packages/ui/context-menu";
import { menuItemLabel } from "@/packages/ui/menu";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("–");
  const pinned = signal(false);

  return (
    <DemoPage title="Context Menu" note={() => last()}>
      <DemoCard>
        <DemoSection title="Surface">
          <ContextMenu
            defaultOpen
            onOpenChange={({ open, reason }) =>
              last.set(`${open ? "opened" : "closed"} · ${reason}`)
            }
          >
            <ContextMenuTrigger>
              <View
                style={{
                  height: 150,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: colors.faint,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                  {() => (pinned() ? "ContextMenu · pinned" : "ContextMenu")}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>Right click or hold</Text>
              </View>
            </ContextMenuTrigger>
            <ContextMenuContent margin={8}>
              <ContextMenuItem onSelect={() => last.set("Cut")}>Cut</ContextMenuItem>
              <ContextMenuItem onSelect={() => last.set("Copy")}>Copy</ContextMenuItem>
              <ContextMenuItem onSelect={() => last.set("Paste")}>Paste</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem closeOnSelect={false} onSelect={() => pinned.set(!pinned())}>
                <Text style={menuItemLabel()}>{() => (pinned() ? "Unpin" : "Pin")}</Text>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem danger onSelect={() => last.set("Delete")}>
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
