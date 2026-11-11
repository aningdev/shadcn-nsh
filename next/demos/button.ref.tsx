// The reference of `button.tsx`: the same page as upstream writes a button, the look spread
// on `nsh/base`'s Button. The render check requires the two to draw the same pixels.
import { mount, signal, Text } from "nsh";
import { Button } from "nsh/base";

import {
  type ButtonKind,
  buttonLabel,
  buttonLook,
  type ButtonLookOptions,
  type ButtonSize,
} from "../ui/button";
import { DemoCard, DemoPage, DemoSection } from "./kit";

function Plain(props: {
  label: string;
  kind?: ButtonKind;
  size?: ButtonSize;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const kind = () => props.kind ?? "secondary";
  const options: ButtonLookOptions = {
    size: () => props.size,
    selected: () => props.selected,
    disabled: () => props.disabled,
  };
  return (
    <Button
      onPress={props.onPress}
      selected={props.selected}
      disabled={props.disabled}
      {...buttonLook(kind, options)}
    >
      <Text style={buttonLabel(kind, options)}>{props.label}</Text>
    </Button>
  );
}

function App() {
  const presses = signal(0);
  const pinned = signal(true);
  const press = () => presses.update((n) => n + 1);

  return (
    <DemoPage title="Button" note={() => `Pressed ${presses()}× · pinned ${String(pinned())}`}>
      <DemoCard>
        <DemoSection title="Kinds">
          <Plain label="Primary" kind="primary" onPress={press} />
          <Plain label="Secondary" onPress={press} />
          <Plain label="Ghost" kind="ghost" onPress={press} />
          <Plain label="Delete" kind="danger" onPress={press} />
        </DemoSection>
        <DemoSection title="Sizes">
          <Plain label="Small" size="small" onPress={press} />
          <Plain label="Regular" onPress={press} />
          <Plain label="Large" size="large" onPress={press} />
        </DemoSection>
        <DemoSection title="States">
          <Plain label="Pinned" selected={pinned()} onPress={() => pinned.set(!pinned())} />
          <Plain label="Save" kind="primary" onPress={press} />
          <Plain label="Disabled" kind="primary" disabled />
          <Plain label="Disabled" disabled />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
