// The reference of `popover.tsx`: the look on `nsh/base`'s Popover via PopIn.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Button, Popover } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { PopIn } from "@/packages/ui/lib/popup";
import { popoverLook } from "@/packages/ui/popover";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("open");

  return (
    <DemoPage title="Popover" note={() => last()}>
      <DemoCard>
        <DemoSection title="Default">
          <View
            style={{ width: "100%", height: 200, alignItems: "center", justifyContent: "center" }}
          >
            <Popover
              open
              placement="bottom"
              offset={8}
              onOpenChange={({ open, reason }) =>
                last.set(`${open ? "opened" : "closed"} · ${reason}`)
              }
              trigger={
                <Button {...buttonLook("primary")}>
                  <Text style={buttonLabel("primary")}>Order 1024</Text>
                </Button>
              }
            >
              <PopIn side="bottom" style={popoverLook({ width: 260 })}>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                    Shipped yesterday
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    Arriving Friday. The trigger, a press outside and Escape close this.
                  </Text>
                </View>
              </PopIn>
            </Popover>
          </View>
        </DemoSection>
        <DemoSection title="Compact">
          <View
            style={{ width: "100%", height: 120, alignItems: "center", justifyContent: "center" }}
          >
            <Popover
              open
              placement="top"
              trigger={
                <Button {...buttonLook("secondary")}>
                  <Text style={buttonLabel("secondary")}>Note</Text>
                </Button>
              }
            >
              <PopIn side="top" style={popoverLook({ compact: true })}>
                <Text style={{ fontSize: 12, color: colors.text }}>A small note</Text>
              </PopIn>
            </Popover>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
