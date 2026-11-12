import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Tooltip, tooltipNote, tooltipText } from "@/packages/ui/tooltip";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("open");

  return (
    <DemoPage title="Tooltip" note={() => last()}>
      <DemoCard>
        <DemoSection title="Placement">
          <View style={{ flexDirection: "row", gap: 48, paddingVertical: 40 }}>
            <Button
              variant="secondary"
              tooltip={
                <Tooltip
                  open
                  placement="top"
                  onOpenChange={({ open, reason }) =>
                    last.set(`${open ? "shown" : "hidden"} · ${reason}`)
                  }
                >
                  Add to favorites
                </Tooltip>
              }
            >
              Top
            </Button>
            <Button
              variant="secondary"
              tooltip={
                <Tooltip open placement="bottom">
                  Share with your team
                </Tooltip>
              }
            >
              Bottom
            </Button>
          </View>
        </DemoSection>
        <DemoSection title="Rich">
          <View style={{ paddingVertical: 40 }}>
            <Button
              variant="secondary"
              tooltip={
                <Tooltip open rich>
                  <Text class={tooltipText}>Delete forever</Text>
                  <Text class={tooltipNote}>⌘⌫</Text>
                </Tooltip>
              }
            >
              Rich
            </Button>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
