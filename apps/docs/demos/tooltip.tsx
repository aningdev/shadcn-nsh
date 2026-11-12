import { mount, signal, Text, View } from "nsh";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  tooltipNote,
  tooltipText,
} from "@/packages/ui/tooltip";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const last = signal("open");

  return (
    <DemoPage title="Tooltip" note={() => last()}>
      <DemoCard>
        <DemoSection title="Placement">
          <View style={{ flexDirection: "row", gap: 48, paddingVertical: 40 }}>
            <Tooltip
              open
              placement="top"
              onOpenChange={({ open, reason }) =>
                last.set(`${open ? "shown" : "hidden"} · ${reason}`)
              }
            >
              <TooltipTrigger>Top</TooltipTrigger>
              <TooltipContent>Add to favorites</TooltipContent>
            </Tooltip>
            <Tooltip open placement="bottom">
              <TooltipTrigger>Bottom</TooltipTrigger>
              <TooltipContent>Share with your team</TooltipContent>
            </Tooltip>
          </View>
        </DemoSection>
        <DemoSection title="Rich">
          <View style={{ paddingVertical: 40 }}>
            <Tooltip open>
              <TooltipTrigger>Rich</TooltipTrigger>
              <TooltipContent rich>
                <Text class={tooltipText}>Delete forever</Text>
                <Text class={tooltipNote}>⌘⌫</Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
