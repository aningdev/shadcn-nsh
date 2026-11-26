import {
  animate,
  colors,
  defineTheme,
  focusRing,
  follow,
  hovered,
  motion,
  selectTheme,
  surface,
} from "@shadcn-nsh/theme";
import { createAnimatedValue, mount, signal, Text, token, View } from "nsh";

import apple from "../../../packages/theme/themes/apple/index";
import material from "../../../packages/theme/themes/material/index";
import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import winui from "../../../packages/theme/themes/winui/index";
import {
  Button,
  buttonLook,
  carouselArrowLook,
  roundButtonLook,
  splitButtonLook,
  toastCloseLook,
  Toggle,
  toggleLook,
} from "../../../packages/ui";
import { Roll } from "../../../packages/ui/lib/motion";

const { spec } = nshGallery;

/**
 * A synthetic theme exercising the cross-platform primitives:
 * `double` focus ring, timing motion roles with M3/WinUI 3 curves, state-layer overlays with
 * surface-matched ink, and a surface's `material` and `elevation`.
 */
const expressive = defineTheme({
  extends: spec,
  id: "expressive",
  label: "Expressive",
  feedback: {
    focus: { style: "double", width: 2, offset: 2 },
    hover: { ...spec.feedback.hover, overlay: 0.08 },
    press: { ...spec.feedback.press, overlay: 0.1 },
  },
  motion: {
    fast: { duration: 150, easing: "emphasized-decelerate" },
    default: { duration: 250, easing: "decelerate" },
    slow: { duration: 167, easing: "accelerate" },
  },
  surfaces: {
    overlay: {
      light: { material: "acrylic", elevation: 6 },
      dark: { material: "acrylic", elevation: 8 },
    },
  },
});

const showMotion = (m: typeof motion.fast) =>
  `timing:${m.duration}:${JSON.stringify(m.timingFunction)}`;

const showPresets = () => {
  const pop = motion.preset("popoverEnter");
  const dlg = motion.preset("dialogEnter");
  const glide = motion.indicatorGlide;
  const sw = motion.themeSwitch;
  return JSON.stringify({
    pop: { scale: pop.fromScale, y: pop.fromY, spring: pop.spring ?? null },
    dlg: { scale: dlg.fromScale, y: dlg.fromY, spring: dlg.spring ?? null },
    glide: { dur: glide.timing.duration, spring: glide.spring ?? null },
    switch: { kind: sw.kind, duration: sw.duration, shader: sw.shader ? "shader" : null },
  });
};

function App() {
  const step = signal(0);
  const followed = follow(() => step(), motion.fast);
  const direct = createAnimatedValue(0);

  const defaultBtn = buttonLook("default");
  const roundBtn = roundButtonLook("default");
  const splitSeg = splitButtonLook("default").segment();
  const onToggle = toggleLook({ on: true });
  const toastClose = toastCloseLook();
  const arrow = carouselArrowLook({ glass: true });

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        <Button variant="default" onPress={() => selectTheme(expressive)}>
          Expressive
        </Button>
        <Button
          variant="secondary"
          onPress={() => {
            const next = step() + 1;
            step.set(next);
            void animate(direct, next % 2, motion.slow);
          }}
        >
          Step
        </Button>
        <Toggle pressed>Pinned</Toggle>
        <Button variant="ghost" onPress={() => selectTheme(null)}>
          Reset
        </Button>
        <Button variant="ghost" onPress={() => selectTheme(apple)}>
          Apple
        </Button>
        <Button variant="ghost" onPress={() => selectTheme(material)}>
          Material
        </Button>
        <Button variant="ghost" onPress={() => selectTheme(winui)}>
          WinUI
        </Button>
      </View>
      <Text>{`focus=${JSON.stringify(focusRing())}`}</Text>
      <Text>{`ringTokens=${String(token("ring"))}|${String(token("card"))}`}</Text>
      <Text>{`motionFast=${showMotion(motion.fast)}`}</Text>
      <Text>{`motionDefault=${showMotion(motion.default)}`}</Text>
      <Text>{`motionSlow=${showMotion(motion.slow)}`}</Text>
      <Text>{`motionPresets=${showPresets()}`}</Text>
      <Text>{`btnHover=${JSON.stringify(defaultBtn.hoverStyle ?? null)}`}</Text>
      <Text>{`roundHover=${JSON.stringify(roundBtn.hoverStyle ?? null)}`}</Text>
      <Text>{`splitHover=${JSON.stringify(splitSeg.hoverStyle ?? null)}`}</Text>
      <Text>{`toggleOnHover=${JSON.stringify(onToggle.hoverStyle ?? null)}`}</Text>
      <Text>{`toastHover=${JSON.stringify(toastClose.hoverStyle)}`}</Text>
      <Text>{`arrowHover=${JSON.stringify(arrow.hoverStyle)}`}</Text>
      <Text>{`bareHover=${JSON.stringify(hovered())}`}</Text>
      <Text>{`menuMaterial=${JSON.stringify(surface("overlay").platformProps)}`}</Text>
      <Text>{`tokens=${colors.primaryForeground}|${surface("inverse").ink}|${surface("accent").ink}`}</Text>
      <Roll value={step()}>{`roll=${step()}`}</Roll>
      <View
        style={{
          opacity: followed,
          transform: [
            { scale: direct.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ],
        }}
      />
    </View>
  );
}

mount(App);
