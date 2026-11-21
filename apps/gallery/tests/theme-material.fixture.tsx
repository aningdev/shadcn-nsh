import { finish, platformMaterial, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
import { Button } from "../../../packages/ui";

const { light, dark } = defaultTheme.finishes;

/** A temporary theme whose `glass` and `menu` finishes ask for the platform's own material. */
const glassy: AppTheme = {
  ...defaultTheme,
  id: "glassy",
  label: "Glassy",
  finishes: {
    ...defaultTheme.finishes,
    light: {
      ...light,
      glass: {
        ...light.glass,
        material: {
          apple: { glass: "regular", tint: "var(--primary)" },
          ios: { backdrop: "thin" },
          windows: { backdrop: "blur" },
        },
      },
      menu: {
        ...light.menu,
        material: {
          apple: { glass: "clear", tint: null },
          macos: { backdrop: "menu", blending: "behindWindow", state: "active" },
        },
      },
    },
    dark: {
      ...dark,
      glass: { ...dark.glass, material: { apple: { glass: "clear", tint: null } } },
      menu: { ...dark.menu, material: null },
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
      <Text>{`menu=${keys(finish.menu)}`}</Text>
      <Text>{`menuEffect=${finish.menu.glassEffect ?? "none"}`}</Text>
      <Text>{`glassProps=${JSON.stringify(platformMaterial("glass"))}`}</Text>
      <Text>{`menuProps=${JSON.stringify(platformMaterial("menu"))}`}</Text>
      <Text>{`card=${keys(finish.card)}|${JSON.stringify(platformMaterial("card"))}`}</Text>
      {/* The view a component draws: the props on the view, the glass keys in its style. */}
      <View {...platformMaterial("menu")} style={{ ...finish.menu }}>
        <Text>panel</Text>
      </View>
      <Button onPress={() => selectTheme(glassy)}>Glassy</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
