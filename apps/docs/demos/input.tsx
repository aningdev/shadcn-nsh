import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Input } from "@/packages/ui/input";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const name = signal("Ada");
  const notes = signal("");

  return (
    <DemoPage title="Input" note={() => `${name()} · notes ${notes().length}`}>
      <DemoCard>
        <DemoSection title="Value">
          <View style={{ gap: 6, flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.muted }}>Name</Text>
            <Input
              value={name()}
              onChange={({ value }) => name.set(value)}
              placeholder="Ada Lovelace"
              maxLength={20}
            />
          </View>
        </DemoSection>
        <DemoSection title="Password">
          <Input placeholder="Password" masked />
        </DemoSection>
        <DemoSection title="Multiline">
          <Input
            multiline
            value={notes()}
            onChange={({ value }) => notes.set(value)}
            placeholder="Anything else?"
            style={{ height: 80 }}
          />
        </DemoSection>
        <DemoSection title="States">
          <Input value="Read only" readonly />
          <Input value="Invalid" invalid />
          <Input value="Disabled" disabled />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
