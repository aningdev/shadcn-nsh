// The reference of `input.tsx`: the same scene as upstream writes it, `inputLook` spread on
// `nsh/base`'s Input. The render check requires the two to draw the same pixels.
import type { InputRef, JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Button, Input } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { fieldText, inputLook } from "@/packages/ui/input";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { buttonStyle, desktop, Panel, Split, ui } from "./stage";

/** What the notes start with: long enough that their box is taller than the field's least. */
const NOTE =
  "Bring the signed copy on Friday, and the notebook from the drawer beside it so the two can be compared.";

/** A padding the look writes in points (it writes numbers). */
const room = (value: string | number | undefined) => (typeof value === "number" ? value : 0);

/** The room the look keeps inside the box: its two edges and the padding above and below. */
function fieldPad(): number {
  const text = fieldText({ multiline: true });
  return room(text.paddingTop) + room(text.paddingBottom) + 2;
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
  const notesContent = signal(0);
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
              {...inputLook()}
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
              {...inputLook()}
            />
          </Field>
          <Field label="Notes (multiline, as tall as its text)">
            <Input
              multiline
              value={notes()}
              onChange={({ value }) => notes.set(value)}
              placeholder="Anything else?"
              onContentSizeChange={({ size }) => notesContent.set(size.height)}
              {...inputLook({
                multiline: true,
                // The height rides in the look's own `style`: a second one over the spread is
                // lost when the theme switches and the box clips its text.
                style: () => ({
                  height: notesContent() === 0 ? undefined : notesContent() + fieldPad(),
                }),
              })}
            />
          </Field>
          <Button
            disabled={password().length === 0}
            onPress={signIn}
            {...buttonLook("default", {
              disabled: () => password().length === 0,
              style: buttonStyle({ marginTop: 4 }),
            })}
          >
            <Text style={buttonLabel("default", { disabled: () => password().length === 0 })}>
              Sign in
            </Text>
          </Button>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Ghost">
          <View style={{ gap: 10, flex: 1 }}>
            <Input
              placeholder="Search"
              accessibilityLabel="Search"
              {...inputLook({ variant: "ghost" })}
            />
            <Input
              value="Untitled note"
              onChange={({ value }) => notes.set(value)}
              accessibilityLabel="Title"
              {...inputLook({ variant: "ghost", style: { fontSize: 17, fontWeight: "600" } })}
            />
            <Input value="For comparison" accessibilityLabel="For comparison" {...inputLook()} />
          </View>
        </DemoSection>
      </DemoCard>

      <DemoCard>
        <DemoSection title="States">
          <View style={{ gap: 10, flex: 1 }}>
            <Input
              value="Read only"
              readonly
              accessibilityLabel="Read only"
              {...inputLook({ readonly: true })}
            />
            <Input value="Invalid" accessibilityLabel="Invalid" {...inputLook({ invalid: true })} />
            <Input
              value="Disabled"
              disabled
              accessibilityLabel="Disabled"
              {...inputLook({ disabled: true })}
            />
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
              {...inputLook({ multiline: true, readonly: true, style: { height: 64 } })}
            />
            <Input
              multiline
              value="This comment is archived."
              accessibilityLabel="Invalid"
              {...inputLook({ multiline: true, invalid: true, style: { height: 64 } })}
            />
            <Input
              multiline
              value="The thread is locked; the note stays for the record."
              disabled
              accessibilityLabel="Disabled"
              {...inputLook({ multiline: true, disabled: true, style: { height: 64 } })}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
