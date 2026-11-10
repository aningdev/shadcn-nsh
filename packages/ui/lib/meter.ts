// Source: examples/nsh-gallery-ui/look/meter.ts, slider.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, finish } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

/**
 * The sunk rail shared by a progress track and a slider indicator, so a level and a
 * slider read alike. `muted` stands in for the reference's `track`; the inset hairline
 * and `finish.control.pressed` stand in for `finish.track`.
 */
export function sunkTrack(): ViewStyle {
  return {
    backgroundColor: colors.muted,
    boxShadow: `inset 0 0 0 1px ${colors.border}, ${finish.control.pressed}`,
  };
}

/**
 * The run along that rail (a progress fill, a slider range). `primary` with the filled
 * edge stands in for the reference's citrus gradient (`finish.fill`).
 */
export function trackFill(): ViewStyle {
  return {
    backgroundColor: colors.primary,
    boxShadow: finish.filled,
  };
}
