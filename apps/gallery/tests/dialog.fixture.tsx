import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@shadcn-nsh/ui";
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
      <Dialog onOpenChange={() => changes.set(changes() + 1)}>
        <DialogTrigger>Open A</DialogTrigger>
        <DialogContent animation="none">
          <Text>Body A</Text>
          <DialogClose>Close A</DialogClose>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>
          <Text>Open B</Text>
        </DialogTrigger>
        <DialogContent animation="none">
          <Text>Body B</Text>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger disabled={off()}>Open C</DialogTrigger>
        <DialogContent animation="none">
          <Text>Body C</Text>
        </DialogContent>
      </Dialog>
    </View>
  );
}

mount(App);
