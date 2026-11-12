import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/packages/ui/hover-card";

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
              onOpenChange={({ open, reason }) =>
                last.set(`${open ? "opened" : "closed"} · ${reason}`)
              }
            >
              <HoverCardTrigger>@nsh</HoverCardTrigger>
              <HoverCardContent placement="bottom" width={240}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  Native Shell
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  A UI toolkit for desktop and touch.
                </Text>
              </HoverCardContent>
            </HoverCard>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
