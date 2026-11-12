// The reference of `menu.tsx`: the looks spread on `nsh/base`'s Menu, as upstream's menu demo does.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text } from "nsh";
import { Button, Menu, MenuItem, MenuSeparator, Submenu } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
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

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Item(props: {
  label: string;
  onSelect?: () => void;
  checked?: boolean;
  radio?: boolean;
  disabled?: boolean;
  keepOpen?: boolean;
  danger?: boolean;
}) {
  return (
    <MenuItem
      onSelect={props.onSelect}
      disabled={props.disabled}
      checked={props.checked}
      role={props.radio ? "menuitemradio" : undefined}
      indicatorClass={menuIndicator}
      indicator={
        props.checked === undefined ? undefined : (
          <MenuMark
            kind={props.radio ? "dot" : "check"}
            size={menuItemSize.icon}
            tint={colors.accent}
          />
        )
      }
      closeOnSelect={!props.keepOpen}
      {...menuItemLook()}
    >
      <Text style={menuItemLabel({ danger: props.danger })}>{props.label}</Text>
    </MenuItem>
  );
}

function App() {
  const last = signal("–");
  const sidebar = signal(true);
  const sort = signal("Name");
  const popup = menuPopup();

  return (
    <DemoPage title="Menu" note={() => last()}>
      <DemoCard>
        <DemoSection title="File">
          <Menu
            defaultOpen
            offset={4}
            margin={8}
            popupStyle={popup.popupStyle}
            popupStartingStyle={popup.popupStartingStyle}
            backdropStyle={popup.backdropStyle}
            onOpenChange={({ open, reason }) =>
              last.set(`${open ? "opened" : "closed"} · ${reason}`)
            }
            trigger={
              <Button {...buttonLook("secondary")}>
                <Text style={buttonLabel("secondary")}>File ▾</Text>
              </Button>
            }
          >
            <Item label="New" onSelect={() => last.set("New")} />
            <Item label="Open…" onSelect={() => last.set("Open…")} />
            <Item label="Paste" disabled />
            <MenuSeparator style={menuSeparator()} />
            <Submenu
              offset={4}
              trigger={<SubmenuRow label="Share" />}
              back={<SubmenuBack label="Share" />}
            >
              <Item label="Mail" onSelect={() => last.set("Share › Mail")} />
              <Item label="Messages" onSelect={() => last.set("Share › Messages")} />
            </Submenu>
            <MenuSeparator style={menuSeparator()} />
            <Item label="Delete" danger onSelect={() => last.set("Delete")} />
          </Menu>
        </DemoSection>
        <DemoSection title="View">
          <Menu
            offset={4}
            margin={8}
            popupStyle={popup.popupStyle}
            popupStartingStyle={popup.popupStartingStyle}
            backdropStyle={popup.backdropStyle}
            trigger={
              <Button {...buttonLook("secondary")}>
                <Text style={buttonLabel("secondary")}>View ▾</Text>
              </Button>
            }
          >
            <Item
              label="Show sidebar"
              checked={sidebar()}
              keepOpen
              onSelect={() => sidebar.set(!sidebar())}
            />
            <MenuSeparator style={menuSeparator()} />
            <MenuLabel text="Sort by" />
            <Item
              label="Name"
              radio
              checked={sort() === "Name"}
              onSelect={() => sort.set("Name")}
            />
            <Item
              label="Date"
              radio
              checked={sort() === "Date"}
              onSelect={() => sort.set("Date")}
            />
          </Menu>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {() => `sidebar ${sidebar() ? "on" : "off"} · sort ${sort()}`}
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
