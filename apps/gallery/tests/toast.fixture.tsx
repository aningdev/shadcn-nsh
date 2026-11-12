import { mount, Text, View } from "nsh";

import { Button, Toast, toastCloseLook, toastText, toastTitle } from "../../../packages/ui";

function closeSink() {
  const active = toastCloseLook().activeStyle;
  return active?.transform ? "sink" : "still";
}

function App() {
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>{`close=${closeSink()}`}</Text>
      <Toast title="Pinned" description="Stays" />
      <Toast>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={toastTitle()}>Hello</Text>
          <Text style={toastText()}>There</Text>
        </View>
        <View {...toastCloseLook()} accessibilityLabel="Dismiss">
          <Text style={{ fontSize: 14 }}>×</Text>
        </View>
      </Toast>
    </View>
  );
}

mount(App);
