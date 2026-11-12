import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const selected = signal(0);
  const off = signal(false);
  const picked = signal("none");
  const sidebar = signal(true);
  const sort = signal("Name");
  return (
    <View>
      <Text>picked {() => picked()}</Text>
      <Text>sidebar {() => (sidebar() ? "on" : "off")}</Text>
      <Text>sort {() => sort()}</Text>
      <Menu>
        <MenuTrigger>Open K</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => picked.set("A")}>
            <Text>Key A</Text>
          </MenuItem>
          <MenuItem disabled onSelect={() => picked.set("B")}>
            <Text>Key B</Text>
          </MenuItem>
          <MenuItem onSelect={() => picked.set("C")}>
            <Text>Key C</Text>
          </MenuItem>
          <MenuCheckboxItem
            checked={sidebar()}
            closeOnSelect={false}
            onSelect={() => sidebar.set(!sidebar())}
          >
            <Text>Sidebar</Text>
          </MenuCheckboxItem>
          <MenuRadioItem
            checked={sort() === "Name"}
            closeOnSelect={false}
            onSelect={() => sort.set("Name")}
          >
            <Text>By name</Text>
          </MenuRadioItem>
          <MenuRadioItem
            checked={sort() === "Date"}
            closeOnSelect={false}
            onSelect={() => sort.set("Date")}
          >
            <Text>By date</Text>
          </MenuRadioItem>
        </MenuContent>
      </Menu>
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
