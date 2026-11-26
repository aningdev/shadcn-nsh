import {
  activeSpec,
  buttonCorner,
  controlHeight,
  currentTheme,
  defineTheme,
  feedback,
  hitTarget,
  iconSize,
  rounded,
  selectTheme,
  shape,
  stroke,
} from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import { Button, buttonLabel, buttonLook, dialogCard, inputLook } from "../../../packages/ui";

/** A temporary theme with other corner roles, control heights, line widths and fades. */
const reshaped = defineTheme({
  extends: nshGallery.spec,
  id: "reshaped",
  label: "Reshaped",
  tokens: {
    radius: { control: 20, container: 28, modal: 30 },
  },
  metrics: {
    hit: { pointer: 48, touch: 52 },
    height: { pointer: { sm: 30, md: 36, lg: 44 }, touch: { sm: 40, md: 46, lg: 56 } },
    stroke: { hairline: 2, control: 2 },
    icon: { pointer: { sm: 16, md: 18, lg: 20 }, touch: { sm: 18, md: 20, lg: 22 } },
  },
  feedback: {
    // A theme that swaps to a disabled face instead of fading the whole view.
    disabled: { ...nshGallery.spec.feedback.disabled, contentOpacity: 0.3, replaceFace: true },
    passive: { pressedOpacity: 0.5 },
  },
});

/** Same radii as `reshaped`, with capsule button corners (`controls.button.corner.md: "full"`). */
const capsuleButtons = defineTheme({
  extends: reshaped.spec,
  id: "capsule-buttons",
  label: "Capsule",
  controls: {
    button: { corner: { md: "full" } },
  },
});

function App() {
  const button = buttonLook("secondary");
  const disabledText = buttonLabel("secondary", { disabled: true });
  return (
    <View>
      <Text>{`roles=${shape.control}|${shape.container}|${shape.modal}|${buttonCorner("default")}`}</Text>
      <Text>{`dialog=${dialogCard().borderRadius}|${dialogCard().borderWidth}`}</Text>
      <Text>{`field=${inputLook().style.borderRadius}|${inputLook().style.borderWidth}`}</Text>
      <Text>{`concentric=${rounded(shape.control, 3).borderRadius}|${rounded(shape.control, 99).borderRadius}`}</Text>
      <Text>{`button=${button.style.height}|${button.style.borderRadius}|${button.style.borderWidth}`}</Text>
      <Text>{`fade=${feedback.disabled.contentOpacity}|${feedback.passive.pressedOpacity}|${String(activeSpec().feedback.disabled.replaceFace)}`}</Text>
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
