import { mount, Text, View } from "nsh";

import { colors, surface } from "../../../packages/theme";

/** The value as the string NSH writes: a style's colour keeps `{ animated }` in its type. */
const css = (value: unknown) => value as string;

function App() {
  return (
    <View>
      <Text>{`raised=${css(surface("raised").style.backgroundColor)}`}</Text>
      <Text>{`menu=${css(surface("overlay").style.borderColor)}`}</Text>
      <Text>{`text=${colors.foreground}`}</Text>
      <Text>{`muted=${colors.mutedForeground}`}</Text>
      <Text>{`media=${colors.media}`}</Text>
      <Text>{`on-media=${colors.onMedia}`}</Text>
    </View>
  );
}

mount(App);
