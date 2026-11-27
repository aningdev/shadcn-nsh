import { control, hitTarget } from "@shadcn-nsh/theme";
import { mount, platform, Text, View } from "nsh";

import {
  buttonLook,
  dialogText,
  dialogTitle,
  menuItemSize,
  popoverLook,
  Switch,
  toggleLook,
} from "../../../packages/ui";

/** Knob travel a switch's thumb class is built from: the track less the knob and the gap at both ends. */
function travel(small = false) {
  const look = control("switch");
  const width = small ? look.smallWidth : look.width;
  const height = small ? look.smallHeight : look.height;
  const knob = small ? look.knobSmallWidth : look.knobWidth;
  const knobHeight = small ? look.knobSmallHeight : look.knobHeight;
  const inset = Math.max(0, (height - knobHeight) / 2 - look.edgeOff);
  return width - 2 * (look.edgeOff + inset) - knob;
}

/** The hit slop of a switch that stands alone, from the theme's track and its hit target. */
function slop() {
  const look = control("switch");
  const hit = hitTarget();
  if (hit <= 0) return undefined;
  const v = Math.max(0, (hit - look.height) / 2);
  const h = Math.max(0, (hit - look.width) / 2);
  return { top: v, bottom: v, left: h, right: h };
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
      <Text>{`travel=${travel()}|${travel(true)}`}</Text>
      <Text>{`slop=${JSON.stringify(slop())}`}</Text>
      <Text>{`track=${control("switch").width}x${control("switch").height}|${control("switch").smallWidth}x${control("switch").smallHeight}`}</Text>
      <Switch accessibilityLabel="Track" />
      <Switch accessibilityLabel="Small track" size="sm" />
      <Text>{`overlay=${pop.padding}|${title.fontSize}|${body.fontSize}|${body.lineHeight}`}</Text>
      <Text>{`menu=${row.height}|${row.font}|${row.note}|${row.icon}`}</Text>
    </View>
  );
}

mount(App);
