// The reference of `calendar.tsx`: calendarLook on `nsh/base`'s Calendar.
import { terminal } from "@shadcn-nsh/theme";
import { mount, signal } from "nsh";
import { Calendar } from "nsh/base";

import { CalendarItem, calendarLook } from "@/packages/ui/calendar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const monthGap = 16;

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
            style={calendarLook.calendar}
            headerStyle={calendarLook.header}
            bodyStyle={terminal ? undefined : { gap: monthGap }}
            itemClass={calendarLook.itemClass}
            renderItem={(item) => <CalendarItem item={item} />}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
