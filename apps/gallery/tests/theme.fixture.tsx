import { mount, Text, View } from "nsh";

import { colors, finish } from "../../../packages/theme";

function App() {
  return (
    <View>
      <Text>{`raised=${finish.raised.backgroundColor}`}</Text>
      <Text>{`menu=${finish.menu.borderColor}`}</Text>
      <Text>{`text=${colors.foreground}`}</Text>
      <Text>{`muted=${colors.mutedForeground}`}</Text>
      <Text>{`on-media=${colors.onMedia}`}</Text>
      <Text>{`chart-ink=${colors.chartForeground}`}</Text>
    </View>
  );
}

mount(App);
