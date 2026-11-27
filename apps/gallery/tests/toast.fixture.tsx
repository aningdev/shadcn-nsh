import { mount, Text, View } from "nsh";

import { Toast, pressSink } from "../../../packages/ui";

function closeSink() {
  // The close control's pressed transform is `pressSink(0.9)`; reduced motion sinks nothing.
  const active = pressSink(0.9).activeStyle;
  return active?.transform ? "sink" : "still";
}

function App() {
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>{`close=${closeSink()}`}</Text>
      <Toast title="Pinned" description="Stays" />
      <Toast>
        <View style={{ flex: 1, gap: 2 }}>
          <Text>Hello</Text>
          <Text>There</Text>
        </View>
      </Toast>
    </View>
  );
}

mount(App);
