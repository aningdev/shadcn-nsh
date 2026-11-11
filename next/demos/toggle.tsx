import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Toggle } from "../ui/toggle";

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
          <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
            Ghost
          </Toggle>
          <Toggle
            variant="outline"
            pressed={starred()}
            onChange={({ pressed }) => starred.set(pressed)}
          >
            Outline
          </Toggle>
        </Section>
        <Section title="Size">
          <Toggle size="small" pressed>
            Small
          </Toggle>
          <Toggle pressed>Regular</Toggle>
          <Toggle size="large" pressed>
            Large
          </Toggle>
        </Section>
        <Section title="States">
          <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
            On
          </Toggle>
          <Toggle>Off</Toggle>
          <Toggle disabled pressed>
            Disabled
          </Toggle>
          <Toggle disabled>Disabled</Toggle>
        </Section>
      </View>
      <Text style={{ fontSize: 13, color: colors.muted }}>
        bold {String(bold())} · starred {String(starred())}
      </Text>
    </View>
  );
}

mount(App);
