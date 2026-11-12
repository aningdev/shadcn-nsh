import { mount, platform, signal } from "nsh";

import { DatePicker, DateTrigger } from "@/packages/ui/date-picker";

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
            trigger={
              <DateTrigger
                title={value() ?? "Pick a date"}
                placeholder={value() === null}
                open={open()}
                clearable={value() !== null}
                style={trigger}
              />
            }
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
