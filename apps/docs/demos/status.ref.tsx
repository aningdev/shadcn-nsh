import { mount, View } from "nsh";

import { Status } from "@/packages/ui/status";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Status">
      <DemoCard>
        <DemoSection title="Default">
          <View style={{ gap: 10 }}>
            <Status label="Idle" tone="neutral" />
            <Status label="Syncing" tone="accent" />
            <Status label="Update available" tone="info" />
            <Status label="Degraded" tone="warn" />
            <Status label="Offline" tone="danger" />
            <Status label="Online" tone="up" />
            <Status label="Down" tone="down" />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
