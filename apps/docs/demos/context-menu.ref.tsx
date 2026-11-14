// The reference of `context-menu.tsx`: the same scene with the rows' and the popup's look
// (`menuItemLook`, `menuItemLabel`, `MenuMark`, `menuPopup`, `menuSeparator`) spread on
// `nsh/base`'s ContextMenu, the way the official menu example
// (`references/nsh/website/demos/el-menu.tsx`) writes its own. It differs from the component page
// only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { ContextMenu, MenuItem, MenuSeparator } from "nsh/base";

import { MenuMark, menuIndicator } from "@/packages/ui/lib/popup";
import {
  menuItemLabel,
  menuItemLook,
  menuItemSize,
  menuPopup,
  menuSeparator,
} from "@/packages/ui/menu";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

/** One row: the look's row, its mark when it can be checked, its label (the danger tone for a destructive one). */
function Item(props: {
  label: string;
  onSelect?: () => void;
  checked?: boolean;
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
      closeOnSelect={props.closeOnSelect}
      indicatorClass={checkable ? menuIndicator : undefined}
      indicator={
        checkable ? (
          <MenuMark kind="check" size={menuItemSize.icon} tint={colors.accent} />
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

function App() {
  const last = signal("–");
  const pinned = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));

  return (
    <DemoPage title="Context Menu">
      <Text style={{ color: colors.muted }}>
        {desktop ? "Right click the box below" : "Hold a finger on the box below"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="onSelect · checked">
              <Text style={{ fontSize: 13, color: colors.text }}>{last()}</Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {pinned() ? "pinned" : "not pinned"}
              </Text>
            </Panel>
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={92} />
          </>
        }
      >
        <ContextMenu
          {...menuPopup()}
          // The shell's default gap from the pointer (base's own is 0).
          offset={4}
          margin={8}
          onOpenChange={({ open, reason }) =>
            log(`Context ${open ? "opened" : "closed"} · ${reason}`)
          }
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
        >
          <Item
            label={pinned() ? "Pinned" : "Pin"}
            checked={pinned()}
            closeOnSelect={false}
            onSelect={() => {
              pinned.set(!pinned());
              last.set(pinned() ? "Pinned" : "Unpinned");
            }}
          />
          <Item label="Cut" onSelect={() => last.set("Cut")} />
          <Item label="Copy" onSelect={() => last.set("Copy")} />
          <Item label="Paste" disabled />
          <MenuSeparator style={menuSeparator()} />
          <Item label="Delete" variant="destructive" onSelect={() => last.set("Delete")} />
        </ContextMenu>
      </Split>
    </DemoPage>
  );
}

mount(App);
