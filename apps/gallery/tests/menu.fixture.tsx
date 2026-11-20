import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Menu,
  MenuButton,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
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
          <MenuGroup>
            <MenuItem onSelect={() => picked.set("A")}>
              <Text>Key A</Text>
            </MenuItem>
            <MenuItem disabled onSelect={() => picked.set("B")}>
              <Text>Key B</Text>
            </MenuItem>
            <MenuItem onSelect={() => picked.set("C")}>
              <Text>Key C</Text>
            </MenuItem>
          </MenuGroup>
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
          <MenuSub>
            <MenuSubTrigger lead={<Text>★</Text>}>Picked</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>
                <Text>Picked item</Text>
              </MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSub>
            <MenuSubTrigger style={{ display: "none" }}>Gone</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>
                <Text>Gone item</Text>
              </MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>
          <View role="button" accessibilityLabel="Open N">
            <Text>Open N</Text>
          </View>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>
            <Text>Item N</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
      <MenuButton
        items={[
          { id: "name", label: "By name", checked: sort() === "Name" },
          { id: "date", label: "By date", checked: sort() === "Date" },
          { id: "share", label: "Share", items: [{ id: "mail", label: "Mail" }] },
          { id: "none", label: "None", disabled: true },
        ]}
        onSelect={({ id }) => sort.set(id === "date" ? "Date" : id === "name" ? "Name" : id)}
        title="Arrange"
      >
        Arrange
      </MenuButton>
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
