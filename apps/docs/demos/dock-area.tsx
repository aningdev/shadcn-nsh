import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";
import type { DockAreaLayout } from "nsh/base";

import { DockArea, DockTab } from "@/packages/ui/dock-area";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const layout: DockAreaLayout = {
  center: { type: "tabs", panels: ["readme", "preview"], activeIndex: 0 },
};

function App() {
  return (
    <DemoPage title="Dock area">
      <DemoCard>
        <DemoSection title="Tabs">
          <View
            style={{
              height: 220,
              width: 360,
              maxWidth: "100%",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <DockArea
              defaultLayout={layout}
              renderTab={(tab) => <DockTab title={tab.panel} active={tab.active} />}
              renderPanel={(panel) => (
                <View class="flex-1 p-3">
                  <Text style={{ fontSize: 13 }}>{panel.id}</Text>
                </View>
              )}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
