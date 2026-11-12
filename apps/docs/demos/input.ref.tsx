// The reference of `input.tsx`: the look spread on `nsh/base`'s Input, as upstream writes it.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Input } from "nsh/base";

import { inputLook } from "@/packages/ui/input";

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
              {...inputLook()}
            />
          </View>
        </DemoSection>
        <DemoSection title="Password">
          <Input placeholder="Password" masked {...inputLook()} />
        </DemoSection>
        <DemoSection title="Multiline">
          <Input
            multiline
            value={notes()}
            onChange={({ value }) => notes.set(value)}
            placeholder="Anything else?"
            {...inputLook({ multiline: true, style: { height: 80 } })}
          />
        </DemoSection>
        <DemoSection title="States">
          <Input value="Read only" readonly {...inputLook({ readonly: true })} />
          <Input value="Invalid" {...inputLook({ invalid: true })} />
          <Input value="Disabled" disabled {...inputLook({ disabled: true })} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
