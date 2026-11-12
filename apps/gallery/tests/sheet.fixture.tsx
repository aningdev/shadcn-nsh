import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../../../packages/ui";

function App() {
  const changes = signal(0);
  const off = signal(false);
  return (
    <View>
      <Text>changes {() => changes()}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Sheet onOpenChange={() => changes.set(changes() + 1)}>
        <SheetTrigger>Open A</SheetTrigger>
        <SheetContent side="bottom">
          <Text>Body A</Text>
          <SheetClose>Close A</SheetClose>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger>
          <Text>Open B</Text>
        </SheetTrigger>
        <SheetContent side="right">
          <Text>Body B</Text>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger disabled={off()}>Open C</SheetTrigger>
        <SheetContent>
          <Text>Body C</Text>
        </SheetContent>
      </Sheet>
    </View>
  );
}

mount(App);
