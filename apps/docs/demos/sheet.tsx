import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/packages/ui/sheet";

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Sheet</Text>
      <Sheet open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom sheet</SheetTitle>
            <SheetDescription>
              Trigger / Content with edge chrome. Backdrop, Escape, or Close dismisses.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger>Right side</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Side drawer</SheetTitle>
            <SheetDescription>side right — min width chrome</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose>Done</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger>Style merge</SheetTrigger>
        <SheetContent side="bottom" popupStyle={{ padding: 24, minHeight: 200 }}>
          <SheetTitle style={{ fontSize: 18 }}>Merged chrome</SheetTitle>
          <SheetDescription>Consumer popupStyle wins per key</SheetDescription>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")}
      </Text>
    </View>
  );
}

mount(App);
