import { Text, View, mount, signal } from "nsh";
import { ColorPicker, ColorSwatch } from "nsh/base";

import { ColorPanel, DiffView, Editor, TextView, fieldLook } from "../../../packages/ui";

function App() {
  const color = signal("none");
  const blocked = signal("none");
  const source = signal("let n = 1");
  const focus = signal("none");
  const locked = signal("keep");
  const link = signal("none");
  const stats = signal("none");
  const fill = signal("#336699ff");
  const fieldClass = fieldLook().class;
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text>{`motion=${fieldClass}`}</Text>
      <ColorPicker
        value={fill()}
        onChange={({ value, formatted }) => {
          fill.set(value);
          color.set(formatted);
        }}
      >
        <View accessibilityLabel="Plane" style={{ gap: 8 }}>
          <ColorPanel
            name="Fill"
            value={fill()}
            format="hex"
            onFormatChange={() => {}}
            swatches={["#ff0000", "#00ff00", "#0000ff"]}
          />
        </View>
      </ColorPicker>
      <Text>{`color=${color()}`}</Text>

      <ColorPicker disabled value="#336699" onChange={() => blocked.set("changed")}>
        <ColorSwatch color="#00ff00" />
      </ColorPicker>
      <Text>{`blocked=${blocked()}`}</Text>

      <Editor
        testID="source"
        accessibilityLabel="Source"
        value={source()}
        onChange={(event) => source.set(event.value)}
        onFocus={() => focus.set("editor")}
        style={{ width: 260, height: 64 }}
      />
      <Text>{`source=${source()}`}</Text>
      <Text>{`focus=${focus()}`}</Text>

      <Editor
        testID="locked"
        accessibilityLabel="Locked source"
        readOnly
        value="keep"
        onChange={(event) => locked.set(event.value)}
        style={{ width: 260, height: 48 }}
      />
      <Text>{`locked=${locked()}`}</Text>

      <TextView
        markdown="Read the [guide](https://example.com/guide) now."
        onLinkPress={(event) => link.set(event.url)}
      />
      <Text>{`link=${link()}`}</Text>

      <DiffView
        layout="unified"
        oldValue={"alpha\nbeta"}
        newValue={"alpha\ngamma"}
        style={{ width: 260, height: 100 }}
        onStatsChange={(event) => stats.set(`${event.stats.added}:${event.stats.deleted}`)}
      />
      <Text>{`stats=${stats()}`}</Text>
    </View>
  );
}

mount(App);
