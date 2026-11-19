import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../packages/ui";

// What a control draws can read a signal: its text, and which elements it holds. A control reads
// its children once, where it draws them, and a child that changes stays live.
function App() {
  const presses = signal(0);
  const on = signal(false);
  return (
    <View style={{ padding: 20, gap: 8 }}>
      <BaseButton onPress={() => presses.set(presses() + 1)}>
        <Text>Bump</Text>
      </BaseButton>
      <BaseButton onPress={() => on.set(!on())}>
        <Text>Switch</Text>
      </BaseButton>

      <Button>{presses() ? "Pressed once" : "Not pressed"}</Button>
      <Button>{on() ? <Text>On</Text> : <Text>Off</Text>}</Button>

      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem closeOnSelect={false} onSelect={() => presses.set(presses() + 1)}>
            {presses() ? "Item pressed" : "Item idle"}
          </MenuItem>
        </MenuContent>
      </Menu>

      <Popover>
        <PopoverTrigger>{presses() ? "Tip pressed" : "Tip idle"}</PopoverTrigger>
        <PopoverContent>
          <Text>Body</Text>
        </PopoverContent>
      </Popover>

      {/* Held open by the app, so the submenu's row is on screen while the signal moves. */}
      <Menu open>
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger>{presses() ? "Sub pressed" : "Sub idle"}</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem closeOnSelect={false} onSelect={() => presses.set(presses() + 1)}>
                Item
              </MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    </View>
  );
}

mount(App);
