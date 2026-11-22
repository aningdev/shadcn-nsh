// A spinner: a ring turning with its top arc in one color, the shape of work going on.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, controls, type Controls } from "@shadcn-nsh/theme";
import { reduceMotion, View } from "nsh";

interface SpinnerPreset {
  minStroke: number;
  strokeShare: number;
  hasTrack: boolean;
  trackAlpha: number;
}

const spinnerPresets: Record<Controls, SpinnerPreset> = {
  base: { minStroke: 1.5, strokeShare: 8, hasTrack: true, trackAlpha: 0.25 },
  // M3 CircularProgressIndicator 4dp stroke at 40dp diameter (1/10 share) and transparent track (CircularProgressIndicatorTokens.kt, ProgressIndicator.kt:835).
  material: { minStroke: 1.5, strokeShare: 10, hasTrack: false, trackAlpha: 0.25 },
  // WinUI 3 ProgressRing 4px stroke at 32px default size (1/8 share) and transparent background track (ProgressRing_themeresources.xaml:10,17).
  winui: { minStroke: 1.5, strokeShare: 8, hasTrack: false, trackAlpha: 0.25 },
};

// @port index.tsx
/** One turn, in milliseconds: fast enough to read as work going on, slow enough not to blur. */
const TURN_MS = 800;

/** A spinner's props. */
export interface SpinnerProps {
  /** The ring's side, in points. */
  size: number;
  /** The moving arc's color (the theme's text, a tone); the rest of the ring follows `spinnerPresets`. */
  tint: string;
}

/**
 * A ring turning with its top arc in `tint`: work going on. Stroke share, minimum stroke, and
 * background track ring visibility come from `spinnerPresets[controls()]`. It stands still when the user asks for less motion.
 */
export function Spinner(props: SpinnerProps) {
  const g = () => spinnerPresets[controls()];
  const stroke = () => Math.max(g().minStroke, props.size / g().strokeShare);
  return (
    <View
      style={{
        width: props.size,
        height: props.size,
        borderRadius: props.size / 2,
        borderWidth: stroke(),
        borderColor: g().hasTrack ? alpha(props.tint, g().trackAlpha) : "transparent",
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
