import { Text, mount, signal } from "nsh";
import { ColorPicker } from "nsh/base";

// Color picker, text, editor, diff — the shot is 390 wide: every box is 300.
import { colors } from "../../packages/theme";
import { CodeEditor, ColorPanel, DiffView, TextView } from "../../packages/ui";
import { Page, Panel } from "./demo-kit";

const box = { width: 300 };

function Caption(props: { children: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.mutedForeground, numberOfLines: 1 }}>
      {props.children}
    </Text>
  );
}

function RichPage() {
  const fill = signal("#2563ebff");
  return (
    <Page>
      <Panel title="Code editor">
        <Caption>Focus</Caption>
        <CodeEditor
          autoFocus
          accessibilityLabel="Source"
          language="ts"
          defaultValue={"const n = 1"}
          style={{ ...box, height: 64 }}
        />
        <Caption>Read only</Caption>
        <CodeEditor readOnly defaultValue="Read only" style={{ ...box, height: 48 }} />
      </Panel>
      <Panel title="Color">
        <ColorPicker value={fill()} onChange={({ value }) => fill.set(value)}>
          <ColorPanel
            name="Fill"
            value={fill()}
            format="hex"
            onFormatChange={() => {}}
            swatches={["#1d4ed8", "#b91c1c", "#a16207", "#2563eb80"]}
          />
        </ColorPicker>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, numberOfLines: 1 }}>
          {() => fill()}
        </Text>
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
    </Page>
  );
}

mount(RichPage);
