// The reference of `menu.tsx`: the same scene with the rows' and the popup's look
// (`menuItemLook`, `menuItemLabel`, `menuIndicator`, `MenuMark`, `menuPopup`, `menuSeparator`,
// `SubmenuRow`, `SubmenuBack`) spread on `nsh/base`'s Menu and ContextMenu, the way the official
// example (`references/nsh/website/demos/el-menu.tsx`) writes it. It differs from the component
// page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { ContextMenu, Menu, MenuItem, MenuSeparator, Submenu } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { MenuMark, menuIndicator } from "@/packages/ui/lib/popup";
import {
  MenuLabel,
  menuItemLabel,
  menuItemLook,
  menuItemSize,
  menuPopup,
  menuSeparator,
  SubmenuBack,
  SubmenuRow,
} from "@/packages/ui/menu";

import { DemoPage } from "./kit";
import { desktop, Panel, Split, wide } from "./stage";

const SORTS = ["Name", "Date modified", "Size"];

/** One row: the look's row, its mark when it can be checked, its label (the danger tone for a destructive one). */
function Item(props: {
  label: string;
  onSelect?: () => void;
  checked?: boolean;
  radio?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  variant?: "default" | "destructive";
}) {
  const look = menuItemLook();
  const checkable = props.checked !== undefined;
  return (
    <MenuItem
      onSelect={props.onSelect}
      disabled={props.disabled}
      checked={props.checked}
      role={props.radio ? "menuitemradio" : undefined}
      closeOnSelect={props.closeOnSelect}
      indicatorClass={checkable ? menuIndicator : undefined}
      indicator={
        checkable ? (
          <MenuMark
            kind={props.radio ? "dot" : "check"}
            size={menuItemSize.icon}
            tint={colors.accent}
          />
        ) : undefined
      }
      style={look.style}
      hoverStyle={props.disabled ? undefined : look.hoverStyle}
      focusStyle={look.focusStyle}
      activeStyle={props.disabled ? undefined : look.activeStyle}
      disabledStyle={look.disabledStyle}
    >
      <Text style={menuItemLabel({ variant: props.variant })}>{props.label}</Text>
    </MenuItem>
  );
}

/** The rows behind "Share": a submenu, opened by its row. */
function Share(props: { onSelect: (what: string) => void }) {
  return (
    <Submenu offset={4} trigger={<SubmenuRow label="Share" />} back={<SubmenuBack label="Share" />}>
      <Item label="Mail" onSelect={() => props.onSelect("Mail")} />
      <Item label="Messages" onSelect={() => props.onSelect("Messages")} />
      <Item label="Copy link" onSelect={() => props.onSelect("Copy link")} />
    </Submenu>
  );
}

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
          <Menu
            {...menuPopup()}
            offset={4}
            margin={8}
            trigger={<Button variant="secondary">File ▾</Button>}
            onOpenChange={({ open, reason }) => changed("File")({ open, reason })}
          >
            <Item label="New" onSelect={() => choose("New")} />
            <Item label="Open…" onSelect={() => choose("Open…")} />
            <Item label="Paste" disabled />
            <MenuSeparator style={menuSeparator()} />
            <Share onSelect={(what) => choose(`Share › ${what}`)} />
            <MenuSeparator style={menuSeparator()} />
            <Item label="Delete" variant="destructive" onSelect={() => choose("Delete")} />
          </Menu>

          <Menu
            {...menuPopup()}
            offset={4}
            margin={8}
            trigger={<Button variant="secondary">View ▾</Button>}
            onOpenChange={({ open, reason }) => changed("View")({ open, reason })}
          >
            {/* Settings keep the menu open: each shows its new value at once. */}
            <Item
              label="Show sidebar"
              checked={sidebar()}
              closeOnSelect={false}
              onSelect={() => sidebar.set(!sidebar())}
            />
            <Item
              label="Show minimap"
              checked={minimap()}
              closeOnSelect={false}
              onSelect={() => minimap.set(!minimap())}
            />
            <Item
              label="Show hidden files"
              checked={hidden()}
              closeOnSelect={false}
              onSelect={() => hidden.set(!hidden())}
            />
            <MenuSeparator style={menuSeparator()} />
            <MenuLabel text="Sort by" />
            {/* One choice of a group: choosing closes the menu. */}
            {SORTS.map((by) => (
              <Item label={by} radio checked={sort() === by} onSelect={() => sort.set(by)} />
            ))}
          </Menu>
        </View>

        <ContextMenu
          {...menuPopup()}
          margin={8}
          trigger={
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
          }
          onOpenChange={({ open, reason }) => changed("Context")({ open, reason })}
        >
          <Item
            label="Pinned"
            checked={pinned()}
            closeOnSelect={false}
            onSelect={() => pinned.set(!pinned())}
          />
          <Item label="Copy" onSelect={() => choose("Copy")} />
          <Item label="Rename" onSelect={() => choose("Rename")} />
          <MenuSeparator style={menuSeparator()} />
          <Item label="Delete" variant="destructive" onSelect={() => choose("Delete")} />
        </ContextMenu>
      </Split>
    </DemoPage>
  );
}

mount(App);
