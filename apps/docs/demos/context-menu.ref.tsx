// The reference of `context-menu.tsx`: the menu look on `nsh/base`'s ContextMenu.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { ContextMenu, MenuItem, MenuSeparator } from "nsh/base";

import { menuItemLabel, menuItemLook, menuPopup, menuSeparator } from "@/packages/ui/menu";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Item(props: {
  label: string | (() => string);
  onSelect?: () => void;
  keepOpen?: boolean;
  danger?: boolean;
}) {
  return (
    <MenuItem onSelect={props.onSelect} closeOnSelect={!props.keepOpen} {...menuItemLook()}>
      <Text style={menuItemLabel({ danger: props.danger })}>
        {typeof props.label === "function" ? props.label : props.label}
      </Text>
    </MenuItem>
  );
}

function App() {
  const open = signal(true);
  const last = signal("–");
  const pinned = signal(false);
  const popup = menuPopup();

  return (
    <DemoPage title="Context Menu" note={() => last()}>
      <DemoCard>
        <DemoSection title="Surface">
          <ContextMenu
            open={open()}
            margin={8}
            offset={4}
            popupStyle={popup.popupStyle}
            popupStartingStyle={popup.popupStartingStyle}
            backdropStyle={popup.backdropStyle}
            onOpenChange={({ open: next, reason }) => {
              open.set(next);
              last.set(`${next ? "opened" : "closed"} · ${reason}`);
            }}
            trigger={
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
            }
          >
            <Item label="Cut" onSelect={() => last.set("Cut")} />
            <Item label="Copy" onSelect={() => last.set("Copy")} />
            <Item label="Paste" onSelect={() => last.set("Paste")} />
            <MenuSeparator style={menuSeparator()} />
            <Item
              label={() => (pinned() ? "Unpin" : "Pin")}
              keepOpen
              onSelect={() => pinned.set(!pinned())}
            />
            <MenuSeparator style={menuSeparator()} />
            <Item label="Delete" danger onSelect={() => last.set("Delete")} />
          </ContextMenu>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
