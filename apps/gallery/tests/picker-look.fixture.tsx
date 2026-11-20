import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { pickerLook } from "../../../packages/ui";

// A picker's trigger as `pickerLook` spreads it, and a button that turns it off:
// the dimming is the trigger's own `disabledStyle`, not an `opacity` the look computes.
function App() {
  const off = signal(false);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <View accessibilityLabel="Trigger" disabled={off()} {...pickerLook()}>
        <Text>Pick one</Text>
      </View>
      <BaseButton onPress={() => off.set(!off())}>
        <Text>Turn it off</Text>
      </BaseButton>
      <Text>{`off=${off()}`}</Text>
    </View>
  );
}

mount(App);
