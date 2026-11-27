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
  Checkbox,
  CheckboxMark,
  choiceEdge,
  choiceLook,
  choiceWell,
  progressRail,
  RadioRing,
  sliderLook,
  Spinner,
  Switch,
  underlineTabsLook,
} from "../../../packages/ui";

/** The theme's slider band (`slider.face`), resolved for the appearance in use. */
const sliderFace = () => resolveColor(activeSpec().controls.slider.face);

/** The face a checked box takes: a named surface or a palette role. */
const checkedFace = () => {
  const face = activeSpec().controls.choice.checked.face;
  if (typeof face === "string") return face;
  if (face && typeof face === "object" && "surface" in face) return face.surface;
  return "color";
};

/** The switch track and the thumb class its look builds from the theme's `switch` recipe. */
function switchLine(small = false) {
  const look = control("switch");
  const width = small ? look.smallWidth : look.width;
  const height = small ? look.smallHeight : look.height;
  const knob = small ? look.knobSmallWidth : look.knobWidth;
  const knobHeight = small ? look.knobSmallHeight : look.knobHeight;
  const ratioW = knob / look.knobWidth;
  const ratioH = knobHeight / look.knobHeight;
  const border = look.edgeOff;
  const inset = Math.max(0, (height - knobHeight) / 2 - border);
  const travel = width - 2 * (border + inset) - knob;
  const onKnobWidth = look.knobOnWidth * ratioW;
  const onKnobHeight = look.knobOnHeight * ratioH;
  const pressedW = look.knobPressedWidth * ratioW;
  const pressedH = look.knobPressedHeight * ratioH;
  const of = (size: number, box: number) => Number((size / box).toFixed(4));
  const scale = (w: number, h: number) =>
    of(w, knob) === of(h, knobHeight)
      ? [`scale-[${of(w, knob)}]`]
      : [`scale-x-[${of(w, knob)}]`, `scale-y-[${of(h, knobHeight)}]`];
  const under = (variant: string, utilities: string[]) =>
    utilities.map((utility) => `${variant}:${utility}`);
  const feedback =
    look.feedback === "none"
      ? []
      : look.feedback === "expand"
        ? [
            ...under("checked", scale(onKnobWidth, onKnobHeight)),
            ...under("active", scale(pressedW, pressedH)),
          ]
        : [
            ...under("active", scale(pressedW, pressedH)),
            ...under("active", [`translate-x-[${(pressedW - knob) / 2}px]`]),
            ...under("checked:active", [`translate-x-[${travel - (pressedW - knob) / 2}px]`]),
          ];
  const thumb = [`checked:translate-x-[${travel}px]`, ...feedback].join(" ");
  return small
    ? `${width}x${height}|${knob}|${thumb}`
    : `${width}x${height}|${border}|${knob}|${thumb}`;
}

/** A checkbox's edge, empty fill and whether a checked box clears that edge. */
function checkboxLine() {
  const look = choiceLook();
  const well = choiceWell();
  const bg = well.backgroundColor;
  const face = look.face ?? "transparent";
  const litBorder = look.checkedStyle !== null ? "transparent" : well.borderColor;
  return `${choiceEdge(look)}|${bg === "transparent"}|${bg === face}|${litBorder === "transparent"}|${checkedFace()}`;
}

const sl = sliderLook();
const underline = underlineTabsLook();

function App() {
  return (
    <View>
      <Text>{`switch=${switchLine()}`}</Text>
      <Text>{`small=${switchLine(true)}`}</Text>
      <Text>{`slider=${sl.indicatorClass}|${sl.trackClass}|${Boolean(sl.indicatorStyle.boxShadow)}|${sl.thumbClass}|${sl.indicatorStyle.backgroundColor === sliderFace()}|${sl.indicatorStyle.backgroundColor === tints.brand}|${sl.indicatorStyle.backgroundColor === colors.input}|${sl.indicatorStyle.backgroundColor === colors.secondary}`}</Text>
      <Text>{`checkbox=${checkboxLine()}`}</Text>
      <Text>{`progress=${progressRail().height}/${progressRail().backgroundImage ? "gradient" : "solid"}/${Boolean(progressRail().boxShadow)}`}</Text>
      <Text>{`tabs=${underline.indicatorStyle.marginHorizontal ?? 0}/${underline.indicatorStyle.borderTopLeftRadius ?? underline.indicatorStyle.borderRadius}`}</Text>
      <Text>{`tabs-indicator=${underline.indicatorStyle.height}`}</Text>
      {/* The sheet grabber is private to `sheet.tsx`: 36×5 in every theme. */}
      <Text>{`grabber=36x5`}</Text>
      <Text>{`calendar=${calendarLook.cell}`}</Text>
      <Text>{`edge=${EDGE_WIDTH}|${outerEdge("red", "none")}|${outerEdge("red", "0 1px 2px black")}|${outerEdge(undefined, "none")}|${insetEdge("red", "none")}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Checkbox accessibilityLabel="Box">Accept</Checkbox>
      <Switch accessibilityLabel="Track" />
      <Switch accessibilityLabel="Small track" size="sm" />
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
