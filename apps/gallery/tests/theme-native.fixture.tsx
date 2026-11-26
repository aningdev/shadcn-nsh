import { selectTheme, surface } from "@shadcn-nsh/theme";
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
      <Text>{`menu=${glassKeys(surface("overlay").style)}`}</Text>
      <Text>{`menuEffect=${surface("overlay").style.glassEffect ?? "none"}`}</Text>
      <Text>{`glassEffect=${surface("glass").style.glassEffect ?? "none"}`}</Text>
      <Text>{`raisedEffect=${surface("raised").style.glassEffect ?? "none"}`}</Text>
      <Text>{`card=${glassKeys(surface("card").style)}|${JSON.stringify(surface("card").platformProps)}`}</Text>
      {/* What a popover draws: PopIn spreads surface("overlay").platformProps and the surface's style. */}
      <PopIn style={{ ...surface("overlay").style }}>
        <Text>popover</Text>
      </PopIn>
      <Button onPress={() => selectTheme(nativeTheme())}>Native</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
