import { currentTheme, font, selectTheme, shape, type AppTheme } from "@shadcn-nsh/theme";
import { mount, Text, token, View, type Tokens } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
import { Button, dialogCard } from "../../../packages/ui";

/**
 * Simulates a host override of `radius-dialog` and `font-sans` through `selectTheme` (which
 * calls `setTheme`): the semantic layer references `{radius-dialog}` and `{font-sans}`, so both
 * reach components on the next frame without editing `semantics.json` values directly.
 */
const hostOverridden: AppTheme = {
  ...defaultTheme,
  id: "host-overridden",
  label: "Host Overridden",
  theme: {
    ...defaultTheme.theme,
    cssVars: {
      ...defaultTheme.theme.cssVars,
      theme: {
        ...defaultTheme.theme.cssVars?.theme,
        "radius-dialog": "32px",
        "font-sans": "ui-rounded",
      },
    },
  },
  semantics: {
    ...defaultTheme.semantics,
    typography: {
      ...defaultTheme.semantics.typography,
      fontFamily: "{font-sans}",
    },
  },
};

function App() {
  return (
    <View>
      <Text testID="dialog-radius">{`dialog-radius:${dialogCard().borderRadius}`}</Text>
      <Text testID="shape-dialog">{`shape-dialog:${shape.dialog}`}</Text>
      <Text testID="font-family">{`font-family:${font.family() ?? "system"}`}</Text>
      <Text testID="font-token">{`font-token:${String(token("font-sans" as keyof Tokens) ?? "system")}`}</Text>
      <Text testID="sample">Sample</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(hostOverridden)}>Override</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
