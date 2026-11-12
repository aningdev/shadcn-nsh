// The reference of `select.tsx`: listbox looks on `nsh/base`'s Select.
import { mount, platform, signal } from "nsh";
import { Select } from "nsh/base";

import { listboxProps, OptionRow, Picker } from "@/packages/ui/select";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const LANGUAGES = [
  { value: "en", title: "English" },
  { value: "de", title: "Deutsch" },
  { value: "fr", title: "Français" },
  { value: "ja", title: "日本語" },
];

const titleOf = (items: { value: string; title: string }[], value: string | null) =>
  items.find((i) => i.value === value)?.title;

const trigger = platform.desktop ? { width: 260 } : undefined;

function App() {
  const language = signal<string | null>("en");
  const open = signal(true);
  const last = signal("–");

  return (
    <DemoPage title="Select" note={() => last()}>
      <DemoCard>
        <DemoSection title="Language">
          <Select
            items={LANGUAGES}
            value={language()}
            open={open()}
            placeholder="Choose a language"
            onChange={({ value: next }) => {
              language.set(next);
              last.set(titleOf(LANGUAGES, next) ?? "–");
            }}
            onOpenChange={({ open: next, reason }) => {
              open.set(next);
              last.set(`${next ? "opened" : "closed"} · ${reason}`);
            }}
            accessibilityLabel="Language"
            {...listboxProps()}
            trigger={
              <Picker
                title={titleOf(LANGUAGES, language()) ?? "Choose a language"}
                placeholder={language() === null}
                open={open()}
                kind="field"
                style={trigger}
              />
            }
            renderItem={(item) => <OptionRow item={item} />}
          />
        </DemoSection>
        <DemoSection title="Trigger">
          <Select
            items={LANGUAGES}
            defaultValue="de"
            accessibilityLabel="Language, outline"
            {...listboxProps()}
            trigger={<Picker title="Deutsch" open={false} kind="outline" style={trigger} />}
            renderItem={(item) => <OptionRow item={item} />}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
