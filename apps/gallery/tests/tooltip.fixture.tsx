import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Button, Tooltip } from "../../../packages/ui";

function App() {
  const off = signal(false);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Button variant="secondary" disabled={off()} tooltip={<Tooltip>Tip A</Tooltip>}>
        Hover A
      </Button>
      <Button variant="secondary" tooltip={<Tooltip>Tip B</Tooltip>}>
        Hover B
      </Button>
    </View>
  );
}

mount(App);
