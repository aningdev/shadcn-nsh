import {
  controlHeight,
  currentTheme,
  dimmed,
  hitTarget,
  iconSize,
  rounded,
  selectTheme,
  shape,
  stroke,
  type AppTheme,
} from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
import { Button, buttonLook, dialogCard, inputLook } from "../../../packages/ui";

const { size, stroke: lines, state } = defaultTheme.semantics;

/** A temporary theme with other corner roles, control heights, line widths and fades. */
const reshaped: AppTheme = {
  ...defaultTheme,
  id: "reshaped",
  label: "Reshaped",
  theme: {
    ...defaultTheme.theme,
    cssVars: {
      ...defaultTheme.theme.cssVars,
      theme: {
        ...defaultTheme.theme.cssVars?.theme,
        "radius-control": "20px",
        "radius-field": "3px",
        "radius-chip": "5px",
        "radius-overlay": "6px",
        "radius-dialog": "28px",
        "radius-sheet": "30px",
      },
    },
  },
  semantics: {
    ...defaultTheme.semantics,
    size: {
      ...size,
      hit: { pointer: 48, touch: 52 },
      height: { pointer: { sm: 30, md: 36, lg: 44 }, touch: { sm: 40, md: 46, lg: 56 } },
    },
    stroke: { ...lines, hairline: 2, surface: 2, control: 2 },
    state: {
      ...state,
      pressedOpacity: 0.5,
      disabled: { content: 0.3, container: 0.2 },
    },
    icon: { size: { pointer: { sm: 16, md: 18, lg: 20 }, touch: { sm: 18, md: 20, lg: 22 } } },
  },
};

function App() {
  const button = buttonLook("secondary");
  return (
    <View>
      <Text>{`roles=${shape.control}|${shape.field}|${shape.chip}|${shape.dialog}|${shape.sheet}|${shape.overlay}`}</Text>
      <Text>{`dialog=${dialogCard().borderRadius}|${dialogCard().borderWidth}`}</Text>
      <Text>{`field=${inputLook().style.borderRadius}|${inputLook().style.borderWidth}`}</Text>
      <Text>{`concentric=${rounded(shape.control, 3).borderRadius}|${rounded(shape.control, 99).borderRadius}`}</Text>
      <Text>{`button=${button.style.height}|${button.style.borderRadius}|${button.style.borderWidth}`}</Text>
      <Text>{`fade=${button.disabledStyle.opacity as number}|${dimmed.pressed}|${dimmed.disabledContainer}`}</Text>
      <Text>{`sizes=${controlHeight.sm}|${controlHeight.lg}|${iconSize.md}|${hitTarget()}|${stroke.hairline}|${stroke.surface}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(reshaped)}>Reshaped</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
