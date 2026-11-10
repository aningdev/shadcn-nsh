import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";
import type { DockAreaLayout } from "nsh/base";

import { DockArea } from "@/packages/ui/dock-area";

const layout: DockAreaLayout = {
  center: {
    type: "split",
    axis: "horizontal",
    children: [{ type: "tabs", panels: ["Readme", "Main"] }],
  },
  left: { layout: { type: "tabs", panels: ["Files", "Git"] }, size: 140 },
};

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <DockArea style={{ height: 220, alignSelf: "stretch" }} defaultLayout={layout} />
    </View>
  );
}

mount(App);
