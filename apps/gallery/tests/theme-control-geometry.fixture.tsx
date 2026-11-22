import {
  calendarGeometry,
  checkboxGeometry,
  colors,
  currentTheme,
  EDGE_WIDTH,
  insetEdge,
  outerEdge,
  progressGeometry,
  radioGeometry,
  selectTheme,
  sliderGeometry,
  spinnerGeometry,
  switchGeometry,
  tabsGeometry,
  tints,
} from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import materialTheme from "../../../packages/theme/themes/material/index";
import winuiTheme from "../../../packages/theme/themes/winui/index";
import { Button, calendarLook, progressRail, underlineTabsLook } from "../../../packages/ui";

const underline = underlineTabsLook();

function App() {
  return (
    <View>
      <Text>{`switch=${switchGeometry().width}x${switchGeometry().height}|${switchGeometry().border}/${switchGeometry()["on-border"]}|${switchGeometry().knob}/${switchGeometry()["on-knob"]}|${switchGeometry()["knob-feedback"]}`}</Text>
      <Text>{`slider=${sliderGeometry().rail}/${sliderGeometry().band}|${sliderGeometry()["thumb-width"]}x${sliderGeometry()["thumb-height"]}|${sliderGeometry()["handle-shape"]}|${sliderGeometry().outlined}|${colors.sliderTrack === colors.track}|${colors.sliderTrack === tints.brand}|${colors.sliderTrack === colors.input}`}</Text>
      <Text>{`checkbox=${checkboxGeometry().border}|${checkboxGeometry().target}|${checkboxGeometry().well}|${checkboxGeometry()["has-target"]}`}</Text>
      <Text>{`radio=${radioGeometry().size}|${radioGeometry().dot}|${radioGeometry().border}|${radioGeometry().target}|${radioGeometry().well}|${radioGeometry()["checked-style"]}|${radioGeometry()["has-target"]}|${radioGeometry()["dot-feedback"]}`}</Text>
      <Text>{`progress=${progressGeometry().height}/${progressGeometry()["track-height"]}|${progressGeometry()["track-role"]}|${progressGeometry()["track-shape"]}|${progressGeometry().outlined}|${progressRail().height}/${progressRail().backgroundImage ? "gradient" : "solid"}`}</Text>
      <Text>{`spinner=${spinnerGeometry()["min-stroke"]}/${spinnerGeometry()["stroke-share"]}|${spinnerGeometry()["has-track"]}|${spinnerGeometry()["track-alpha"]}`}</Text>
      <Text>{`tabs=${tabsGeometry()["pad-x"]}|${tabsGeometry()["indicator-span"]}|${tabsGeometry()["indicator-corners"]}|${underline.indicatorStyle.marginHorizontal ?? 0}/${underline.indicatorStyle.borderTopLeftRadius ?? underline.indicatorStyle.borderRadius}`}</Text>
      <Text>{`calendar=${calendarGeometry().cell}/${calendarGeometry()["outline-width"]}|${calendarGeometry()["cell-shape"]}|${calendarGeometry().today}|${calendarGeometry().selected}|${calendarLook.cell}`}</Text>
      <Text>{`edge=${EDGE_WIDTH}|${outerEdge("red", "none")}|${outerEdge("red", "0 1px 2px black")}|${outerEdge(undefined, "none")}|${insetEdge("red", "none")}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(materialTheme)}>Material</Button>
      <Button onPress={() => selectTheme(winuiTheme)}>WinUI</Button>
      <Button onPress={() => selectTheme(null)}>Default</Button>
    </View>
  );
}

mount(App);
