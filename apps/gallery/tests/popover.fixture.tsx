import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Popover, PopoverContent, PopoverTrigger } from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const off = signal(false);
  const openB = signal(0);
  return (
    <View>
      <Text>{() => `changes ${changes()}`}</Text>
      <Text>{() => `custom pressed ${openB()}`}</Text>
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
          <View role="button" accessibilityLabel="Open B" onPress={() => openB.set(openB() + 1)}>
            <Text>Open B</Text>
          </View>
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
        <PopoverTrigger>
          <View role="button" accessibilityLabel="Open D" accessibilityState={{ disabled: off() }}>
            <Text>Open D</Text>
          </View>
        </PopoverTrigger>
        <PopoverContent>
          <Text>Body D</Text>
        </PopoverContent>
      </Popover>
    </View>
  );
}

mount(App);
