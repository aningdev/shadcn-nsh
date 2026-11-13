// The official menu scene (`references/nsh/website/demos/el-menu.tsx`) with this library's parts:
// a File menu with a submenu, a View menu with settings and a choice of one, a dashed area that
// opens the same rows as a context menu, and an inspector holding the last choice, the settings
// and the last eight open or close lines.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/packages/ui/context-menu";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@/packages/ui/menu";

import { DemoPage } from "./kit";
import { desktop, Panel, Split, wide } from "./stage";

const SORTS = ["Name", "Date modified", "Size"];

function App() {
  const last = signal("—");
  const reasons = signal<string[]>([]);
  const hidden = signal(false);
  const sidebar = signal(true);
  const minimap = signal(false);
  const sort = signal("Name");
  const pinned = signal(false);
  const changed = (name: string) => (event: { open: boolean; reason: string }) =>
    reasons.set(
      [`${name} ${event.open ? "opened" : "closed"} · ${event.reason}`, ...reasons()].slice(0, 8),
    );
  const choose = (what: string) => last.set(what);

  return (
    <DemoPage title="Menu">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click File; hover Share to open its submenu. View has settings and a choice of one. Right click the box below"
          : "Tap File: a sheet; Share shows its items in place. View has settings and a choice of one"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="onSelect · checked">
              <Text style={{ fontSize: 13, color: colors.text }}>{last()}</Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {`sidebar ${sidebar() ? "on" : "off"} · minimap ${minimap() ? "on" : "off"} · hidden files ${hidden() ? "shown" : "hidden"} · by ${sort()} · ${pinned() ? "pinned" : "not pinned"}`}
              </Text>
            </Panel>
            <Panel title="onOpenChange({ open, reason })" grow>
              <View style={{ gap: 2 }}>
                {reasons().map((line, i) => (
                  <Text style={{ fontSize: 12, color: i === 0 ? colors.text : colors.faint }}>
                    {line}
                  </Text>
                ))}
              </View>
            </Panel>
          </>
        }
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Menu onOpenChange={({ open, reason }) => changed("File")({ open, reason })}>
            <MenuTrigger>File ▾</MenuTrigger>
            <MenuContent margin={8}>
              <MenuItem onSelect={() => choose("New")}>New</MenuItem>
              <MenuItem onSelect={() => choose("Open…")}>Open…</MenuItem>
              <MenuItem disabled>Paste</MenuItem>
              <MenuSeparator />
              <MenuSub>
                <MenuSubTrigger>Share</MenuSubTrigger>
                <MenuSubContent offset={4}>
                  <MenuItem onSelect={() => choose("Share › Mail")}>Mail</MenuItem>
                  <MenuItem onSelect={() => choose("Share › Messages")}>Messages</MenuItem>
                  <MenuItem onSelect={() => choose("Share › Copy link")}>Copy link</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem danger onSelect={() => choose("Delete")}>
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>

          <Menu onOpenChange={({ open, reason }) => changed("View")({ open, reason })}>
            <MenuTrigger>View ▾</MenuTrigger>
            <MenuContent margin={8}>
              {/* Settings keep the menu open: each shows its new value at once. */}
              <MenuCheckboxItem
                checked={sidebar()}
                closeOnSelect={false}
                onSelect={() => sidebar.set(!sidebar())}
              >
                Show sidebar
              </MenuCheckboxItem>
              <MenuCheckboxItem
                checked={minimap()}
                closeOnSelect={false}
                onSelect={() => minimap.set(!minimap())}
              >
                Show minimap
              </MenuCheckboxItem>
              <MenuCheckboxItem
                checked={hidden()}
                closeOnSelect={false}
                onSelect={() => hidden.set(!hidden())}
              >
                Show hidden files
              </MenuCheckboxItem>
              <MenuSeparator />
              <MenuLabel text="Sort by" />
              {/* One choice of a group: choosing closes the menu. */}
              {SORTS.map((by) => (
                <MenuRadioItem checked={sort() === by} onSelect={() => sort.set(by)}>
                  {by}
                </MenuRadioItem>
              ))}
            </MenuContent>
          </Menu>
        </View>

        <ContextMenu onOpenChange={({ open, reason }) => changed("Context")({ open, reason })}>
          <ContextMenuTrigger>
            <View
              style={{
                height: wide() ? 220 : 150,
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
                {pinned() ? "ContextMenu · pinned" : "ContextMenu"}
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {desktop ? "Right click here" : "Hold a finger here"}
              </Text>
            </View>
          </ContextMenuTrigger>
          <ContextMenuContent margin={8}>
            <ContextMenuItem
              checked={pinned()}
              closeOnSelect={false}
              onSelect={() => pinned.set(!pinned())}
            >
              Pinned
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => choose("Copy")}>Copy</ContextMenuItem>
            <ContextMenuItem onSelect={() => choose("Rename")}>Rename</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem danger onSelect={() => choose("Delete")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Split>
    </DemoPage>
  );
}

mount(App);
