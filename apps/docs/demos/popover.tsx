import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Popover } from "@/packages/ui/popover";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("open");

  return (
    <DemoPage title="Popover" note={() => last()}>
      <DemoCard>
        <DemoSection title="Default">
          <View style={{ height: 200, alignItems: "center", justifyContent: "center" }}>
            <Popover
              open
              placement="bottom"
              offset={8}
              width={260}
              onOpenChange={({ open, reason }) =>
                last.set(`${open ? "opened" : "closed"} · ${reason}`)
              }
              trigger={<Button variant="primary">Order 1024</Button>}
            >
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  Shipped yesterday
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  Arriving Friday. The trigger, a press outside and Escape close this.
                </Text>
              </View>
            </Popover>
          </View>
        </DemoSection>
        <DemoSection title="Compact">
          <View style={{ height: 120, alignItems: "center", justifyContent: "center" }}>
            <Popover
              open
              compact
              placement="top"
              trigger={<Button variant="secondary">Note</Button>}
            >
              <Text style={{ fontSize: 12, color: colors.text }}>A small note</Text>
            </Popover>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
