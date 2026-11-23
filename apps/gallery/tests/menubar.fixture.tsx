import { mount, Text, View } from "nsh";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "../../../packages/ui";

function App() {
  return (
    <View>
      <Menubar testID="bar" accessibilityLabel="Main">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger disabled>Off</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Never</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger testID="help" accessibilityLabel="Help" hoverStyle={{ opacity: 0.5 }}>
            Help
          </MenubarTrigger>
          <MenubarContent>
            <MenubarLabel testID="label" accessibilityLabel="This file">
              This file
            </MenubarLabel>
            <MenubarItem testID="new">
              New
              <MenubarShortcut testID="note">⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem testID="gone" disabled>
              Archive
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Text>after</Text>
    </View>
  );
}

mount(App);
