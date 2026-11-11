// What every modal overlay shares.
// Ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE). The region
// below is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`, not here.
import type { ViewStyle } from "nsh";
import { token } from "nsh";

// @port look/overlay.ts
/**
 * The scrim behind what is modal (a sheet, a dialog, a menu's sheet on a
 * touch screen): the theme's `scrim`, one dimming for every overlay. Pass
 * it as the overlay's `backdropStyle`.
 */
export function backdrop(): ViewStyle {
  return { backgroundColor: token("scrim") };
}
// @port end
