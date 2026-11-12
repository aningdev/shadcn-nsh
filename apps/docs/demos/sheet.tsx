import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/packages/ui/sheet";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("–");

  return (
    <DemoPage title="Sheet" note={() => last()}>
      <DemoCard>
        <DemoSection title="Bottom">
          <Sheet
            defaultOpen
            onOpenChange={({ open, reason }) =>
              last.set(`${open ? "opened" : "closed"} · ${reason}`)
            }
          >
            <SheetTrigger>Open bottom</SheetTrigger>
            <SheetContent side="bottom">
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>Filters</Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                A panel at the bottom edge. The backdrop closes it.
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <SheetClose variant="primary">Done</SheetClose>
              </View>
            </SheetContent>
          </Sheet>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
