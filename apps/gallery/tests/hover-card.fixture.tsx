import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Button, HoverCard } from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const off = signal(false);
  return (
    <View>
      <Text>{() => `changes ${changes()}`}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <HoverCard
        onOpenChange={() => changes.set(changes() + 1)}
        trigger={<Button variant="secondary">Open A</Button>}
      >
        <Text>Body A</Text>
      </HoverCard>
      <HoverCard trigger={<Button variant="secondary">Open B</Button>}>
        <Text>Body B</Text>
      </HoverCard>
      <HoverCard
        trigger={
          <Button variant="secondary" disabled={off()}>
            Open C
          </Button>
        }
      >
        <Text>Body C</Text>
      </HoverCard>
    </View>
  );
}

mount(App);
