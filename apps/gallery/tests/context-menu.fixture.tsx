import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const off = signal(false);
  const pinned = signal(false);
  const armed = signal(false);
  return (
    <View>
      <Text>changes {() => changes()}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <ContextMenu disabled={off()} onOpenChange={() => changes.set(changes() + 1)}>
        <ContextMenuTrigger>
          <Text>Area</Text>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem closeOnSelect={false} onSelect={() => armed.set(true)}>
            <Text>Arm</Text>
          </ContextMenuItem>
          <ContextMenuItem
            checked={armed() ? pinned() : undefined}
            closeOnSelect={false}
            onSelect={() => pinned.set(!pinned())}
          >
            <Text>Pin</Text>
          </ContextMenuItem>
          <ContextMenuItem>
            <Text>Copy</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </View>
  );
}

mount(App);
