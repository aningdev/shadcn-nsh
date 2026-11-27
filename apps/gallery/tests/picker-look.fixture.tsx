import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Picker } from "../../../packages/ui";

// A picker's trigger, and a button that turns it off: the dimming is the trigger's own
// `disabledStyle`, not an opacity computed beside the component.
function App() {
  const off = signal(false);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Picker title="Pick one" open={false} disabled={off()} accessibilityLabel="Trigger" />
      <BaseButton onPress={() => off.set(!off())}>
        <Text>Turn it off</Text>
      </BaseButton>
      <Text>{`off=${off()}`}</Text>
    </View>
  );
}

mount(App);
