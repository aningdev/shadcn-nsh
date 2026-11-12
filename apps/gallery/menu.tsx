import { Text, View, mount } from "nsh";

// Family 5: menu and context menu. The menu popup is an overlay, so its panel reserves
// the height of the open rows. A context menu anchors to the pointer; with no click yet
// that point is (0, 0), so this demo leaves it closed on its own trigger.
import { alpha, colors } from "../../packages/theme";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../../packages/ui";
import { Page, Panel } from "./demo-kit";

/** Wider than the label, so the popup does not shrink-wrap and the shortcut stays on one line. */
const popup = { minWidth: 260 };

mount(() => (
  <Page>
    <Panel title="Menu">
      {/* Trigger, the 4-point offset, and the open rows. The popup does not take flow space. */}
      <View style={{ width: 280, minHeight: 400 }}>
        <Menu defaultOpen>
          <MenuTrigger>File</MenuTrigger>
          <MenuContent popupStyle={popup}>
            <MenuLabel text="File" />
            <MenuItem>
              New window
              <MenuShortcut>⌘N</MenuShortcut>
            </MenuItem>
            <MenuItem style={{ backgroundColor: colors.accent }}>
              <Text>Highlighted</Text>
            </MenuItem>
            <MenuItem style={{ backgroundColor: alpha(colors.text, 0.1) }}>
              <Text>Pressed</Text>
            </MenuItem>
            <MenuItem disabled>
              <Text>Paste</Text>
            </MenuItem>
            <MenuSeparator />
            <MenuCheckboxItem checked>
              <Text>Show sidebar</Text>
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={false}>
              <Text>Show minimap</Text>
            </MenuCheckboxItem>
            <MenuLabel text="Sort by" />
            <MenuRadioItem checked>
              <Text>Name</Text>
            </MenuRadioItem>
            <MenuRadioItem checked={false}>
              <Text>Date modified</Text>
            </MenuRadioItem>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger disabled>Share</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>
                  <Text>Mail</Text>
                </MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </View>
    </Panel>
    <Panel title="Context menu">
      <ContextMenu>
        <ContextMenuTrigger>
          <View
            style={{
              width: 260,
              height: 64,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.text, numberOfLines: 1 }}>
              Right-click or hold
            </Text>
          </View>
        </ContextMenuTrigger>
        <ContextMenuContent popupStyle={popup}>
          <ContextMenuLabel text="Edit" />
          <ContextMenuItem>
            <Text>Copy</Text>
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            <Text>Paste</Text>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>
            <Text>Pinned</Text>
          </ContextMenuCheckboxItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>
                <Text>Mail</Text>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </Panel>
  </Page>
));
