// The official menu scene (`references/nsh/website/demos/el-menu.tsx`) with this library's parts:
// a File menu with a submenu, a View menu with settings and a choice of one, the platform's own
// menu (`MenuButton`) beside them, a dashed area that opens the same rows as a context menu, and an
// inspector holding the last choice, the settings and the last eight open or close lines.
import { Share2 } from "lucide";
import { mount, platform, signal, Text, View } from "nsh";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/packages/ui/context-menu";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Menu,
  MenuButton,
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
  menuItemGlyph,
  menuItemLabel,
  menuItemNote,
} from "@/packages/ui/menu";

import { DemoPage } from "./kit";
import { desktop, Panel, Split, ui, wide } from "./stage";

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
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click File; hover Share to open its submenu. View has settings and a choice of one. Right click the box below"
          : "Tap File: a sheet; Share shows its items in place. View has settings and a choice of one"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="onSelect · checked">
              <Text style={{ fontSize: 13, color: ui().text }}>{last()}</Text>
              <Text style={{ fontSize: 13, color: ui().muted }}>
                {`sidebar ${sidebar() ? "on" : "off"} · minimap ${minimap() ? "on" : "off"} · hidden files ${hidden() ? "shown" : "hidden"} · by ${sort()} · ${pinned() ? "pinned" : "not pinned"}`}
              </Text>
            </Panel>
            <Panel title="onOpenChange({ open, reason })" grow>
              <View style={{ gap: 2 }}>
                <Each of={reasons()} key="index">
                  {(line, i) => (
                    <Text style={{ fontSize: 12, color: i() === 0 ? ui().text : ui().faint }}>
                      {line()}
                    </Text>
                  )}
                </Each>
              </View>
            </Panel>
          </>
        }
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Menu onOpenChange={({ open, reason }) => changed("File")({ open, reason })}>
            <MenuTrigger>File ▾</MenuTrigger>
            <MenuContent margin={8}>
              <MenuItem variant="default" onSelect={() => choose("New")}>
                New
              </MenuItem>
              {/* A row with a line under its label: it grows past a one-line row. */}
              <MenuItem onSelect={() => choose("Open…")}>
                <View style={{ flexGrow: 1, flexShrink: 1, gap: 2 }}>
                  <Text style={menuItemLabel()}>Open…</Text>
                  <Text style={menuItemNote()}>A file, a folder or a link</Text>
                </View>
              </MenuItem>
              <MenuItem disabled>Paste</MenuItem>
              <MenuSeparator />
              <MenuSub>
                <MenuSubTrigger lead={<Icon icon={Share2} {...menuItemGlyph()} />}>
                  Share
                </MenuSubTrigger>
                <MenuSubContent offset={4}>
                  <MenuItem onSelect={() => choose("Share › Mail")}>Mail</MenuItem>
                  <MenuItem onSelect={() => choose("Share › Messages")}>Messages</MenuItem>
                  <MenuItem onSelect={() => choose("Share › Copy link")}>Copy link</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem variant="destructive" onSelect={() => choose("Delete")}>
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
              <MenuLabel>Sort by</MenuLabel>
              {/* One choice of a group: choosing closes the menu. */}
              {SORTS.map((by) => (
                <MenuRadioItem checked={sort() === by} onSelect={() => sort.set(by)}>
                  {by}
                </MenuRadioItem>
              ))}
            </MenuContent>
          </Menu>

          {/* The platform's own menu: UIContextMenu on iOS, the context menu a pointer opens. */}
          <MenuButton
            title="Sort by"
            accessibilityLabel="Sort by"
            // A phone without the platform's menu (Android) has none: there the app draws `Menu`.
            disabled={platform.os === "android"}
            items={SORTS.map((by) => ({ id: by, label: by, checked: sort() === by }))}
            onSelect={({ id }) => choose(`system menu › ${id}`)}
          >
            Sort by ▾
          </MenuButton>
        </View>

        <ContextMenu onOpenChange={({ open, reason }) => changed("Context")({ open, reason })}>
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
              onSelect={() => pinned.set(!pinned())}
            >
              Pinned
            </ContextMenuItem>
            <ContextMenuItem inset onSelect={() => choose("Copy")}>
              Copy
            </ContextMenuItem>
            <ContextMenuItem inset onSelect={() => choose("Rename")}>
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem inset variant="destructive" onSelect={() => choose("Delete")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Split>
    </DemoPage>
  );
}

mount(App);
