import { mount, View } from "nsh";

import { Status } from "@/packages/ui/status";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Status">
      <DemoCard>
        <DemoSection title="Default">
          <View style={{ gap: 10 }}>
            <Status label="Idle" />
            <Status label="Syncing" tone="accent" />
            <Status label="Online" tone="up" />
            <Status label="Degraded" tone="warn" />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
