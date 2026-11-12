// The reference of `meter.tsx`: the gallery `Meter` from index (same pixels as the component).
import { mount, View } from "nsh";

import { Meter } from "@/packages/ui/meter";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Meter">
      <DemoCard>
        <DemoSection title="Tone">
          <View style={{ flex: 1, flexDirection: "row", gap: 6 }}>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="neutral" />
            </View>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="accent" />
            </View>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="info" />
            </View>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="warn" />
            </View>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="danger" />
            </View>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="up" />
            </View>
            <View style={{ flex: 1 }}>
              <Meter value={0.62} tone="down" />
            </View>
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
