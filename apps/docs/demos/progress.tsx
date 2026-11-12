import { mount, View } from "nsh";

import { Progress } from "@/packages/ui/progress";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Progress">
      <DemoCard>
        <DemoSection title="Determinate">
          <Progress value={35} style={{ width: 240 }} />
          <Progress value={100} tone="up" style={{ width: 240 }} />
        </DemoSection>
        <DemoSection title="Thin">
          <Progress value={60} height={4} style={{ width: 240 }} />
        </DemoSection>
        <DemoSection title="Tone">
          <View style={{ flex: 1, flexDirection: "row", gap: 6 }}>
            <Progress value={72} tone="neutral" style={{ flex: 1 }} />
            <Progress value={72} tone="accent" style={{ flex: 1 }} />
            <Progress value={72} tone="info" style={{ flex: 1 }} />
            <Progress value={72} tone="warn" style={{ flex: 1 }} />
            <Progress value={72} tone="danger" style={{ flex: 1 }} />
            <Progress value={72} tone="up" style={{ flex: 1 }} />
            <Progress value={72} tone="down" style={{ flex: 1 }} />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
