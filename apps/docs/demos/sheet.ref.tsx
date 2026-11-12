// The reference of `sheet.tsx`: the look on `nsh/base`'s Sheet.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Sheet } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { backdrop } from "@/packages/ui/lib/overlay";
import { sheetGrabber, sheetPanel } from "@/packages/ui/sheet";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const open = signal(true);
  const last = signal("–");

  return (
    <DemoPage title="Sheet" note={() => last()}>
      <DemoCard>
        <DemoSection title="Bottom">
          <Button variant="secondary" onPress={() => open.set(true)}>
            Open bottom
          </Button>
          <Sheet
            open={open()}
            side="bottom"
            onOpenChange={({ open: next, reason }) => {
              open.set(next);
              last.set(`${next ? "opened" : "closed"} · ${reason}`);
            }}
            popupStyle={sheetPanel("bottom")}
            backdropStyle={backdrop()}
          >
            <View style={sheetGrabber()} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>Filters</Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>
              A panel at the bottom edge. The backdrop closes it.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Button variant="primary" onPress={() => open.set(false)}>
                Done
              </Button>
            </View>
          </Sheet>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
