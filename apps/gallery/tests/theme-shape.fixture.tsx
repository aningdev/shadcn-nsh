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
  style as themeStyle,
  type AppTheme,
} from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Button, buttonLabel, buttonLook, dialogCard, inputLook } from "../../../packages/ui";

const { dimension, state } = nshGallery.semantics;

/** A temporary theme with other corner roles, control heights, line widths and fades. */
const reshaped: AppTheme = {
  ...nshGallery,
  id: "reshaped",
  label: "Reshaped",
  theme: {
    ...nshGallery.theme,
    cssVars: {
      ...nshGallery.theme.cssVars,
      theme: {
        ...nshGallery.theme.cssVars?.theme,
        "radius-control": "20px",
        "radius-container": "28px",
        "radius-modal": "30px",
      },
    },
  },
  semantics: {
    ...nshGallery.semantics,
    dimension: {
      ...dimension,
      size: {
        ...dimension.size,
        hit: { pointer: 48, touch: 52 },
        height: { pointer: { sm: 30, md: 36, lg: 44 }, touch: { sm: 40, md: 46, lg: 56 } },
      },
      stroke: { hairline: 2, control: 2 },
      icon: { pointer: { sm: 16, md: 18, lg: 20 }, touch: { sm: 18, md: 20, lg: 22 } },
    },
    state: {
      ...state,
      "pressed-opacity": 0.5,
      disabled: { content: 0.3 },
    },
    // A theme that swaps to a disabled face instead of fading the whole view (the slots every theme
    // inherits name `keep`; this one names `finish.disabled`).
    slots: {
      ...nshGallery.semantics.slots,
      "state.disabled.face": { finish: "disabled" },
      "state.disabled.ink": { finish: "disabled", field: "foreground" },
      "state.disabled.edge": { finish: "disabled", field: "borderColor" },
    },
  },
};

/** Same radii as `reshaped`, with `shape.corners.button: "full"` for capsule buttons. */
const capsuleButtons: AppTheme = {
  ...reshaped,
  id: "capsule-buttons",
  label: "Capsule",
  semantics: {
    ...reshaped.semantics,
    shape: {
      ...reshaped.semantics.shape,
      corners: { button: "full" },
    },
  },
};

function App() {
  const button = buttonLook("secondary");
  const disabledText = buttonLabel("secondary", { disabled: true });
  return (
    <View>
      <Text>{`roles=${shape.control}|${shape.container}|${shape.modal}|${shape.button}`}</Text>
      <Text>{`dialog=${dialogCard().borderRadius}|${dialogCard().borderWidth}`}</Text>
      <Text>{`field=${inputLook().style.borderRadius}|${inputLook().style.borderWidth}`}</Text>
      <Text>{`concentric=${rounded(shape.control, 3).borderRadius}|${rounded(shape.control, 99).borderRadius}`}</Text>
      <Text>{`button=${button.style.height}|${button.style.borderRadius}|${button.style.borderWidth}`}</Text>
      <Text>{`fade=${dimmed.disabled}|${dimmed.pressed}|${String(themeStyle().slots["state.disabled.face"] !== "keep")}`}</Text>
      <Text>{`disabledMode=${button.disabledStyle.opacity === undefined ? "fill" : "fade"}|${String(disabledText.color === buttonLabel("secondary").color)}`}</Text>
      <Text>{`sizes=${controlHeight.sm}|${controlHeight.lg}|${iconSize.md}|${hitTarget()}|${stroke.hairline}|${stroke.control}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Button onPress={() => selectTheme(reshaped)}>Reshaped</Button>
      <Button onPress={() => selectTheme(capsuleButtons)}>Capsule</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
