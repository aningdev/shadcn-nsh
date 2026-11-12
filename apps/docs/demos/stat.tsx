import { mount, View } from "nsh";

import { Stat } from "@/packages/ui/stat";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Stat">
      <DemoCard>
        <DemoSection title="Grid">
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            <Stat label="Users" value="12.4k" tone="neutral" />
            <Stat label="Latency" value="42 ms" tone="accent" />
            <Stat label="Queue" value="3" tone="info" />
            <Stat label="Errors" value="0.2%" tone="warn" />
            <Stat label="Failures" value="2" tone="danger" />
            <Stat label="Growth" value="+8.1%" tone="up" />
            <Stat label="Churn" value="−1.2%" tone="down" />
          </View>
        </DemoSection>
        <DemoSection title="Truncate">
          <View style={{ width: 180 }}>
            <Stat label="Display" value="MacBook Pro 16-inch, 2024" truncate />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
