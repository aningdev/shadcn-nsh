import { mount, signal } from "nsh";

import { Combobox, ComboToggle, OptionRow } from "@/packages/ui/combobox";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const FRAMES = [
  { value: "react", title: "React" },
  { value: "vue", title: "Vue" },
  { value: "svelte", title: "Svelte" },
  { value: "solid", title: "Solid" },
];

function App() {
  const value = signal<string[]>(["react"]);
  const open = signal(true);
  const last = signal("–");

  return (
    <DemoPage title="Combobox" note={() => last()}>
      <DemoCard>
        <DemoSection title="Framework">
          <Combobox
            items={FRAMES}
            value={value()}
            open={open()}
            listOpen={open()}
            filled={value().length > 0}
            placeholder="Pick a framework"
            onChange={({ value: next }) => {
              value.set(next);
              last.set(next.join(", ") || "–");
            }}
            onOpenChange={({ open: next, reason }) => {
              open.set(next);
              last.set(`${next ? "opened" : "closed"} · ${reason}`);
            }}
            triggerButton={<ComboToggle open={open()} />}
            renderItem={(item) => <OptionRow item={item} />}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
