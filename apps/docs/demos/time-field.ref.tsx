// The reference of `time-field.tsx`: the look on `nsh/base`'s TimeField.
import { mount, signal } from "nsh";
import { TimeField } from "nsh/base";

import { timeFieldClass } from "@/packages/ui/time-field";

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
            class={timeFieldClass}
          />
        </DemoSection>
        <DemoSection title="States">
          <TimeField value="12:00" disabled accessibilityLabel="Disabled" class={timeFieldClass} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
