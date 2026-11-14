// The context menu's scene, written like the menu example's dashed area
// (`references/nsh/website/demos/el-menu.tsx`): a surface that opens the rows at the pointer (a
// right click, a long press), one setting that keeps it open, and an inspector holding the last
// choice, the setting and the last six open or close lines.
import { mount, signal, Text, View } from "nsh";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/packages/ui/context-menu";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui, wide } from "./stage";

function App() {
  const last = signal("–");
  const pinned = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));

  return (
    <DemoPage title="Context Menu">
      <Text style={{ color: ui().muted }}>
        {desktop ? "Right click the box below" : "Hold a finger on the box below"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="onSelect · checked">
              <Text style={{ fontSize: 13, color: ui().text }}>{last()}</Text>
              <Text style={{ fontSize: 13, color: ui().muted }}>
                {pinned() ? "pinned" : "not pinned"}
              </Text>
            </Panel>
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={92} />
          </>
        }
      >
        <ContextMenu
          onOpenChange={({ open, reason }) =>
            log(`Context ${open ? "opened" : "closed"} · ${reason}`)
          }
        >
          <ContextMenuTrigger>
            <View
              style={{
                height: wide() ? 220 : 150,
                borderRadius: 14,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: ui().faint,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: ui().text }}>
                {pinned() ? "ContextMenu · pinned" : "ContextMenu"}
              </Text>
              <Text style={{ fontSize: 13, color: ui().muted }}>
                {desktop ? "Right click here" : "Hold a finger here"}
              </Text>
            </View>
          </ContextMenuTrigger>
          <ContextMenuContent margin={8}>
            <ContextMenuItem
              checked={pinned()}
              closeOnSelect={false}
              onSelect={() => {
                pinned.set(!pinned());
                last.set(pinned() ? "Pinned" : "Unpinned");
              }}
            >
              {pinned() ? "Pinned" : "Pin"}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => last.set("Cut")}>Cut</ContextMenuItem>
            <ContextMenuItem onSelect={() => last.set("Copy")}>Copy</ContextMenuItem>
            <ContextMenuItem disabled>Paste</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={() => last.set("Delete")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Split>
    </DemoPage>
  );
}

mount(App);
