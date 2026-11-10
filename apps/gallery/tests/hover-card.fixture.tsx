import { HoverCard, HoverCardContent, HoverCardTrigger } from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

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
        <HoverCardContent openDelay={0} closeDelay={0}>
          <Text>Body A</Text>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger>
          <Text>Open B</Text>
        </HoverCardTrigger>
        <HoverCardContent openDelay={0} closeDelay={0}>
          <Text>Body B</Text>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger disabled={off()}>Open C</HoverCardTrigger>
        <HoverCardContent openDelay={0} closeDelay={0}>
          <Text>Body C</Text>
        </HoverCardContent>
      </HoverCard>
    </View>
  );
}

mount(App);
