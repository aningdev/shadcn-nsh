import { mount, Text, View } from "nsh";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../../../packages/ui";

function App() {
  return (
    <View>
      <Menubar>
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
      </Menubar>
      <Text>after</Text>
    </View>
  );
}

mount(App);
