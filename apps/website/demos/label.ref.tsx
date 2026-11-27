// The reference of `label.tsx`. `labelLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// A label has no official example of its own, so this page is the library's own: shadcn's pair of
// a checkbox and its label, a caption over a group of choices, and the pair with the choice off.
// The label is text: it does not press the control beside it (a row that does is `listRow`).
import { mount, signal, Text, View } from "nsh";

import { Checkbox } from "@/packages/ui/checkbox";
import { Label } from "@/packages/ui/label";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

function App() {
  const terms = signal(true);
  const comments = signal(true);
  const mentions = signal(false);
  return (
    <DemoPage title="Label">
      <Text style={{ color: ui().muted }}>
        {"The visible name of a control: it names nothing for a screen reader by itself."}
      </Text>

      <DemoCard>
        <DemoSection title="Beside a choice">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Checkbox
              accessibilityLabel="Accept terms and conditions"
              checked={terms()}
              onChange={({ checked }) => terms.set(checked)}
            />
            <Label>Accept terms and conditions</Label>
          </View>
        </DemoSection>

        <DemoSection title="Over a group" axis="block">
          <View style={{ gap: 10 }}>
            <Label>Notify me about</Label>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Checkbox
                accessibilityLabel="Comments"
                checked={comments()}
                onChange={({ checked }) => comments.set(checked)}
              />
              <Label>Comments on my posts</Label>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Checkbox
                accessibilityLabel="Mentions"
                checked={mentions()}
                onChange={({ checked }) => mentions.set(checked)}
              />
              <Label>Mentions of my name</Label>
            </View>
          </View>
        </DemoSection>

        <DemoSection title="With the control off" axis="block">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Checkbox disabled accessibilityLabel="Weekly digest" />
            <Label disabled>Weekly digest</Label>
          </View>
          <Text style={{ fontSize: 12, color: ui().muted }}>
            A disabled label dims to half, as it does in shadcn where a disabled peer dims it: set
            `disabled` on both, since nsh has no sibling selector to read the control's state.
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
