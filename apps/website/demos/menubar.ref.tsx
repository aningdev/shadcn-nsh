// The reference of `menubar.tsx`: the same scene with the bar's and the triggers' look
// (`menubarLook`, `menubarTriggerLook`) spread on views of `nsh/base`, and the popup, the rows and
// the submenus wearing `menu.tsx`'s looks (`menuPopup`, `menuItemLook`, `MenuMark`, `SubmenuRow`) —
// the same rows a menu gets. It differs from the component page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Menu, MenuItem, MenuSeparator, Submenu } from "nsh/base";

import { MenuMark, menuIndicator } from "@/packages/ui/lib/popup";
import {
  MenuLabel,
  menuItemLabel,
  menuItemLook,
  menuItemNote,
  menuItemSize,
  menuPopup,
  menuSeparator,
  SubmenuBack,
  SubmenuRow,
} from "@/packages/ui/menu";
import { menubarLook, menubarTriggerLook } from "@/packages/ui/menubar";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

const ZOOMS = ["100%", "125%", "150%"];
const RECENT = ["Harbour at dusk", "Rough ideas", "Trip to the lakes"];

/** One row: the look's row, its mark when it can be checked, its label and its shortcut. */
function Item(props: {
  label: string;
  keys?: string;
  onSelect?: () => void;
  checked?: boolean;
  radio?: boolean;
  closeOnSelect?: boolean;
  variant?: "default" | "destructive";
}) {
  const look = menuItemLook();
  const checkable = props.checked !== undefined;
  return (
    <MenuItem
      onSelect={props.onSelect}
      checked={props.checked}
      role={props.radio ? "menuitemradio" : undefined}
      closeOnSelect={props.closeOnSelect}
      indicatorClass={checkable ? menuIndicator : undefined}
      indicator={
        checkable ? (
          <MenuMark
            kind={props.radio ? "dot" : "check"}
            size={menuItemSize.icon}
            tint={colors.brand}
          />
        ) : undefined
      }
      style={look.style}
      hoverStyle={look.hoverStyle}
      focusStyle={look.focusStyle}
      activeStyle={look.activeStyle}
      disabledStyle={look.disabledStyle}
    >
      <Text style={menuItemLabel({ variant: props.variant })}>{props.label}</Text>
      {props.keys ? (
        <Text style={[menuItemNote(), { marginLeft: "auto" }]}>{props.keys}</Text>
      ) : null}
    </MenuItem>
  );
}

/** A bar's trigger: the look's box, its name in the bar's type. */
function Trigger(props: { name: string; open: () => boolean; disabled?: boolean }) {
  const look = menubarTriggerLook();
  return (
    <View
      accessible
      role="menuitem"
      disabled={props.disabled}
      accessibilityState={{ disabled: props.disabled, expanded: props.open() }}
      style={look.style}
      hoverStyle={look.hoverStyle}
      activeStyle={look.activeStyle}
      expandedStyle={look.expandedStyle}
      focusVisibleStyle={look.focusVisibleStyle}
      disabledStyle={look.disabledStyle}
    >
      <Text style={menubarLook().triggerText}>{props.name}</Text>
    </View>
  );
}

function App() {
  const last = signal("—");
  const which = signal("closed");
  const events = signal<string[]>([]);
  const sidebar = signal(true);
  const ruler = signal(false);
  const zoom = signal("100%");
  const choose = (what: string) => last.set(what);
  const changed = (name: string) => (event: { open: boolean; reason: string }) => {
    which.set(event.open ? name : "closed");
    events.set(
      [`${name} · ${event.open ? "opened" : "closed"} · ${event.reason}`, ...events()].slice(0, 6),
    );
  };

  return (
    <DemoPage title="Menubar">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Open File; the bar's triggers stay, the menu under the one that is open"
          : "Open File; hold a trigger, or tap it and then the row"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open">
              <Text style={{ fontSize: 13, color: ui().text }}>{which()}</Text>
            </Panel>
            <Panel title="chosen">
              <Text style={{ fontSize: 13, color: ui().text }}>{last()}</Text>
            </Panel>
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={120} />
          </>
        }
      >
        <View role="menubar" style={menubarLook().bar}>
          <Menu
            {...menuPopup()}
            placement="bottom"
            align="start"
            offset={8}
            trigger={<Trigger name="File" open={() => which() === "File"} />}
            onOpenChange={({ open, reason }) => changed("File")({ open, reason })}
          >
            <MenuLabel>Document</MenuLabel>
            <Item label="New document" keys="⌘N" onSelect={() => choose("New document")} />
            <Item label="Open…" keys="⌘O" onSelect={() => choose("Open…")} />
            <Submenu
              trigger={<SubmenuRow>Open recent</SubmenuRow>}
              back={desktop ? undefined : <SubmenuBack label="Open recent" />}
            >
              {RECENT.map((name) => (
                <Item label={name} onSelect={() => choose(name)} />
              ))}
              <MenuSeparator style={menuSeparator()} />
              <Item label="Clear menu" onSelect={() => choose("Clear menu")} />
            </Submenu>
            <MenuSeparator style={menuSeparator()} />
            <Item
              label="Move to Trash"
              keys="⌘⌫"
              variant="destructive"
              onSelect={() => choose("Move to Trash")}
            />
          </Menu>

          <Menu
            {...menuPopup()}
            placement="bottom"
            align="start"
            offset={8}
            trigger={<Trigger name="View" open={() => which() === "View"} />}
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
              label="Show ruler"
              checked={ruler()}
              closeOnSelect={false}
              onSelect={() => ruler.set(!ruler())}
            />
            <MenuSeparator style={menuSeparator()} />
            <MenuLabel>Zoom</MenuLabel>
            {ZOOMS.map((step) => (
              <Item label={step} radio checked={zoom() === step} onSelect={() => zoom.set(step)} />
            ))}
            <MenuSeparator style={menuSeparator()} />
            <Item
              label="Enter full screen"
              keys="⌃⌘F"
              onSelect={() => choose("Enter full screen")}
            />
          </Menu>

          <Menu
            {...menuPopup()}
            placement="bottom"
            align="start"
            offset={8}
            trigger={<Trigger name="Help" open={() => which() === "Help"} disabled />}
            onOpenChange={({ open, reason }) => changed("Help")({ open, reason })}
          >
            <Item label="Notes help" onSelect={() => choose("Notes help")} />
          </Menu>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
