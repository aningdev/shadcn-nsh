import { mount, signal, Text, View } from "nsh";

import { Button, TITLE_BAR_HEIGHT, TitleBar, WindowControls } from "../../../packages/ui";

/**
 * A hidden title bar's bar with the app's own button in it, and both kinds of window buttons in
 * bars of their own: a press in the drag region must still land, and each kind names its buttons.
 */
function App() {
  const pressed = signal(0);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <TitleBar testID="bar">
        <Text style={{ flex: 1 }}>Time sheet.nsh</Text>
        <Button onPress={() => pressed.update((n) => n + 1)}>Save</Button>
      </TitleBar>
      <View
        testID="lights"
        style={{
          height: TITLE_BAR_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          paddingStart: 12,
        }}
      >
        <WindowControls />
      </View>
      <View
        testID="caption"
        style={{
          height: TITLE_BAR_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          paddingStart: 12,
        }}
      >
        <WindowControls variant="caption" />
      </View>
      <Text testID="count">{`pressed=${pressed()}`}</Text>
    </View>
  );
}

mount(App);
