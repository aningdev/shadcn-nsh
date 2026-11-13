// A copy of `apps/docs/demos/dock-area.tsx` with `class="flex-1"` on the DockArea: the audit's
// experiment for the empty panel content (see docs/specs/demo-audit.md). Not a demo.
import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";
import type { DockAreaLayout } from "nsh/base";

import { DockArea, DockTab } from "@/packages/ui/dock-area";

const layout: DockAreaLayout = {
  center: { type: "tabs", panels: ["readme", "preview"], activeIndex: 0 },
};

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Dock area</Text>
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
          class="flex-1"
          defaultLayout={layout}
          renderTab={(tab) => <DockTab title={tab.panel} active={tab.active} />}
          renderPanel={(panel) => (
            <View class="flex-1 p-3">
              <Text style={{ fontSize: 13 }}>{panel.id}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

mount(App);
