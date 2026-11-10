import { colors, disabledOpacity, finish } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

function App() {
  return (
    <View>
      <Text>{`rest=${finish.control.rest}`}</Text>
      <Text>{`popup=${finish.popup}`}</Text>
      <Text>{`disabled=${disabledOpacity()}|${disabledOpacity(true)}|${disabledOpacity(false)}`}</Text>
      <Text>{`backdrop=${colors.backdrop}`}</Text>
    </View>
  );
}

mount(App);
