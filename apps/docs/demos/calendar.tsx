import { mount, signal } from "nsh";

import { Calendar } from "@/packages/ui/calendar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const value = signal("2026-11-11");
  const last = signal("–");

  return (
    <DemoPage title="Calendar" note={() => last()}>
      <DemoCard>
        <DemoSection title="Day">
          <Calendar
            value={value()}
            onChange={({ value: next }) => {
              const day = typeof next === "string" ? next : (next?.[0] ?? "2026-11-11");
              value.set(day ?? "2026-11-11");
              last.set(day ?? "–");
            }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
