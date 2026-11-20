import { currentTheme, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
import { Badge, Button, Label } from "../../../packages/ui";

const { type } = defaultTheme.finishes;

/** A temporary theme with another type scale: a larger, bolder label and a larger body. */
const scaled: AppTheme = {
  ...defaultTheme,
  id: "scaled",
  label: "Scaled",
  finishes: {
    ...defaultTheme.finishes,
    type: {
      ...type,
      label: {
        ...type.label,
        size: { pointer: 21, touch: 23 },
        weight: "700",
      },
      body: { ...type.body, size: { pointer: 19, touch: 21 }, line: { pointer: 25, touch: 27 } },
    },
  },
};

function App() {
  return (
    <View>
      <Label>Name</Label>
      <Badge>Tag</Badge>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(scaled)}>Scaled</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
