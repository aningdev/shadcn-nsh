import { Button } from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const variant = signal<"default" | "destructive">("default");
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
