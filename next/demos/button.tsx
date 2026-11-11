import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Button } from "../ui/button";

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
  const presses = signal(0);
  const pinned = signal(true);
  const saving = signal(false);
  const press = () => presses.update((n) => n + 1);
  const save = () => {
    saving.set(true);
    setTimeout(() => saving.set(false), 1200);
  };

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
          <Button variant="primary" onPress={press}>
            Primary
          </Button>
          <Button variant="secondary" onPress={press}>
            Secondary
          </Button>
          <Button variant="ghost" onPress={press}>
            Ghost
          </Button>
          <Button variant="danger" onPress={press}>
            Delete
          </Button>
        </Section>
        <Section title="Sizes">
          <Button variant="secondary" size="small" onPress={press}>
            Small
          </Button>
          <Button variant="secondary" onPress={press}>
            Regular
          </Button>
          <Button variant="secondary" size="large" onPress={press}>
            Large
          </Button>
        </Section>
        <Section title="States">
          <Button variant="secondary" selected={pinned()} onPress={() => pinned.set(!pinned())}>
            Pinned
          </Button>
          <Button variant="primary" busy={saving()} onPress={save}>
            Save
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </Section>
      </View>
      <Text style={{ fontSize: 13, color: colors.muted }}>
        Pressed {presses()}× · pinned {String(pinned())}
      </Text>
    </View>
  );
}

mount(App);
