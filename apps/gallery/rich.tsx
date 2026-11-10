// Color picker, text, editor, diff and a stack. The shot is 390 wide: every box is 300.
import { colors } from "@shadcn-nsh/theme";
import {
  Button,
  ColorArea,
  ColorEyeDropper,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  DiffView,
  Editor,
  NavHeader,
  NavPage,
  NavStack,
  TextView,
  createNavStack,
} from "@shadcn-nsh/ui";
import { Text, View, mount } from "nsh";

import { Page, Panel } from "./demo-kit";

const box = { width: 300 };
const nav = createNavStack<string>(["Inbox"]);

function Caption(props: { children: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.mutedForeground, numberOfLines: 1 }}>
      {props.children}
    </Text>
  );
}

function RichPage() {
  const route = nav.routes()[nav.routes().length - 1] ?? "Inbox";
  return (
    <Page>
      <Panel title="Editor">
        <Caption>Focus</Caption>
        <Editor
          autoFocus
          accessibilityLabel="Source"
          language="ts"
          defaultValue={"const n = 1"}
          style={{ ...box, height: 64 }}
        />
        <Caption>Read only</Caption>
        <Editor readOnly defaultValue="Read only" style={{ ...box, height: 48 }} />
      </Panel>
      <Panel title="Color">
        <ColorPicker defaultValue="#2563eb" style={box}>
          <ColorArea accessibilityLabel="Saturation" style={{ width: 300, height: 64 }} />
          <ColorSlider accessibilityLabel="Hue" channel="hue" style={box} />
          <ColorSlider accessibilityLabel="Alpha" channel="alpha" style={box} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ColorField accessibilityLabel="Hex" style={{ width: 120 }} />
            <ColorSwatch accessibilityLabel="Current" />
            <ColorEyeDropper accessibilityLabel="Pick">
              <Text style={{ fontSize: 13, color: colors.foreground, numberOfLines: 1 }}>Pick</Text>
            </ColorEyeDropper>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <ColorSwatch color="#1d4ed8" accessibilityLabel="Blue" />
            <ColorSwatch color="#b91c1c" accessibilityLabel="Red" />
            <ColorSwatch color="#a16207" accessibilityLabel="Amber" />
            <ColorSwatch color="#2563eb80" accessibilityLabel="Glass" />
          </View>
        </ColorPicker>
        <Caption>Disabled</Caption>
        <ColorPicker disabled defaultValue="#2563eb">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ColorField accessibilityLabel="Locked hex" style={{ width: 120 }} />
            <ColorSwatch color="#b91c1c" accessibilityLabel="Locked" />
          </View>
        </ColorPicker>
      </Panel>
      <Panel title="Text">
        <TextView
          style={box}
          markdown={"A [guide](https://example.com) and `code`.\n\n> [!WARNING]\n> Careful"}
        />
      </Panel>
      <Panel title="Diff">
        <DiffView
          layout="unified"
          oldValue={"alpha\nbeta"}
          newValue={"alpha\ngamma"}
          style={{ ...box, height: 96 }}
        />
      </Panel>
      <Panel title="Stack">
        <View style={{ ...box, height: 132 }}>
          <NavStack state={nav}>
            {(page) => (
              <NavPage
                title={page}
                header={
                  <NavHeader
                    title={page}
                    onBack={nav.routes().length > 1 ? () => nav.pop() : undefined}
                  />
                }
              >
                <View style={{ padding: 12, gap: 8 }}>
                  <Text style={{ fontSize: 13, color: colors.foreground, numberOfLines: 1 }}>
                    {page}
                  </Text>
                  {page === "Inbox" ? (
                    <Button size="sm" onPress={() => nav.push("Note")}>
                      Open
                    </Button>
                  ) : null}
                </View>
              </NavPage>
            )}
          </NavStack>
        </View>
        <Caption>{route}</Caption>
      </Panel>
    </Page>
  );
}

mount(RichPage);
