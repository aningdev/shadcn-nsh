// The reference of `date-picker.tsx`: datePickerLook on `nsh/base`'s DatePicker.
import { mount, platform, signal } from "nsh";
import { DatePicker } from "nsh/base";

import { DateTrigger, datePickerLook } from "@/packages/ui/date-picker";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const trigger = platform.desktop ? { width: 260 } : undefined;

function App() {
  const value = signal<string | null>("2026-11-11");
  const open = signal(true);
  const last = signal("–");
  const look = datePickerLook();

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
            offset={look.offset}
            margin={look.margin}
            popupStyle={look.popupStyle}
            backdropStyle={look.backdropStyle}
            contentStyle={look.contentStyle}
            calendarStyle={look.calendarStyle}
            headerStyle={look.headerStyle}
            bodyStyle={look.bodyStyle}
            itemClass={look.itemClass}
            renderItem={look.renderItem}
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
