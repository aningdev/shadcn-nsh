// The reference of `kbd.tsx`. `kbdLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// A key has no official example here, so this page is the library's own: the modifier keys of a
// shortcut as caps of their own, a shortcut inside a sentence, and keys beside a button's label.
import { mount, Text, View } from "nsh";

import { Button, buttonLabel } from "@/packages/ui/button";
import { Kbd, KbdGroup } from "@/packages/ui/kbd";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

function App() {
  return (
    <DemoPage title="Kbd">
      <Text style={{ color: ui().muted }}>
        {"A cap for the key a shortcut takes: small type, the muted fill, a hairline edge."}
      </Text>

      <DemoCard>
        <DemoSection title="Modifiers">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>⌥</Kbd>
            <Kbd>⌃</Kbd>
          </KbdGroup>
        </DemoSection>

        <DemoSection title="In a sentence" axis="block">
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <Text style={{ fontSize: 13, color: ui().muted }}>Press</Text>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>B</Kbd>
            </KbdGroup>
            <Text style={{ fontSize: 13, color: ui().muted }}>to open the sidebar, and</Text>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            <Text style={{ fontSize: 13, color: ui().muted }}>for the command palette.</Text>
          </View>
        </DemoSection>

        <DemoSection title="Beside a label">
          <Button variant="secondary">
            <Text style={buttonLabel("secondary")}>Search</Text>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Button>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
