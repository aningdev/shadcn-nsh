// A press's feedback, native: a control sinks while pressed and eases back, from its
// `activeStyle`, so it never waits for JS.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { hitTarget, motion, press, terminal } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { reduceMotion } from "nsh";

import { type Live, read } from "./live-value";
import { cssMotion } from "./motion";

/** A `style`'s transition for a press's sink: `transform`, and `also` (more
 * of CSS's property names the control's states change, as
 * `"background-color, opacity"`) alike, over the theme's `motion.state`. */
export function pressTransition(also?: string): ViewStyle {
  return {
    transitionProperty: also ? `${also}, transform` : "transform",
    ...cssMotion(motion.state),
  };
}

/**
 * A press that sinks a control to `scale` (default: the theme's `press.scale`,
 * 97%; none with reduced motion). A theme that draws no press (`press.scale` of
 * 1, as shadcn's flat surfaces do) sinks nothing, whichever scale a control
 * asks for. `scale` may be a function (a signal), read where the press is
 * drawn. Spread `activeStyle` into the control's `activeStyle` (after its
 * own pressed shade) and `transition` into its `style`
 * (`pressTransition(also)`).
 */
export function pressSink(
  scale?: Live<number | undefined>,
  also?: string,
): { readonly activeStyle: ViewStyle; readonly transition: ViewStyle } {
  return {
    get activeStyle(): ViewStyle {
      if (reduceMotion()) return {};
      const sink = press.scale;
      if (sink >= 1) return {};
      return { transform: [{ scale: read(scale) ?? sink }] };
    },
    get transition(): ViewStyle {
      return pressTransition(also);
    },
  };
}
/**
 * How far presses count past a control `side` points tall (a button's height,
 * a toggle's side), so a finger gets the theme's `size.hit` points without the control
 * looking bigger: none in a terminal or where the theme's hit target is 0 (a pointer's), and none once `side` is
 * that big already.
 */
export function touchSlop(side: number): number | undefined {
  const hit = hitTarget();
  if (terminal || side >= hit) return undefined;
  return (hit - side) / 2;
}
