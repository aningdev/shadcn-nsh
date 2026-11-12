import { mount, signal } from "nsh";

import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@/packages/ui/combobox";

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
            value={value()}
            open={open()}
            placeholder="Pick a framework"
            onChange={({ value: next }) => {
              value.set(next);
              last.set(next.join(", ") || "–");
            }}
            onOpenChange={({ open: next, reason }) => {
              open.set(next);
              last.set(`${next ? "opened" : "closed"} · ${reason}`);
            }}
          >
            <ComboboxTrigger />
            <ComboboxContent accessibilityLabel="Framework">
              <ComboboxItem value="react">React</ComboboxItem>
              <ComboboxItem value="vue">Vue</ComboboxItem>
              <ComboboxItem value="svelte">Svelte</ComboboxItem>
              <ComboboxItem value="solid">Solid</ComboboxItem>
            </ComboboxContent>
          </Combobox>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
