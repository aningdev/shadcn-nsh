import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  dialogPage,
} from "../../../packages/ui/dialog";

/** A body longer than any window shows: the shell's scroll and its height cap are what make it fit. */
const LINES = Array.from({ length: 60 }, (_, i) => `Line ${i + 1}`);

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
      <Dialog>
        <DialogTrigger>Open Long</DialogTrigger>
        <DialogContent animation="none" testID="long-card">
          <DialogTitle>Release notes</DialogTitle>
          <DialogDescription>
            A body taller than the window scrolls under the card's cap.
          </DialogDescription>
          <View style={{ gap: 8 }}>
            <Each of={LINES}>{(line) => <Text>{line()}</Text>}</Each>
          </View>
          <DialogFooter>
            <DialogClose>Pin</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>Open Card</DialogTrigger>
        <DialogContent animation="none" testID="card-popup">
          <Text>Card body</Text>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>Open Presented</DialogTrigger>
        <DialogContent animation="none" presentation="fullScreen" testID="presented-popup">
          <Text>Presented body</Text>
        </DialogContent>
      </Dialog>
      <View testID="page-view" style={[{ height: 20 }, dialogPage()]} />
    </View>
  );
}

mount(App);
