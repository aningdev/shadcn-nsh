// The reference of `combobox.tsx`: listbox + combobox looks on `nsh/base`'s Combobox.
import { mount, signal } from "nsh";
import { Combobox } from "nsh/base";

import { ComboToggle, comboboxLook, listboxProps, OptionRow } from "@/packages/ui/combobox";

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
  const look = comboboxLook(() => open(), { filled: () => value().length > 0 });
  const chrome = listboxProps();

  return (
    <DemoPage title="Combobox" note={() => last()}>
      <DemoCard>
        <DemoSection title="Framework">
          <Combobox
            items={FRAMES}
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
            class={look.class}
            style={look.style}
            inputClass={look.inputClass}
            inputStyle={look.inputStyle}
            triggerButton={<ComboToggle open={open()} />}
            offset={chrome.offset}
            margin={chrome.margin}
            popupStyle={chrome.popupStyle}
            backdropStyle={chrome.backdropStyle}
            itemClass={chrome.itemClass}
            renderItem={(item) => <OptionRow item={item} />}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
