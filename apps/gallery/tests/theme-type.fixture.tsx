import { currentTheme, defineTheme, selectTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Badge, Button, Label } from "../../../packages/ui";

/** A temporary theme with another type scale: a bolder label and a spaced-out body. */
const scaled = defineTheme({
  extends: nshGallery.spec,
  id: "scaled",
  label: "Scaled",
  metrics: {
    typography: {
      label: { fontWeight: 700 },
      body: { letterSpacing: 0.5 },
    },
  },
});

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
