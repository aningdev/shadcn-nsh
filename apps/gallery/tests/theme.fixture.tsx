import { mount, Text, View } from "nsh";

import { colors, finish } from "../../../packages/theme";

function App() {
  return (
    <View>
      <Text>{`raised=${finish.raised.backgroundColor}`}</Text>
      <Text>{`menu=${finish.menu.borderColor}`}</Text>
      <Text>{`text=${colors.text}`}</Text>
      <Text>{`muted=${colors.muted}`}</Text>
    </View>
  );
}

mount(App);
