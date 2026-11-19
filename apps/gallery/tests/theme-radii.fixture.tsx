import { currentTheme, selectTheme } from "@shadcn-nsh/theme";
import { mount, Text, token, View } from "nsh";

import { solidGlass } from "../../../packages/theme/themes/solid-glass/index";
import { Button, buttonLook, numberInputClasses } from "../../../packages/ui";

function App() {
  return (
    <View>
      <Text testID="token">{`token:${token("radius-control")}`}</Text>
      <Text testID="class">{`class:${numberInputClasses.frame}`}</Text>
      <Text testID="style">{`style:${buttonLook("secondary").style.borderRadius}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(solidGlass)}>Solid Glass</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
