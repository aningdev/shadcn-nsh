import { mount, platform, Text, View } from "nsh";

import {
  buttonLook,
  dialogText,
  dialogTitle,
  knobTravel,
  menuItemSize,
  popoverLook,
  switchGeometries,
  switchSlop,
  toggleLook,
} from "../../../packages/ui";

function App() {
  const button = buttonLook("secondary");
  const toggle = toggleLook();
  const small = switchGeometries.small;
  const regular = switchGeometries.regular;
  const pointer = switchGeometries.pointer;
  const pop = popoverLook();
  const title = dialogTitle();
  const body = dialogText();
  const row = menuItemSize;
  return (
    <View>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`button=${button.style.height}|${button.hitSlop ?? "undefined"}`}</Text>
      <Text>{`toggle=${toggle.style.height}|${toggle.hitSlop ?? "undefined"}`}</Text>
      <Text>{`travel=${knobTravel(pointer)}|${knobTravel(regular)}|${knobTravel(small)}`}</Text>
      <Text>{`slop=${JSON.stringify(switchSlop(regular))}`}</Text>
      <Text>{`overlay=${pop.padding}|${title.fontSize}|${body.fontSize}|${body.lineHeight}`}</Text>
      <Text>{`menu=${row.height}|${row.font}|${row.note}|${row.icon}`}</Text>
    </View>
  );
}

mount(App);
