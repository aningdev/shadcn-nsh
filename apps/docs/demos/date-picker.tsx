import { mount, platform, signal } from "nsh";

import { DatePicker, DatePickerContent, DatePickerTrigger } from "@/packages/ui/date-picker";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const trigger = platform.desktop ? { width: 260 } : undefined;

function App() {
  const value = signal<string | null>("2026-11-11");
  const open = signal(true);
  const last = signal("–");

  return (
    <DemoPage title="Date Picker" note={() => last()}>
      <DemoCard>
        <DemoSection title="Due date">
          <DatePicker
            value={value()}
            open={open()}
            onChange={({ value: next }) => {
              const day = typeof next === "string" ? next : (next?.[0] ?? null);
              value.set(day);
              last.set(day ?? "cleared");
            }}
            onOpenChange={({ open: next, reason }) => {
              open.set(next);
              last.set(`${next ? "opened" : "closed"} · ${reason}`);
            }}
          >
            <DatePickerTrigger style={trigger} />
            <DatePickerContent />
          </DatePicker>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
