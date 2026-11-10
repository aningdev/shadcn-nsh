// Source: examples/nsh-gallery-ui/look/press.ts @ 64ab8a1d (baseline), see NOTICE.
import type { ViewStyle } from "nsh";
import { reduceMotion } from "nsh";

/**
 * Press feedback (NSH Design Guides "Motion"): the control sinks to `scale` while active and
 * eases back with the state changes beside it (`also`: CSS property names). Reduced motion
 * removes the sink, the movement, and keeps the short colour fade.
 *
 * Spread `activeStyle` into the control's `activeStyle` (after its own pressed shade) and
 * `transition` into its `style`.
 */
export function pressSink(scale: number, also: string) {
  return {
    get activeStyle(): ViewStyle {
      return reduceMotion() ? {} : { transform: [{ scale }] };
    },
    transition: {
      transitionProperty: `${also}, transform`,
      transitionDuration: 150,
      transitionTimingFunction: "ease-out",
    } satisfies ViewStyle,
  };
}

/**
 * The press feedback of a box or a ring that sits in a row: it sinks to 90% while the row is
 * pressed (give the row `class="group"`), and eases back; still with reduced motion.
 */
export const groupSink =
  "transition-transform duration-150 ease-out group-active:scale-90 motion-reduce:transition-none";
