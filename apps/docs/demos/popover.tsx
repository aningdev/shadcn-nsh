import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/packages/ui/popover";

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
              onOpenChange={({ open, reason }) =>
                last.set(`${open ? "opened" : "closed"} · ${reason}`)
              }
            >
              <PopoverTrigger variant="primary">Order 1024</PopoverTrigger>
              <PopoverContent placement="bottom" offset={8} width={260}>
                <PopoverHeader style={{ gap: 2 }}>
                  <PopoverTitle style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                    Shipped yesterday
                  </PopoverTitle>
                  <PopoverDescription style={{ fontSize: 12, color: colors.muted }}>
                    Arriving Friday. The trigger, a press outside and Escape close this.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </View>
        </DemoSection>
        <DemoSection title="Compact">
          <View
            style={{ width: "100%", height: 120, alignItems: "center", justifyContent: "center" }}
          >
            <Popover open>
              <PopoverTrigger>Note</PopoverTrigger>
              <PopoverContent compact placement="top">
                <Text style={{ fontSize: 12, color: colors.text }}>A small note</Text>
              </PopoverContent>
            </Popover>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
