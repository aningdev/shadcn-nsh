import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { fieldFamilyLook } from "../../../packages/ui";

/** The look taken once, as a page keeps it in a `const`: its parts still read the scheme. */
const look = fieldFamilyLook();

function App() {
  return (
    <View>
      <Text style={look.title}>Title</Text>
      <Text style={look.labelInRow}>In a row</Text>
      <Text testID="ink">{`ink:${colors.foreground}`}</Text>
    </View>
  );
}

mount(App);
