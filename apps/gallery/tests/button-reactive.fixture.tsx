import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Button } from "../../../packages/ui";

function App() {
  const variant = signal<"secondary" | "destructive">("secondary");
  return (
    <View>
      <Button variant={variant()}>Target</Button>
      <BaseButton onPress={() => variant.set("destructive")}>
        <Text>Flip</Text>
      </BaseButton>
    </View>
  );
}

mount(App);
