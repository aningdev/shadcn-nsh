import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const changes = signal(0);
  const off = signal(false);
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
          <ContextMenuItem>
            <Text>Copy</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </View>
  );
}

mount(App);
