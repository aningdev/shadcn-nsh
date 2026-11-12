import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text } from "nsh";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@/packages/ui/menu";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("–");
  const sidebar = signal(true);
  const sort = signal("Name");

  return (
    <DemoPage title="Menu" note={() => last()}>
      <DemoCard>
        <DemoSection title="File">
          <Menu
            defaultOpen
            onOpenChange={({ open, reason }) =>
              last.set(`${open ? "opened" : "closed"} · ${reason}`)
            }
          >
            <MenuTrigger>File ▾</MenuTrigger>
            <MenuContent margin={8}>
              <MenuItem onSelect={() => last.set("New")}>New</MenuItem>
              <MenuItem onSelect={() => last.set("Open…")}>Open…</MenuItem>
              <MenuItem disabled>Paste</MenuItem>
              <MenuSeparator />
              <MenuSub>
                <MenuSubTrigger>Share</MenuSubTrigger>
                <MenuSubContent offset={4}>
                  <MenuItem onSelect={() => last.set("Share › Mail")}>Mail</MenuItem>
                  <MenuItem onSelect={() => last.set("Share › Messages")}>Messages</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem danger onSelect={() => last.set("Delete")}>
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>
        </DemoSection>
        <DemoSection title="View">
          <Menu>
            <MenuTrigger>View ▾</MenuTrigger>
            <MenuContent margin={8}>
              <MenuCheckboxItem
                checked={sidebar()}
                closeOnSelect={false}
                onSelect={() => sidebar.set(!sidebar())}
              >
                Show sidebar
              </MenuCheckboxItem>
              <MenuSeparator />
              <MenuLabel text="Sort by" />
              <MenuRadioItem checked={sort() === "Name"} onSelect={() => sort.set("Name")}>
                Name
              </MenuRadioItem>
              <MenuRadioItem checked={sort() === "Date"} onSelect={() => sort.set("Date")}>
                Date
              </MenuRadioItem>
            </MenuContent>
          </Menu>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {() => `sidebar ${sidebar() ? "on" : "off"} · sort ${sort()}`}
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
