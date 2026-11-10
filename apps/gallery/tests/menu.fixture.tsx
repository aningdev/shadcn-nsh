import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const changes = signal(0);
  const selected = signal(0);
  const off = signal(false);
  return (
    <View>
      <Text>changes {() => changes()}</Text>
      <Text>selected {() => selected()}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Menu onOpenChange={() => changes.set(changes() + 1)}>
        <MenuTrigger>Open M</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => selected.set(selected() + 1)}>
            <Text>Item A</Text>
          </MenuItem>
          <MenuItem disabled={off()}>
            <Text>Item B</Text>
          </MenuItem>
          <MenuCheckboxItem checked>
            <Text>Checked</Text>
          </MenuCheckboxItem>
          <MenuSub>
            <MenuSubTrigger>More</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>
                <Text>Sub item</Text>
              </MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>
          <Text>Open N</Text>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>
            <Text>Item N</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger disabled={off()}>Open O</MenuTrigger>
        <MenuContent>
          <MenuItem>
            <Text>Item O</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
    </View>
  );
}

mount(App);
