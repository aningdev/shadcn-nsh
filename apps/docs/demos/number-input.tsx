import { mount, signal } from "nsh";

import { NumberInput } from "@/packages/ui/number-input";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const tickets = signal<number | null>(2);
  const price = signal<number | null>(19.95);

  return (
    <DemoPage title="Number Input" note={() => `tickets ${tickets()} · price ${price()}`}>
      <DemoCard>
        <DemoSection title="Split">
          <NumberInput
            steps="split"
            value={tickets()}
            onChange={({ value }) => tickets.set(value)}
            min={1}
            max={10}
            accessibilityLabel="Tickets"
            inputStyle={{ textAlign: "center" }}
          />
        </DemoSection>
        <DemoSection title="Pair">
          <NumberInput
            value={price()}
            onChange={({ value }) => price.set(value)}
            step={0.05}
            min={0}
            accessibilityLabel="Price"
          />
        </DemoSection>
        <DemoSection title="States">
          <NumberInput value={3} disabled accessibilityLabel="Disabled" />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
