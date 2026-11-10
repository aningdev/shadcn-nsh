import {
  buttonVariants,
  knobTravel,
  switchGeometry,
  switchSlop,
  toggleVariants,
} from "@shadcn-nsh/ui";
import { mount, platform, Text, View } from "nsh";

function App() {
  const button = buttonVariants({ size: "default" });
  const toggle = toggleVariants({ size: "default" });
  const small = switchGeometry("sm", false);
  const regular = switchGeometry("default", false);
  const pointer = switchGeometry("default", true);
  return (
    <View>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`button=${button.style.minHeight}|${button.hitSlop}`}</Text>
      <Text>{`toggle=${toggle.style.minHeight}|${toggle.hitSlop}`}</Text>
      <Text>{`travel=${knobTravel(pointer)}|${knobTravel(regular)}|${knobTravel(small)}`}</Text>
      <Text>{`slop=${JSON.stringify(switchSlop(regular))}`}</Text>
    </View>
  );
}

mount(App);
