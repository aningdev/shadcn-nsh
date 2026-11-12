import { mount, Text } from "nsh";

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../../../packages/ui";

function App() {
  return (
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Plain</MenuItem>
        <MenuItem disabled>Paste</MenuItem>
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
  );
}

mount(App);
