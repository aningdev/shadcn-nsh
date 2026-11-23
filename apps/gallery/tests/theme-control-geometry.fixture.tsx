import {
  colors,
  currentTheme,
  EDGE_WIDTH,
  insetEdge,
  outerEdge,
  selectTheme,
  tints,
} from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import materialTheme from "../../../packages/theme/themes/material/index";
import winuiTheme from "../../../packages/theme/themes/winui/index";
import {
  Button,
  calendarLook,
  CheckboxMark,
  checkboxLook,
  progressRail,
  RadioRing,
  sheetGrabber,
  sliderLook,
  Spinner,
  switchLook,
  underlineTabsLook,
} from "../../../packages/ui";

const cb = checkboxLook();
const sw = switchLook(() => false);
const sl = sliderLook();
const underline = underlineTabsLook();

function App() {
  return (
    <View>
      <Text>{`switch=${sw.trackStyle.width}x${sw.trackStyle.height}|${sw.trackStyle.borderWidth}|${sw.thumbStyle.width}|${sw.thumbClass}`}</Text>
      <Text>{`slider=${sl.indicatorClass}|${sl.trackClass}|${Boolean(sl.indicatorStyle.boxShadow)}|${sl.thumbClass}|${sl.indicatorStyle.backgroundColor === colors.track}|${sl.indicatorStyle.backgroundColor === tints.brand}|${sl.indicatorStyle.backgroundColor === colors.input}`}</Text>
      <Text>{`checkbox=${cb.indicatorStyle.borderWidth}|${cb.indicatorStyle.backgroundColor === "transparent"}|${cb.indicatorStyle.backgroundColor === colors.track}`}</Text>
      <Text>{`progress=${progressRail().height}/${progressRail().backgroundImage ? "gradient" : "solid"}/${Boolean(progressRail().boxShadow)}`}</Text>
      <Text>{`tabs=${underline.indicatorStyle.marginHorizontal ?? 0}/${underline.indicatorStyle.borderTopLeftRadius ?? underline.indicatorStyle.borderRadius}`}</Text>
      <Text>{`tabs-indicator=${underline.indicatorStyle.height}`}</Text>
      <Text>{`grabber=${sheetGrabber().width}x${sheetGrabber().height}`}</Text>
      <Text>{`calendar=${calendarLook.cell}`}</Text>
      <Text>{`edge=${EDGE_WIDTH}|${outerEdge("red", "none")}|${outerEdge("red", "0 1px 2px black")}|${outerEdge(undefined, "none")}|${insetEdge("red", "none")}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <CheckboxMark mark="check" />
      <RadioRing on />
      <Spinner size={40} tint={colors.brand} />
      <Button onPress={() => selectTheme(materialTheme)}>Material</Button>
      <Button onPress={() => selectTheme(winuiTheme)}>WinUI</Button>
      <Button onPress={() => selectTheme(null)}>Default</Button>
    </View>
  );
}

mount(App);
