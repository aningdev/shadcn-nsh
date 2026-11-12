import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const off = signal(false);
  return (
    <View>
      <Text>{() => `changes ${changes()}`}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <HoverCard onOpenChange={() => changes.set(changes() + 1)}>
        <HoverCardTrigger>Open A</HoverCardTrigger>
        <HoverCardContent>
          <Text>Body A</Text>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger>
          <Text>Open B</Text>
        </HoverCardTrigger>
        <HoverCardContent>
          <Text>Body B</Text>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger disabled={off()}>Open C</HoverCardTrigger>
        <HoverCardContent>
          <Text>Body C</Text>
        </HoverCardContent>
      </HoverCard>
    </View>
  );
}

mount(App);
