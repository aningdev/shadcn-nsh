import { finish, platformMaterial, selectTheme } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { nativeTheme } from "../../../packages/theme/themes/native";
import { Button } from "../../../packages/ui";
import { PopIn } from "../../../packages/ui/lib/popup";

const glassKeys = (style: object) =>
  Object.keys(style)
    .filter((key) => key.startsWith("glass"))
    .join(",");

function App() {
  return (
    <View>
      <Text>{`native=${nativeTheme().id}`}</Text>
      <Text>{`menu=${glassKeys(finish.menu)}`}</Text>
      <Text>{`menuEffect=${finish.menu.glassEffect ?? "none"}`}</Text>
      <Text>{`glassEffect=${finish.glass.glassEffect ?? "none"}`}</Text>
      <Text>{`raisedEffect=${finish.raised.glassEffect ?? "none"}`}</Text>
      <Text>{`card=${glassKeys(finish.card)}|${JSON.stringify(platformMaterial("card"))}`}</Text>
      {/* What a popover draws: PopIn spreads platformMaterial("menu") and the menu finish's keys. */}
      <PopIn style={{ ...finish.menu }}>
        <Text>popover</Text>
      </PopIn>
      <Button onPress={() => selectTheme(nativeTheme())}>Native</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
