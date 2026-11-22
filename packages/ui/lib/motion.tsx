// Shared motion: a control shakes when a value is rejected, and a figure rolls to its next one.
// This library's own. Yours to change.
import { isTiming, motion as themeMotion } from "@shadcn-nsh/theme";
import type { StyleProp, TextStyle, ViewStyle } from "nsh";
import { createMotion, effect, reduceMotion, signal, Text } from "nsh";

/**
 * A shake that plays when `tick` changes to a new number (a second submit, a second wrong code).
 * The first value does not play, and a return to `undefined` does not either, so a field that
 * becomes valid stays still. `play("shake")` already does nothing when the user asks for less
 * motion.
 *
 * It returns the style to call where the field draws it (`style={shake.style()}`): a component's
 * body runs once, so only the style an expression builds is read again when the shake starts and
 * ends. At rest it is `null`, so a quiet field has no transform at all. `playing()` says whether
 * it is under way, for a control that holds its press until the field has answered.
 */
export function createRejectShake(tick: () => number | undefined): {
  style: () => ViewStyle | null;
  playing: () => boolean;
} {
  const motion = createMotion();
  const shaking = signal(false);
  let seen: number | undefined;
  let ready = false;
  effect(() => {
    const next = tick();
    if (!ready) {
      ready = true;
      seen = next;
      return;
    }
    if (next === undefined || next === seen) {
      seen = next;
      return;
    }
    seen = next;
    if (reduceMotion()) return;
    shaking.set(true);
    void Promise.resolve(motion.play("shake", { duration: themeMotion.shake.duration })).then(() =>
      shaking.set(false),
    );
  });
  return {
    style: () => (shaking() ? { transform: motion.transform } : null),
    playing: () => shaking(),
  };
}

/**
 * A figure that rolls to its next value: up when `value` grows, down when it shrinks, on the
 * theme's `motion.control` spring. The native number field keeps its own glyphs and caret, so the
 * roll is the text beside it (upstream's ticker), not the field. The first value is already there.
 * With reduced motion the next value replaces this one in place.
 */
export function Roll(props: { value: number; style?: StyleProp<TextStyle>; children: string }) {
  const motion = createMotion({ initial: { translateY: 0, opacity: 1 } });
  const shown = signal(props.value);
  effect(() => {
    const next = props.value;
    const at = shown();
    if (next === at) return;
    shown.set(next);
    if (reduceMotion()) {
      motion.translateY.set(0);
      motion.opacity.set(1);
      return;
    }
    const away = next > at ? 10 : -10;
    motion.translateY.set(away);
    motion.opacity.set(0);
    void motion.play({
      keyframes: { translateY: [away, 0], opacity: [0, 1] },
      ...(isTiming(themeMotion.control)
        ? { duration: themeMotion.control.duration, easing: themeMotion.control.timingFunction }
        : {
            spring: {
              stiffness: themeMotion.control.stiffness,
              damping: themeMotion.control.damping,
            },
          }),
    });
  });
  return (
    <Text style={[props.style ?? null, { transform: motion.transform, opacity: motion.opacity }]}>
      {props.children}
    </Text>
  );
}
