import {
  checkboxGeometry,
  colors,
  currentTheme,
  EDGE_WIDTH,
  insetEdge,
  outerEdge,
  radioGeometry,
  selectTheme,
  sliderGeometry,
  switchGeometry,
  tints,
} from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import materialTheme from "../../../packages/theme/themes/material/index";
import winuiTheme from "../../../packages/theme/themes/winui/index";
import { Button } from "../../../packages/ui";

function App() {
  return (
    <View>
      <Text>{`switch=${switchGeometry().width}x${switchGeometry().height}|${switchGeometry().border}/${switchGeometry()["on-border"]}|${switchGeometry().knob}/${switchGeometry()["on-knob"]}|${switchGeometry()["knob-feedback"]}`}</Text>
      <Text>{`slider=${sliderGeometry().rail}/${sliderGeometry().band}|${sliderGeometry()["thumb-width"]}x${sliderGeometry()["thumb-height"]}|${sliderGeometry()["handle-shape"]}|${sliderGeometry().outlined}|${colors.sliderTrack === colors.track}|${colors.sliderTrack === tints.brand}|${colors.sliderTrack === colors.input}`}</Text>
      <Text>{`checkbox=${checkboxGeometry().border}|${checkboxGeometry().target}|${checkboxGeometry().well}|${checkboxGeometry()["has-target"]}`}</Text>
      <Text>{`radio=${radioGeometry().size}|${radioGeometry().dot}|${radioGeometry().border}|${radioGeometry().target}|${radioGeometry().well}|${radioGeometry()["checked-style"]}|${radioGeometry()["has-target"]}|${radioGeometry()["dot-feedback"]}`}</Text>
      <Text>{`edge=${EDGE_WIDTH}|${outerEdge("red", "none")}|${outerEdge("red", "0 1px 2px black")}|${outerEdge(undefined, "none")}|${insetEdge("red", "none")}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(materialTheme)}>Material</Button>
      <Button onPress={() => selectTheme(winuiTheme)}>WinUI</Button>
      <Button onPress={() => selectTheme(null)}>Default</Button>
    </View>
  );
}

mount(App);
