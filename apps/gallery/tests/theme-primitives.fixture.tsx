import {
  animate,
  colors,
  finish,
  focusRing,
  follow,
  hovered,
  isTiming,
  motion,
  platformMaterial,
  selectTheme,
  type AppTheme,
} from "@shadcn-nsh/theme";
import { createAnimatedValue, mount, signal, Text, token, View } from "nsh";

import defaultTheme from "../../../packages/theme/themes/default/index";
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

const { finishes } = defaultTheme.semantics;

/**
 * A synthetic theme exercising the Phase 3 cross-platform primitives:
 * `double` focus ring, timing motion roles with M3/WinUI 3 curves, state-layer overlays on
 * gradient fills with surface-matched ink, `state.ripple`, and `material.android`.
 */
const expressive: AppTheme = {
  ...defaultTheme,
  id: "expressive",
  label: "Expressive",
  semantics: {
    ...defaultTheme.semantics,
    dimension: {
      ...defaultTheme.semantics.dimension,
      focus: { style: "double", width: 2, offset: 2 },
    },
    state: {
      ...defaultTheme.semantics.state,
      overlay: { hover: 0.08, focus: 0.1, pressed: 0.1, dragged: 0.16 },
      ripple: true,
    },
    transition: {
      ...defaultTheme.semantics.transition,
      enter: { duration: 200, timingFunction: "point-to-point" },
    },
    motion: {
      ...defaultTheme.semantics.motion,
      press: { duration: 150, timingFunction: "emphasized-decelerate" },
      settle: { duration: 250, timingFunction: "decelerate" },
      control: { duration: 167, timingFunction: "accelerate" },
    },
    finishes: {
      ...finishes,
      light: {
        ...finishes.light,
        accent: {
          ...finishes.light.accent,
          gradient: "linear-gradient(180deg, {primary} 0%, {brand} 100%)",
        },
        menu: {
          ...finishes.light.menu,
          material: {
            android: {
              elevation: 6,
              ripple: { color: "{primary}", borderless: true, radius: 18, foreground: true },
            },
          },
        },
      },
      dark: {
        ...finishes.dark,
        menu: {
          ...finishes.dark.menu,
          material: {
            android: {
              elevation: 8,
              ripple: { color: "{brand}" },
            },
          },
        },
      },
    },
  },
};

const showMotion = (m: typeof motion.press) =>
  isTiming(m)
    ? `timing:${m.duration}:${JSON.stringify(m.timingFunction)}`
    : `spring:${m.stiffness}:${m.damping}`;

function App() {
  const step = signal(0);
  const followed = follow(() => step(), motion.press);
  const direct = createAnimatedValue(0);

  const defaultBtn = buttonLook("default");
  const roundBtn = roundButtonLook("default");
  const splitSeg = splitButtonLook("default").segment();
  const onToggle = toggleLook({ on: true });
  const toastClose = toastCloseLook();
  const arrow = carouselArrowLook({ glass: true });

  return (
    <View>
      <Text>{`focus=${JSON.stringify(focusRing())}`}</Text>
      <Text>{`ringTokens=${String(token("ring"))}|${String(token("ring-halo"))}`}</Text>
      <Text>{`motionPress=${showMotion(motion.press)}`}</Text>
      <Text>{`motionControl=${showMotion(motion.control)}`}</Text>
      <Text>{`motionMove=${showMotion(motion.move)}`}</Text>
      <Text>{`motionEnter=${motion.enter.duration}:${JSON.stringify(motion.enter.timingFunction)}`}</Text>
      <Text>{`btnHover=${JSON.stringify(defaultBtn.hoverStyle ?? null)}`}</Text>
      <Text>{`roundHover=${JSON.stringify(roundBtn.hoverStyle ?? null)}`}</Text>
      <Text>{`splitHover=${JSON.stringify(splitSeg.hoverStyle ?? null)}`}</Text>
      <Text>{`toggleOnHover=${JSON.stringify(onToggle.hoverStyle ?? null)}`}</Text>
      <Text>{`toastHover=${JSON.stringify(toastClose.hoverStyle)}`}</Text>
      <Text>{`arrowHover=${JSON.stringify(arrow.hoverStyle)}`}</Text>
      <Text>{`bareHover=${JSON.stringify(hovered())}`}</Text>
      <Text>{`btnAndroid=${JSON.stringify(defaultBtn.android ?? null)}`}</Text>
      <Text>{`roundAndroid=${JSON.stringify(roundBtn.android ?? null)}`}</Text>
      <Text>{`toggleOnAndroid=${JSON.stringify(onToggle.android ?? null)}`}</Text>
      <Text>{`toastAndroid=${JSON.stringify(toastClose.android ?? null)}`}</Text>
      <Text>{`menuMaterial=${JSON.stringify(platformMaterial("menu"))}`}</Text>
      <Text>{`tokens=${colors.primaryForeground}|${colors.inverseForeground}|${colors.primary}|${finish.on.foreground}`}</Text>
      <Roll value={step()}>{`roll=${step()}`}</Roll>
      <View
        style={{
          opacity: followed,
          transform: [
            { scale: direct.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ],
        }}
      />
      <Button variant="default" onPress={() => selectTheme(expressive)}>
        Expressive
      </Button>
      <Button
        variant="secondary"
        onPress={() => {
          const next = step() + 1;
          step.set(next);
          void animate(direct, next % 2, motion.control);
        }}
      >
        Step
      </Button>
      <Toggle pressed>Pinned</Toggle>
      <Button variant="ghost" onPress={() => selectTheme(null)}>
        Reset
      </Button>
    </View>
  );
}

mount(App);
