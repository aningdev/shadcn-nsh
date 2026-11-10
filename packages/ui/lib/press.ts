// Source: examples/nsh-gallery-ui/look/press.ts @ 64ab8a1d (baseline), see NOTICE.
import type { ViewStyle } from "nsh";
import { reduceMotion } from "nsh";

/**
 * Duration of a style transition: `ms`, or 0 when the user asked for less motion.
 * Read it while building a style (a render, a `computed`): it is a snapshot.
 */
export function motionDuration(ms: number): number {
  return reduceMotion() ? 0 : ms;
}

/**
 * Press feedback (NSH Design Guides "Motion"): the control sinks to `scale` while active and
 * eases back with the state changes beside it (`also`: CSS property names). Reduced motion
 * removes the sink and sets the duration to 0.
 *
 * Spread `activeStyle` into the control's `activeStyle` (after its own pressed shade) and
 * `transition` into its `style`.
 */
export function pressSink(scale: number, also: string) {
  return {
    get activeStyle(): ViewStyle {
      return reduceMotion() ? {} : { transform: [{ scale }] };
    },
    get transition(): ViewStyle {
      return {
        transitionProperty: `${also}, transform`,
        transitionDuration: motionDuration(150),
        transitionTimingFunction: "ease-out",
      };
    },
  };
}

/**
 * The press feedback of a box or a ring that sits in a row: it sinks to 90% while the row is
 * pressed (give the row `class="group"`), and eases back; still with reduced motion.
 */
export const groupSink =
  "transition-transform duration-150 ease-out group-active:scale-90 motion-reduce:transition-none";
