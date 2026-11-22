import { currentTheme, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
import { Badge, Button, Label } from "../../../packages/ui";

const { typography } = defaultTheme.semantics;

/** A temporary theme with another type scale: a larger, bolder label and a larger body. */
const scaled: AppTheme = {
  ...defaultTheme,
  id: "scaled",
  label: "Scaled",
  semantics: {
    ...defaultTheme.semantics,
    typography: {
      ...typography,
      label: {
        ...typography.label,
        fontSize: { pointer: 21, touch: 23 },
        fontWeight: 700,
      },
      body: {
        ...typography.body,
        fontSize: { pointer: 19, touch: 21 },
        lineHeight: { pointer: 25 / 19, touch: 27 / 21 },
      },
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
