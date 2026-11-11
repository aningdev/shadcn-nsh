import { mount, signal } from "nsh";

import { Toggle } from "../ui/toggle";
import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const bold = signal(true);
  const starred = signal(false);

  return (
    <DemoPage title="Toggle" note={() => `bold ${String(bold())} · starred ${String(starred())}`}>
      <DemoCard>
        <DemoSection title="Variant">
          <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
            Ghost
          </Toggle>
          <Toggle
            variant="outline"
            pressed={starred()}
            onChange={({ pressed }) => starred.set(pressed)}
          >
            Outline
          </Toggle>
        </DemoSection>
        <DemoSection title="Size">
          <Toggle size="small" pressed>
            Small
          </Toggle>
          <Toggle pressed>Regular</Toggle>
          <Toggle size="large" pressed>
            Large
          </Toggle>
        </DemoSection>
        <DemoSection title="States">
          <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
            On
          </Toggle>
          <Toggle>Off</Toggle>
          <Toggle disabled pressed>
            Disabled
          </Toggle>
          <Toggle disabled>Disabled</Toggle>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
