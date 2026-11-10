import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  DiffView,
  Editor,
  TextView,
  colorPickerVariants,
} from "@shadcn-nsh/ui";
import { Text, View, mount, signal } from "nsh";

function App() {
  const color = signal("none");
  const blocked = signal("none");
  const source = signal("let n = 1");
  const focus = signal("none");
  const locked = signal("keep");
  const link = signal("none");
  const stats = signal("none");
  const fieldClass = colorPickerVariants().field.className;
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text>{`motion=${fieldClass}`}</Text>
      <ColorPicker defaultValue="#336699" onChange={(event) => color.set(event.formatted)}>
        <ColorArea accessibilityLabel="Plane" style={{ width: 160, height: 64 }} />
        <ColorSlider accessibilityLabel="Hue" channel="hue" style={{ width: 220, height: 28 }} />
        <ColorSwatch color="#ff0000" accessibilityLabel="Red" />
        <ColorField testID="hex" accessibilityLabel="Hex" style={{ width: 120 }} />
      </ColorPicker>
      <Text>{`color=${color()}`}</Text>

      <ColorPicker disabled defaultValue="#336699" onChange={() => blocked.set("changed")}>
        <ColorSwatch color="#00ff00" accessibilityLabel="Locked" />
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
