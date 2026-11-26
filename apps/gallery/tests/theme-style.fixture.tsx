import {
  cornerCurve,
  defineTheme,
  focusRing,
  follow,
  motion,
  selectTheme,
} from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { nshGallery } from "../../../packages/theme/themes/nsh-gallery/index";
import { Button, controlSize, density, plainRow } from "../../../packages/ui";

/** The build-time theme with other style data: a taller large step, roomier padding, a faster
 * timing, a wider focus ring and circular corners. Its colors and surfaces are the build-time theme's. */
const roomy = defineTheme({
  extends: nshGallery.spec,
  id: "roomy",
  label: "roomy",
  tokens: {
    radius: { curve: "circular" },
  },
  metrics: {
    height: {
      pointer: { sm: 24, md: 28, lg: 60 },
      touch: { sm: 32, md: 40, lg: 60 },
    },
    control: {
      pointer: { padding: 13, gap: 8 },
      touch: { padding: 13, gap: 8 },
    },
  },
  feedback: {
    focus: { style: "halo", width: 5, offset: 0 },
  },
  motion: {
    fast: { duration: 90, easing: "decelerate" },
  },
});

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
