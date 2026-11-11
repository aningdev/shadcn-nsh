import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function App() {
  const last = signal("–");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Dialog</Text>
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
      <Text style={{ fontSize: 13, color: colors.muted }}>{last()}</Text>
    </View>
  );
}

mount(App);
