import {
  activeSpec,
  colors,
  control,
  currentTheme,
  EDGE_WIDTH,
  insetEdge,
  outerEdge,
  resolveColor,
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

/** The theme's own unchecked face, resolved for the appearance in use. */
const choiceFace = () => control("choice").face ?? "transparent";

/** The theme's slider band (`slider.face`), resolved for the appearance in use. */
const sliderFace = () => resolveColor(activeSpec().controls.slider.face);

/** The face a checked box takes: a named surface or a palette role. */
const checkedFace = () => {
  const face = activeSpec().controls.choice.checked.face;
  if (typeof face === "string") return face;
  if (face && typeof face === "object" && "surface" in face) return face.surface;
  return "color";
};

const cb = checkboxLook();
const cbLit = checkboxLook({ lit: () => true });
const sw = switchLook(() => false);
const swSmall = switchLook(() => false, "sm");
const sl = sliderLook();
const underline = underlineTabsLook();

function App() {
  return (
    <View>
      <Text>{`switch=${sw.trackStyle.width}x${sw.trackStyle.height}|${sw.trackStyle.borderWidth}|${sw.thumbStyle.width}|${sw.thumbClass}`}</Text>
      <Text>{`small=${swSmall.trackStyle.width}x${swSmall.trackStyle.height}|${swSmall.thumbStyle.width}|${swSmall.thumbClass}`}</Text>
      <Text>{`slider=${sl.indicatorClass}|${sl.trackClass}|${Boolean(sl.indicatorStyle.boxShadow)}|${sl.thumbClass}|${sl.indicatorStyle.backgroundColor === sliderFace()}|${sl.indicatorStyle.backgroundColor === tints.brand}|${sl.indicatorStyle.backgroundColor === colors.input}|${sl.indicatorStyle.backgroundColor === colors.secondary}`}</Text>
      <Text>{`checkbox=${cb.indicatorStyle.borderWidth}|${cb.indicatorStyle.backgroundColor === "transparent"}|${cb.indicatorStyle.backgroundColor === choiceFace()}|${cbLit.indicatorStyle.borderColor === "transparent"}|${checkedFace()}`}</Text>
      <Text>{`progress=${progressRail().height}/${progressRail().backgroundImage ? "gradient" : "solid"}/${Boolean(progressRail().boxShadow)}`}</Text>
      <Text>{`tabs=${underline.indicatorStyle.marginHorizontal ?? 0}/${underline.indicatorStyle.borderTopLeftRadius ?? underline.indicatorStyle.borderRadius}`}</Text>
      <Text>{`tabs-indicator=${underline.indicatorStyle.height}`}</Text>
      <Text>{`grabber=${sheetGrabber().width}x${sheetGrabber().height}`}</Text>
      <Text>{`calendar=${calendarLook.cell}`}</Text>
      <Text>{`edge=${EDGE_WIDTH}|${outerEdge("red", "none")}|${outerEdge("red", "0 1px 2px black")}|${outerEdge(undefined, "none")}|${insetEdge("red", "none")}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <CheckboxMark mark="check" />
      <RadioRing on />
      <Spinner side={40} tint={colors.brand} />
      <Button onPress={() => selectTheme(materialTheme)}>Material</Button>
      <Button onPress={() => selectTheme(winuiTheme)}>WinUI</Button>
      <Button onPress={() => selectTheme(null)}>NSH Gallery</Button>
    </View>
  );
}

mount(App);
