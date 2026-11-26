import { defineTheme, selectTheme, surface } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Button } from "../../../packages/ui";

/** A temporary theme whose surfaces ask for the platform's own materials, and for an elevation. */
const glassy = defineTheme({
  extends: nshGallery.spec,
  id: "glassy",
  label: "Glassy",
  surfaces: {
    glass: { light: { material: "glass" }, dark: { material: "acrylic" } },
    overlay: { light: { material: "glass", elevation: 6 }, dark: { material: null } },
    raised: { light: { material: "acrylic" }, dark: { material: null } },
  },
});

const keys = (style: object) =>
  Object.keys(style)
    .filter((key) => key.startsWith("glass"))
    .join(",");

function App() {
  return (
    <View>
      <Text>{`glass=${keys(surface("glass").style)}`}</Text>
      <Text>{`glassEffect=${surface("glass").style.glassEffect ?? "none"}`}</Text>
      <Text>{`tint=${surface("glass").style.glassTintColor ?? "none"}`}</Text>
      <Text>{`menu=${keys(surface("overlay").style)}`}</Text>
      <Text>{`menuEffect=${surface("overlay").style.glassEffect ?? "none"}`}</Text>
      <Text>{`glassProps=${JSON.stringify(surface("glass").platformProps)}`}</Text>
      <Text>{`menuProps=${JSON.stringify(surface("overlay").platformProps)}`}</Text>
      <Text>{`raisedProps=${JSON.stringify(surface("raised").platformProps)}`}</Text>
      <Text>{`card=${keys(surface("card").style)}|${JSON.stringify(surface("card").platformProps)}`}</Text>
      {/* The view a component draws: the props on the view, the glass keys in its style. */}
      <View {...surface("overlay").platformProps} style={{ ...surface("overlay").style }}>
        <Text>panel</Text>
      </View>
      <Button onPress={() => selectTheme(glassy)}>Glassy</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
