// The reference of `input.tsx`. `inputLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
import { alpha } from "@shadcn-nsh/theme";
import { Check } from "lucide";
import type { InputRef, JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { buttonStyle, desktop, Panel, Split, ui } from "./stage";

/** What the notes start with: long enough that their box is taller than the field's least. */
const NOTE =
  "Bring the signed copy on Friday, and the notebook from the drawer beside it so the two can be compared.";

/** What a password is asked for, and how it is scored: one point per rule it meets. */
const PASSWORD_RULES = [
  { label: "8 or more characters", test: (value: string) => value.length >= 8 },
  {
    label: "Upper and lower case",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: "A number", test: (value: string) => /\d/.test(value) },
  { label: "A symbol", test: (value: string) => /[^\w\s]/.test(value) },
];
const STRENGTH_WORDS = ["Empty", "Weak", "Fair", "Good", "Strong"];

/** A password's score: nothing typed is nothing met. */
function strength(value: string): number {
  return value === "" ? 0 : PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}

/**
 * Four segments that fill as the password takes on what it needs, the word for how far it got, and
 * the rules beneath, each a dot until it is met and then a tick in the tone that says it is.
 */
function Strength(props: { value: string }) {
  const score = () => strength(props.value);
  const tone = () => [ui().faint, ui().danger, ui().warn, ui().info, ui().up][score()];
  return (
    <View style={{ gap: 8, paddingTop: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
          <Each of={[0, 1, 2, 3]}>
            {(step) => (
              <View
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: step() < score() ? tone() : alpha(ui().text, 0.1),
                }}
              />
            )}
          </Each>
        </View>
        <Text
          style={{
            width: 52,
            textAlign: "right",
            fontSize: 13,
            fontWeight: "500",
            color: tone(),
          }}
        >
          {STRENGTH_WORDS[score()]}
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 6 }}>
        <Each of={PASSWORD_RULES}>
          {(rule) => {
            const met = rule().test(props.value);
            return (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, minWidth: 140 }}>
                {met ? (
                  <Icon icon={Check} size={12} tint={ui().up} />
                ) : (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: ui().faint,
                      marginHorizontal: 4,
                    }}
                  />
                )}
                <Text style={{ fontSize: 12, color: met ? ui().text : ui().muted }}>
                  {rule().label}
                </Text>
              </View>
            );
          }}
        </Each>
      </View>
    </View>
  );
}

/** A label above its field, and what describes it below. */
function Field(props: { label: string; children: JSX.Element; after?: JSX.Element }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, color: ui().muted }}>{props.label}</Text>
      {props.children}
      {props.after}
    </View>
  );
}

function App() {
  const name = signal("");
  const password = signal("");
  const notes = signal(NOTE);
  const submitted = signal("");
  let passwordInput!: InputRef;
  const signIn = () => submitted.set(`Signed in as ${name() || "nobody"}`);

  return (
    <DemoPage title="Input">
      <Text style={{ color: ui().muted }}>
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
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`name ${name() ? `“${name()}”` : "—"}`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`password ${password().length} characters`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`notes ${notes().length} characters`}
              </Text>
            </Panel>
            <Panel title="onSubmit" grow>
              <Text style={{ fontSize: 13, color: ui().accent }}>{submitted()}</Text>
            </Panel>
          </>
        }
      >
        <View style={{ gap: 16 }}>
          <Field
            label="Name (controlled, maxLength 20)"
            after={
              <Text style={{ fontSize: 12, color: ui().muted }}>{`${name().length} / 20`}</Text>
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
          <Field label="Password" after={<Strength value={password()} />}>
            <Input
              ref={passwordInput}
              value={password()}
              onChange={({ value }) => password.set(value)}
              masked
              returnKeyType="done"
              onSubmit={signIn}
            />
          </Field>
          <Field label="Notes (multiline, as tall as its text)">
            <Input
              multiline
              grow
              value={notes()}
              onChange={({ value }) => notes.set(value)}
              placeholder="Anything else?"
            />
          </Field>
          <Button
            variant="default"
            disabled={password().length === 0}
            onPress={signIn}
            style={buttonStyle({ marginTop: 4 })}
          >
            Sign in
          </Button>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Ghost">
          <View style={{ gap: 10, flex: 1 }}>
            <Input variant="ghost" placeholder="Search" accessibilityLabel="Search" />
            <Input
              variant="ghost"
              value="Untitled note"
              onChange={({ value }) => notes.set(value)}
              accessibilityLabel="Title"
              style={{ fontSize: 17, fontWeight: "600" }}
            />
            <Input variant="default" value="For comparison" accessibilityLabel="For comparison" />
          </View>
        </DemoSection>
      </DemoCard>

      <DemoCard>
        <DemoSection title="States">
          <View style={{ gap: 10, flex: 1 }}>
            <Input value="Read only" readonly accessibilityLabel="Read only" />
            <Input value="Invalid" invalid accessibilityLabel="Invalid" />
            <Input value="Disabled" disabled accessibilityLabel="Disabled" />
          </View>
        </DemoSection>
      </DemoCard>

      <DemoCard>
        <DemoSection title="Multiline states">
          <View style={{ gap: 10, flex: 1 }}>
            <Input
              multiline
              value="Reviewed by the design team on 12 March."
              readonly
              accessibilityLabel="Read only"
              style={{ height: 64 }}
            />
            <Input
              multiline
              value="This comment is archived."
              invalid
              accessibilityLabel="Invalid"
              style={{ height: 64 }}
            />
            <Input
              multiline
              value="The thread is locked; the note stays for the record."
              disabled
              accessibilityLabel="Disabled"
              style={{ height: 64 }}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
