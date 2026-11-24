import { currentTheme, selectTheme, shape, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Button, dialogCard } from "../../../packages/ui";

/**
 * Simulates a host override of `radius-modal` through `selectTheme` (which calls `setTheme`):
 * the semantic layer references `{radius-modal}`, so the shape roles reach components on the
 * next frame without editing `semantics.json` values directly.
 */
const hostOverridden: AppTheme = {
  ...nshGallery,
  id: "host-overridden",
  label: "Host Overridden",
  theme: {
    ...nshGallery.theme,
    cssVars: {
      ...nshGallery.theme.cssVars,
      theme: {
        ...nshGallery.theme.cssVars?.theme,
        "radius-modal": "32px",
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
