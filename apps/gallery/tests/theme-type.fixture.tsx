import { currentTheme, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Badge, Button, Label } from "../../../packages/ui";

const { typography } = nshGallery.semantics;

/** A temporary theme with another type scale: a larger, bolder label and a larger body. */
const scaled: AppTheme = {
  ...nshGallery,
  id: "scaled",
  label: "Scaled",
  semantics: {
    ...nshGallery.semantics,
    typography: {
      ...typography,
      label: {
        ...typography.label,
        fontWeight: 700,
      },
      body: {
        ...typography.body,
        letterSpacing: 0.5,
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
