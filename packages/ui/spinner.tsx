// A spinner: a ring turning with its top arc in one color, the shape of work going on.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, spinnerGeometry } from "@shadcn-nsh/theme";
import { reduceMotion, View } from "nsh";

// @port index.tsx
/** One turn, in milliseconds: fast enough to read as work going on, slow enough not to blur. */
const TURN_MS = 800;

/** A spinner's props. */
export interface SpinnerProps {
  /** The ring's side, in points. */
  size: number;
  /** The moving arc's color (the theme's text, a tone); the rest of the ring follows `dimension.spinner`. */
  tint: string;
}

/**
 * A ring turning with its top arc in `tint`: work going on. Stroke share, minimum stroke, and
 * background track ring visibility come from `dimension.spinner`. It stands still when the user asks for less motion.
 */
export function Spinner(props: SpinnerProps) {
  const g = () => spinnerGeometry();
  const stroke = () => Math.max(g()["min-stroke"], props.size / g()["stroke-share"]);
  return (
    <View
      style={{
        width: props.size,
        height: props.size,
        borderRadius: props.size / 2,
        borderWidth: stroke(),
        borderColor: g()["has-track"] ? alpha(props.tint, g()["track-alpha"]) : "transparent",
        borderTopColor: props.tint,
        animationName: reduceMotion() ? undefined : "spin",
        animationDuration: TURN_MS,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      }}
    />
  );
}
// @port end
