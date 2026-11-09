import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../packages/ui/dialog";

function App() {
  const open = signal(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Dialog</Text>
      <Dialog open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              Trigger / Content with card chrome. Backdrop, Escape, or Close dismisses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose variant="default">Confirm</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>Slide animation</DialogTrigger>
        <DialogContent animation="slide">
          <DialogHeader>
            <DialogTitle>Slides in</DialogTitle>
            <DialogDescription>animation slide on Content</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>Style merge</DialogTrigger>
        <DialogContent style={{ padding: 32, maxWidth: 480 }}>
          <DialogTitle style={{ fontSize: 18 }}>Merged chrome</DialogTitle>
          <DialogDescription>Consumer style wins per key</DialogDescription>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")}
      </Text>
    </View>
  );
}

mount(App);
