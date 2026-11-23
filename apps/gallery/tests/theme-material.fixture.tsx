import { finish, platformMaterial, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
import { Button } from "../../../packages/ui";

const { finishes } = defaultTheme.semantics;

/** A temporary theme whose finishes ask for the platform's own materials, and for an elevation. */
const glassy: AppTheme = {
  ...defaultTheme,
  id: "glassy",
  label: "Glassy",
  semantics: {
    ...defaultTheme.semantics,
    finishes: {
      ...finishes,
      light: {
        ...finishes.light,
        glass: { ...finishes.light.glass, material: "glass" },
        overlay: { ...finishes.light.overlay, material: "glass" },
        raised: { ...finishes.light.raised, material: "acrylic", elevation: 6 },
      },
      dark: {
        ...finishes.dark,
        glass: { ...finishes.dark.glass, material: "acrylic" },
        overlay: { ...finishes.dark.overlay, material: null },
        raised: { ...finishes.dark.raised, material: null },
      },
    },
  },
};

const keys = (style: object) =>
  Object.keys(style)
    .filter((key) => key.startsWith("glass"))
    .join(",");

function App() {
  return (
    <View>
      <Text>{`glass=${keys(finish.glass)}`}</Text>
      <Text>{`glassEffect=${finish.glass.glassEffect ?? "none"}`}</Text>
      <Text>{`tint=${finish.glass.glassTintColor ?? "none"}`}</Text>
      <Text>{`menu=${keys(finish.overlay)}`}</Text>
      <Text>{`menuEffect=${finish.overlay.glassEffect ?? "none"}`}</Text>
      <Text>{`glassProps=${JSON.stringify(platformMaterial("glass"))}`}</Text>
      <Text>{`menuProps=${JSON.stringify(platformMaterial("overlay"))}`}</Text>
      <Text>{`raisedProps=${JSON.stringify(platformMaterial("raised"))}`}</Text>
      <Text>{`card=${keys(finish.card)}|${JSON.stringify(platformMaterial("card"))}`}</Text>
      {/* The view a component draws: the props on the view, the glass keys in its style. */}
      <View {...platformMaterial("overlay")} style={{ ...finish.overlay }}>
        <Text>panel</Text>
      </View>
      <Button onPress={() => selectTheme(glassy)}>Glassy</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
