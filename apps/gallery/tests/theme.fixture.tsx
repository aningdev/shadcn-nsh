import { mount, Text, View } from "nsh";

import { colors, finish } from "../../../packages/theme";

function App() {
  return (
    <View>
      <Text>{`raised=${finish.raised.backgroundColor}`}</Text>
      <Text>{`menu=${finish.overlay.borderColor}`}</Text>
      <Text>{`text=${colors.foreground}`}</Text>
      <Text>{`muted=${colors.mutedForeground}`}</Text>
      <Text>{`media=${colors.media}`}</Text>
      <Text>{`on-media=${colors.onMedia}`}</Text>
    </View>
  );
}

mount(App);
