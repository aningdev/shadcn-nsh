import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@shadcn-nsh/ui";
import { mount, Text } from "nsh";

function App() {
  return (
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>
          <Text>Plain</Text>
        </MenuItem>
        <MenuItem disabled>
          <Text>Paste</Text>
        </MenuItem>
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
