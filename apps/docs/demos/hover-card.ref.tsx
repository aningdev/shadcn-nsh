// The reference of `hover-card.tsx`: the look on `nsh/base`'s HoverCard via PopIn.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Button, HoverCard } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { PopIn } from "@/packages/ui/lib/popup";
import { popoverLook } from "@/packages/ui/popover";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("open");

  return (
    <DemoPage title="Hover Card" note={() => last()}>
      <DemoCard>
        <DemoSection title="Default">
          <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
            <HoverCard
              open
              placement="bottom"
              onOpenChange={({ open, reason }) =>
                last.set(`${open ? "opened" : "closed"} · ${reason}`)
              }
              trigger={
                <Button {...buttonLook("secondary")}>
                  <Text style={buttonLabel("secondary")}>@nsh</Text>
                </Button>
              }
            >
              <PopIn side="bottom" style={popoverLook({ width: 240 })}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  Native Shell
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  A UI toolkit for desktop and touch.
                </Text>
              </PopIn>
            </HoverCard>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
