import { currentTheme, selectTheme, shape } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Button, dialogCard } from "../../../packages/ui";

/**
 * Simulates a host override of `radius-xl` through `selectTheme` (which calls `setTheme`):
 * the spec's `shape.modal` reads the compiled `theme.json`, so the corner reaches components on
 * the next frame without editing the theme's own tokens.
 */
const hostOverridden = {
  ...nshGallery,
  id: "host-overridden",
  label: "Host Overridden",
  theme: {
    ...nshGallery.theme,
    cssVars: {
      ...nshGallery.theme.cssVars,
      theme: {
        ...nshGallery.theme.cssVars?.theme,
        "radius-xl": "32px",
      },
    },
  },
};

function App() {
  return (
    <View>
      <Text testID="dialog-radius">{`dialog-radius:${dialogCard().borderRadius}`}</Text>
      <Text testID="shape-modal">{`shape-modal:${shape.modal}`}</Text>
      <Text testID="sample">Sample</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(hostOverridden)}>Override</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
