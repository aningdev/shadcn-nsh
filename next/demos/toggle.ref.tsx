// The reference of `toggle.tsx`: the same page as upstream writes a toggle, the look spread
// on `nsh/base`'s Toggle. The render check requires the two to draw the same pixels.
import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Toggle } from "nsh/base";

import { toggleLabel, toggleLook, type ToggleLookOptions, type ToggleSize } from "../ui/toggle";

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
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Toggle</Text>
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
        <Section title="Variant">
          <Plain label="Ghost" pressed={bold()} onChange={({ pressed }) => bold.set(pressed)} />
          <Plain
            label="Outline"
            variant="outline"
            pressed={starred()}
            onChange={({ pressed }) => starred.set(pressed)}
          />
        </Section>
        <Section title="Size">
          <Plain label="Small" size="small" pressed />
          <Plain label="Regular" pressed />
          <Plain label="Large" size="large" pressed />
        </Section>
        <Section title="States">
          <Plain label="On" pressed={bold()} onChange={({ pressed }) => bold.set(pressed)} />
          <Plain label="Off" />
          <Plain label="Disabled" pressed disabled />
          <Plain label="Disabled" disabled />
        </Section>
      </View>
      <Text style={{ fontSize: 13, color: colors.muted }}>
        bold {String(bold())} · starred {String(starred())}
      </Text>
    </View>
  );
}

mount(App);
