// A skeleton: the shape of content that is still coming, drawn on `nsh`'s View.

import type { ViewProps, ViewStyle } from "nsh";
import { createMotion, reduceMotion, split, token, View } from "nsh";

import { rounded, shape, terminal } from "../theme";

/**
 * A skeleton's props. It has no axis of its own: every `nsh` view prop passes through, and the
 * box comes from the caller's `style` (`width`, `height`, `borderRadius`, `flexGrow`): a line is
 * a few points tall and as wide as its text, an avatar round. `class` and `classList` follow the
 * look; `style` goes over it.
 */
export type SkeletonProps = ViewProps;

/**
 * The placeholder shadcn/ui draws while content loads: a block in the theme's `accent` fill at
 * the theme's control corners, breathing in and out (an endless motion that lands still when the
 * user asks for less motion — and a terminal, which draws no motion, shows it still). It draws no
 * text and takes no presses; its size is the caller's `style`, and `style` goes over the look's.
 */
export function Skeleton(props: SkeletonProps) {
  const [, rest] = split(props, ["class", "classList", "style"]);
  const pulse = skeletonPulse();
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[skeletonLook(), pulse?.style ?? null, props.style ?? null]}
    />
  );
}

// Private helpers

/**
 * A skeleton's look: a block in the theme's `accent` fill, at the theme's control corners.
 * The breathing is the component's own motion, not the look's, so a still picture of the look is
 * a still block.
 */
function skeletonLook(): ViewStyle {
  return {
    ...rounded(shape.control),
    backgroundColor: token("accent"),
  };
}

// Terminal

/** A terminal draws no motion, and reduced motion stands still too. */
function skeletonPulse() {
  return terminal || reduceMotion() ? null : createMotion({ enter: "glow" });
}
