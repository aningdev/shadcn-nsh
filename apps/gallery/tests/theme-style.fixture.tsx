import {
  cornerCurve,
  focusRing,
  follow,
  isTiming,
  motion,
  selectTheme,
  type AppTheme,
} from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { defaultTheme } from "../../../packages/theme/themes/default/index";
import { Button, controlSize, density, plainRow } from "../../../packages/ui";

/** The build-time theme with other style data: roomier rows, a stiffer press, a wider focus ring
 * and circular corners. Its colors and finishes are the default's. */
const roomy: AppTheme = {
  ...defaultTheme,
  id: "roomy",
  label: "roomy",
  semantics: {
    ...defaultTheme.semantics,
    size: {
      ...defaultTheme.semantics.size,
      density: {
        pointer: { ...defaultTheme.semantics.size.density.pointer, row: 60 },
        touch: { ...defaultTheme.semantics.size.density.touch, row: 60 },
      },
      control: {
        pointer: { ...defaultTheme.semantics.size.control.pointer, row: 52 },
        touch: { ...defaultTheme.semantics.size.control.touch, row: 52 },
      },
    },
    motion: { ...defaultTheme.semantics.motion, press: { stiffness: 111, damping: 22 } },
    focus: { ...defaultTheme.semantics.focus, width: 5 },
    shape: { ...defaultTheme.semantics.shape, curve: "circular" },
  },
};

function App() {
  const on = signal(false);
  // A spring made before the switch: it reads the theme's stiffness when it springs.
  follow(() => (on() ? 1 : 0), motion.press);
  return (
    <View>
      <Text testID="density">{`density:${density.row}`}</Text>
      <Text testID="control">{`control:${controlSize.row}`}</Text>
      <Text testID="plain">{`plain:${plainRow().minHeight}`}</Text>
      <Text testID="press">{`press:${isTiming(motion.press) ? `${motion.press.duration}|${JSON.stringify(motion.press.easing)}` : `${motion.press.stiffness}|${motion.press.damping}`}`}</Text>
      <Text testID="focus">{`focus:${focusRing().outlineWidth}`}</Text>
      <Text testID="curve">{`curve:${cornerCurve.borderCurve}`}</Text>
      <Button onPress={() => selectTheme(roomy)}>Roomy</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
      <Button onPress={() => on.set(!on())}>Spring</Button>
    </View>
  );
}

mount(App);
