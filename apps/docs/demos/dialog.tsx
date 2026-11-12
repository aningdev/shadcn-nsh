import { mount, signal, View } from "nsh";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/packages/ui/dialog";

import { DemoPage } from "./kit";

function App() {
  const last = signal("–");

  return (
    <DemoPage title="Dialog" note={() => last()}>
      <View style={{ flexDirection: "row" }}>
        <Dialog
          onOpenChange={({ open, reason }) => last.set(`${open ? "open" : "closed"}: ${reason}`)}
        >
          <DialogTrigger variant="primary">Delete item…</DialogTrigger>
          <DialogContent>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>A press on the dimmed backdrop closes it.</DialogDescription>
            <DialogFooter>
              <DialogClose>Keep</DialogClose>
              <DialogClose variant="danger" onPress={() => last.set("deleted")}>
                Delete
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>
    </DemoPage>
  );
}

mount(App);
