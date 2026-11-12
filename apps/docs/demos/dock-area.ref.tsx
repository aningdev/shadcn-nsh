// The reference of `dock-area.tsx`: `dockClasses` / `DockTab` on `nsh/base`'s DockArea.
import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";
import { DockArea, type DockAreaLayout } from "nsh/base";

import { dockClasses, DockTab } from "@/packages/ui/dock-area";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const layout: DockAreaLayout = {
  center: { type: "tabs", panels: ["readme", "preview"], activeIndex: 0 },
};

function App() {
  const line = colors.border;

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
              borderColor: line,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <DockArea
              defaultLayout={layout}
              {...dockClasses}
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
