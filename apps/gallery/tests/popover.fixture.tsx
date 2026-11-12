import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Popover, PopoverContent, PopoverTrigger } from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const off = signal(false);
  return (
    <View>
      <Text>{() => `changes ${changes()}`}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Popover onOpenChange={() => changes.set(changes() + 1)}>
        <PopoverTrigger>Open A</PopoverTrigger>
        <PopoverContent>
          <Text>Body A</Text>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>
          <Text>Open B</Text>
        </PopoverTrigger>
        <PopoverContent>
          <Text>Body B</Text>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger disabled={off()}>Open C</PopoverTrigger>
        <PopoverContent>
          <Text>Body C</Text>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger disabled={off()}>
          <Text>Open D</Text>
        </PopoverTrigger>
        <PopoverContent>
          <Text>Body D</Text>
        </PopoverContent>
      </Popover>
    </View>
  );
}

mount(App);
