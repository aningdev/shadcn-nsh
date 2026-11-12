// The reference of `number-input.tsx`: the look on `nsh/base`'s NumberInput.
import { mount, platform, signal } from "nsh";
import { NumberInput } from "nsh/base";

import { numberInputClasses, numberInputSteps, numberInputText } from "@/packages/ui/number-input";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const tickets = signal<number | null>(2);
  const price = signal<number | null>(19.95);
  const pointer = platform.desktop;
  const w = pointer ? "w-8" : "w-11";
  const icon = pointer ? 14 : 16;

  return (
    <DemoPage title="Number Input" note={() => `tickets ${tickets()} · price ${price()}`}>
      <DemoCard>
        <DemoSection title="Split">
          <NumberInput
            value={tickets()}
            onChange={({ value }) => tickets.set(value)}
            min={1}
            max={10}
            accessibilityLabel="Tickets"
            class={numberInputClasses.frame}
            inputStyle={{ ...numberInputText(), textAlign: "center" }}
            {...numberInputSteps("split", w, icon)}
          />
        </DemoSection>
        <DemoSection title="Pair">
          <NumberInput
            value={price()}
            onChange={({ value }) => price.set(value)}
            step={0.05}
            min={0}
            accessibilityLabel="Price"
            class={numberInputClasses.frame}
            inputStyle={numberInputText()}
            {...numberInputSteps("pair", w, icon)}
          />
        </DemoSection>
        <DemoSection title="States">
          <NumberInput
            value={3}
            disabled
            accessibilityLabel="Disabled"
            class={numberInputClasses.frame}
            inputStyle={numberInputText()}
            {...numberInputSteps("pair", w, icon)}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
