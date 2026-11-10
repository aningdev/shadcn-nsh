// Source: examples/nsh-gallery-ui/theme.ts (`follow`, `motion`) @ 64ab8a1d (baseline), see NOTICE.
import type { AnimatedValue } from "nsh";
import { createAnimatedValue, effect, reduceMotion } from "nsh";

/** Spring parameters, from gpui-kit's `spring_control` and `spring_move` as a unit mass's stiffness and damping. */
export const springs = {
  /** A mark or a fill coming and going (180 ms, no overshoot). */
  control: { stiffness: 1218, damping: 70 },
  /** A thumb or an indicator traveling (280 ms). */
  move: { stiffness: 504, damping: 38 },
};

/**
 * An animated value that springs to `target()` each time it changes (a control's state: 1 while
 * on, 0 while off), natively: JS only starts each spring. A change midway turns it from where it
 * is. With reduced motion it lands at once. For discrete changes only: what the pointer drives
 * (a dragged thumb) is set in the same frame, never sprung toward the pointer.
 *
 * Call it in a component body: the effect belongs to the component.
 */
export function follow(
  target: () => number,
  spring: { stiffness: number; damping: number } = springs.control,
): AnimatedValue {
  const value = createAnimatedValue(target());
  let shown = target();
  effect(() => {
    const next = target();
    if (next === shown) return;
    shown = next;
    if (reduceMotion()) value.set(next);
    else void value.spring(next, spring);
  });
  return value;
}
