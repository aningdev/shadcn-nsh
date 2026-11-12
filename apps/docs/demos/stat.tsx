import { mount, View } from "nsh";

import { Stat } from "@/packages/ui/stat";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Stat">
      <DemoCard>
        <DemoSection title="Grid">
          <View style={{ flexDirection: "row", gap: 24 }}>
            <Stat label="Users" value="12.4k" />
            <Stat label="Latency" value="42 ms" tone="accent" />
            <Stat label="Errors" value="0.2%" tone="down" width="40%" truncate />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
