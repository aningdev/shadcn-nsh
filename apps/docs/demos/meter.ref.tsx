import { mount, View } from "nsh";

import { Meter } from "@/packages/ui/meter";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Meter">
      <DemoCard>
        <DemoSection title="Value">
          <View style={{ width: 240, gap: 12 }}>
            <Meter value={0.35} />
            <Meter value={0.72} tone="up" />
          </View>
        </DemoSection>
        <DemoSection title="Marker">
          <View style={{ width: 240 }}>
            <Meter value={0.55} marker={0.8} />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
