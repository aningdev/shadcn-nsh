import { mount, View } from "nsh";

import { Badge } from "@/packages/ui/badge";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Badge">
      <DemoCard>
        <DemoSection title="Tone">
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge label="Neutral" tone="neutral" />
            <Badge label="Accent" tone="accent" />
            <Badge label="Info" tone="info" />
            <Badge label="Warn" tone="warn" />
            <Badge label="Danger" tone="danger" />
            <Badge label="Up" tone="up" />
            <Badge label="Down" tone="down" />
          </View>
        </DemoSection>
        <DemoSection title="Outline">
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge label="Outline" outline />
            <Badge label="Danger" tone="danger" outline />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
