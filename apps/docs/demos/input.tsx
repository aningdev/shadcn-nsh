// The official input scene (`references/nsh/website/demos/el-input.tsx`) with this library's
// parts: a name (controlled, 20 characters at most), a password (masked) the name's Return goes
// to, notes, and a sign-in button whose result the inspector shows. A second card lists the read
// only, the invalid and the disabled field.
import { colors } from "@shadcn-nsh/theme";
import type { InputRef, JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Panel, Split } from "./stage";

/** A label above its field, and what describes it below. */
function Field(props: { label: string; children: JSX.Element; after?: JSX.Element }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, color: colors.muted }}>{props.label}</Text>
      {props.children}
      {props.after}
    </View>
  );
}

function App() {
  const name = signal("");
  const password = signal("");
  const notes = signal("");
  const submitted = signal("");
  let passwordInput!: InputRef;
  const signIn = () => submitted.set(`Signed in as ${name() || "nobody"}`);

  return (
    <DemoPage title="Input">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Tab moves between the fields; Return in the name goes to the password"
          : "Tap a field to type; Return in the name goes to the password"}
      </Text>

      <Split
        width={340}
        gap={16}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: colors.text }}>
                {`name ${name() ? `“${name()}”` : "—"}`}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {`password ${password().length} characters`}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {`notes ${notes().length} characters`}
              </Text>
            </Panel>
            <Panel title="onSubmit" grow>
              <Text style={{ fontSize: 13, color: colors.accent }}>{submitted()}</Text>
            </Panel>
          </>
        }
      >
        <View style={{ gap: 16 }}>
          <Field
            label="Name (controlled, maxLength 20)"
            after={
              <Text style={{ fontSize: 12, color: colors.muted }}>{`${name().length} / 20`}</Text>
            }
          >
            <Input
              value={name()}
              onChange={({ value }) => name.set(value)}
              placeholder="Ada Lovelace"
              maxLength={20}
              returnKeyType="next"
              onSubmit={() => passwordInput.focus()}
            />
          </Field>
          <Field label="Password">
            <Input
              ref={passwordInput}
              value={password()}
              onChange={({ value }) => password.set(value)}
              masked
              returnKeyType="done"
              onSubmit={signIn}
            />
          </Field>
          <Field label="Notes (multiline)">
            <Input
              multiline
              value={notes()}
              onChange={({ value }) => notes.set(value)}
              placeholder="Anything else?"
              style={{ height: 80 }}
            />
          </Field>
          <Button
            variant="primary"
            disabled={password().length === 0}
            onPress={signIn}
            style={{ marginTop: 4 }}
          >
            Sign in
          </Button>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="States">
          <View style={{ gap: 10, flex: 1 }}>
            <Input value="Read only" readonly accessibilityLabel="Read only" />
            <Input value="Invalid" invalid accessibilityLabel="Invalid" />
            <Input value="Disabled" disabled accessibilityLabel="Disabled" />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
