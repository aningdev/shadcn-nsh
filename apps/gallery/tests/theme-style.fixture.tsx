import {
  cornerCurve,
  focusRing,
  follow,
  motion,
  selectTheme,
  type AppTheme,
} from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { defaultTheme } from "../../../packages/theme/themes/default/index";
import { Button, controlSize, density, plainRow } from "../../../packages/ui";

/** The build-time theme with other style data: a taller large step, roomier padding, a faster
 * timing, a wider focus ring and circular corners. Its colors and finishes are the default's. */
const roomy: AppTheme = {
  ...defaultTheme,
  id: "roomy",
  label: "roomy",
  semantics: {
    ...defaultTheme.semantics,
    dimension: {
      ...defaultTheme.semantics.dimension,
      size: {
        ...defaultTheme.semantics.dimension.size,
        height: {
          pointer: { ...defaultTheme.semantics.dimension.size.height.pointer, lg: 60 },
          touch: { ...defaultTheme.semantics.dimension.size.height.touch, lg: 60 },
        },
        control: {
          pointer: { ...defaultTheme.semantics.dimension.size.control.pointer, padding: 13 },
          touch: { ...defaultTheme.semantics.dimension.size.control.touch, padding: 13 },
        },
      },
      focus: { ...defaultTheme.semantics.dimension.focus, width: 5 },
    },
    motion: {
      ...defaultTheme.semantics.motion,
      fast: { duration: 90, timingFunction: "decelerate" },
    },
    shape: { ...defaultTheme.semantics.shape, curve: "circular" },
  },
};

function App() {
  const on = signal(false);
  // A follower made before the switch: it reads the theme's duration when it moves.
  follow(() => (on() ? 1 : 0), motion.fast);
  return (
    <View>
      <Text testID="density">{`density:${density.row}`}</Text>
      <Text testID="control">{`control:${controlSize.padding}`}</Text>
      <Text testID="plain">{`plain:${plainRow().minHeight}`}</Text>
      <Text testID="press">{`press:${motion.fast.duration}`}</Text>
      <Text testID="focus">{`focus:${focusRing().outlineWidth}`}</Text>
      <Text testID="curve">{`curve:${cornerCurve.borderCurve}`}</Text>
      <Button onPress={() => selectTheme(roomy)}>Roomy</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
      <Button onPress={() => on.set(!on())}>Follow</Button>
    </View>
  );
}

mount(App);
