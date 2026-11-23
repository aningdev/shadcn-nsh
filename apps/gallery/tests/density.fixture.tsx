import { mount, platform, Text, View } from "nsh";

import {
  buttonLook,
  dialogText,
  dialogTitle,
  menuItemSize,
  popoverLook,
  type SwitchSize,
  switchHitSlop,
  switchLook,
  toggleLook,
} from "../../../packages/ui";

/** How far a size's knob travels: the translate its own thumb classes give it. */
function travel(size?: SwitchSize) {
  const classes = switchLook(() => true, size).thumbClass;
  return /checked:translate-x-\[(\d+)px\]/.exec(classes)?.[1];
}

function App() {
  const button = buttonLook("secondary");
  const toggle = toggleLook();
  const pop = popoverLook();
  const title = dialogTitle();
  const body = dialogText();
  const row = menuItemSize;
  return (
    <View>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`button=${button.style.height}|${button.hitSlop ?? "undefined"}`}</Text>
      <Text>{`toggle=${toggle.style.height}|${toggle.hitSlop ?? "undefined"}`}</Text>
      <Text>{`travel=${travel()}|${travel("sm")}`}</Text>
      <Text>{`slop=${JSON.stringify(switchHitSlop())}`}</Text>
      <Text>{`overlay=${pop.padding}|${title.fontSize}|${body.fontSize}|${body.lineHeight}`}</Text>
      <Text>{`menu=${row.height}|${row.font}|${row.note}|${row.icon}`}</Text>
    </View>
  );
}

mount(App);
