import { mount, platform, signal } from "nsh";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/packages/ui/select";

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
          >
            <SelectTrigger kind="field" style={trigger}>
              <SelectValue placeholder="Choose a language" />
            </SelectTrigger>
            <SelectContent accessibilityLabel="Language">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
        </DemoSection>
        <DemoSection title="Trigger">
          <Select defaultValue="de">
            <SelectTrigger kind="outline" style={trigger}>
              <SelectValue placeholder="Choose a language" />
            </SelectTrigger>
            <SelectContent accessibilityLabel="Language, outline">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
