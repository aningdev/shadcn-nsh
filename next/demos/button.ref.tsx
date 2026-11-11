// The reference of `button.tsx`: the same page as upstream writes a button, the look spread
// on `nsh/base`'s Button. The render check requires the two to draw the same pixels.
import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Button } from "nsh/base";

import {
  type ButtonKind,
  buttonLabel,
  buttonLook,
  type ButtonLookOptions,
  type ButtonSize,
} from "../ui/button";

function Section(props: { title: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 12, color: colors.muted }}>{props.title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {props.children}
      </View>
    </View>
  );
}

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
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Button</Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.card,
          padding: 16,
          gap: 16,
        }}
      >
        <Section title="Kinds">
          <Plain label="Primary" kind="primary" onPress={press} />
          <Plain label="Secondary" onPress={press} />
          <Plain label="Ghost" kind="ghost" onPress={press} />
          <Plain label="Delete" kind="danger" onPress={press} />
        </Section>
        <Section title="Sizes">
          <Plain label="Small" size="small" onPress={press} />
          <Plain label="Regular" onPress={press} />
          <Plain label="Large" size="large" onPress={press} />
        </Section>
        <Section title="States">
          <Plain label="Pinned" selected={pinned()} onPress={() => pinned.set(!pinned())} />
          <Plain label="Save" kind="primary" onPress={press} />
          <Plain label="Disabled" kind="primary" disabled />
          <Plain label="Disabled" disabled />
        </Section>
      </View>
      <Text style={{ fontSize: 13, color: colors.muted }}>
        Pressed {presses()}× · pinned {String(pinned())}
      </Text>
    </View>
  );
}

mount(App);
