import { mount, View } from "nsh";

import { Badge } from "@/packages/ui/badge";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Badge">
      <DemoCard>
        <DemoSection title="Tone">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge label="Neutral" />
            <Badge label="Accent" tone="accent" />
            <Badge label="Up" tone="up" />
            <Badge label="Warn" tone="warn" />
          </View>
        </DemoSection>
        <DemoSection title="Outline">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge label="Outline" outline />
            <Badge label="Danger" tone="danger" outline />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
