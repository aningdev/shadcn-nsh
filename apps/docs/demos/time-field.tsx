import { mount, signal } from "nsh";

import { TimeField } from "@/packages/ui/time-field";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const time = signal("09:30");

  return (
    <DemoPage title="Time Field" note={() => time()}>
      <DemoCard>
        <DemoSection title="Value">
          <TimeField
            value={time()}
            onChange={({ value }) => time.set(value)}
            accessibilityLabel="Time"
          />
        </DemoSection>
        <DemoSection title="States">
          <TimeField value="12:00" disabled accessibilityLabel="Disabled" />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
