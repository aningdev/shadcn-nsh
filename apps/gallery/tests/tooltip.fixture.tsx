import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../packages/ui";

function App() {
  const off = signal(false);
  const picked = signal("");
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" disabled={off()}>
            Hover A
          </Button>
        </TooltipTrigger>
        <TooltipContent>Tip A</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>Hover B</TooltipTrigger>
        <TooltipContent>Tip B</TooltipContent>
      </Tooltip>
      <Menu>
        <MenuTrigger>
          <View
            role="button"
            accessibilityLabel="Actions"
            tooltip={<TooltipContent>More actions</TooltipContent>}
            style={{ padding: 8, borderWidth: 1, borderColor: "#00000022", borderRadius: 6 }}
          >
            <Text>Actions</Text>
          </View>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => picked.set("chosen")}>
            <Text>Choose</Text>
          </MenuItem>
        </MenuContent>
      </Menu>
      <Text>{`picked ${picked()}`}</Text>
    </View>
  );
}

mount(App);
