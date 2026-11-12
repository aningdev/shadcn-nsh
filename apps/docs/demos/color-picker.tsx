import { mount, signal } from "nsh";
import type { ColorFormat } from "nsh/base";
import { ColorPicker } from "nsh/base";

import { ColorPanel } from "@/packages/ui/color-picker";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const SWATCHES = ["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"];

function App() {
  const fill = signal("#6366f1ff");
  const format = signal<ColorFormat>("hex");

  return (
    <DemoPage title="Color picker">
      <DemoCard>
        <DemoSection title="Fill">
          <ColorPicker value={fill()} format={format()} onChange={({ value }) => fill.set(value)}>
            <ColorPanel
              name="Fill color"
              value={fill()}
              format={format()}
              onFormatChange={(f) => format.set(f)}
              alpha
              swatches={SWATCHES}
            />
          </ColorPicker>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
