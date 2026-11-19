import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../packages/ui";

// What a control draws can read a signal: its text, and which elements it holds. A control reads
// its children once (`childrenOf`), and that one read is kept live.
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
    </View>
  );
}

mount(App);
