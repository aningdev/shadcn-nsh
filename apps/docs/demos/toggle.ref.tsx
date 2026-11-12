// The reference of `toggle.tsx`: the same page as upstream writes a toggle, the look spread
// on `nsh/base`'s Toggle. The render check requires the two to draw the same pixels.
import { mount, signal, Text } from "nsh";
import { Toggle } from "nsh/base";

import {
  toggleLabel,
  toggleLook,
  type ToggleLookOptions,
  type ToggleSize,
} from "@/packages/ui/toggle";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Plain(props: {
  label: string;
  variant?: "ghost" | "outline";
  size?: ToggleSize;
  pressed?: boolean;
  disabled?: boolean;
  onChange?: (event: { pressed: boolean }) => void;
}) {
  const options: ToggleLookOptions = {
    size: () => props.size,
    variant: props.variant,
    text: true,
    disabled: () => props.disabled,
  };
  return (
    <Toggle
      pressed={props.pressed}
      disabled={props.disabled}
      onChange={props.onChange}
      {...toggleLook(options)}
    >
      <Text style={toggleLabel(() => props.pressed, options)}>{props.label}</Text>
    </Toggle>
  );
}

function App() {
  const bold = signal(true);
  const starred = signal(false);

  return (
    <DemoPage title="Toggle" note={() => `bold ${String(bold())} · starred ${String(starred())}`}>
      <DemoCard>
        <DemoSection title="Variant">
          <Plain
            label="Ghost"
            variant="ghost"
            pressed={bold()}
            onChange={({ pressed }) => bold.set(pressed)}
          />
          <Plain
            label="Outline"
            variant="outline"
            pressed={starred()}
            onChange={({ pressed }) => starred.set(pressed)}
          />
        </DemoSection>
        <DemoSection title="Size">
          <Plain label="Small" size="small" pressed />
          <Plain label="Regular" size="regular" pressed />
          <Plain label="Large" size="large" pressed />
        </DemoSection>
        <DemoSection title="States">
          <Plain label="On" pressed={bold()} onChange={({ pressed }) => bold.set(pressed)} />
          <Plain label="Off" />
          <Plain label="Disabled" pressed disabled />
          <Plain label="Disabled" disabled />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
