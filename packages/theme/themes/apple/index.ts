// The Apple theme as one `AppTheme`: its tokens and its finishes, for an app to switch to while it
// runs (`selectTheme`, `currentTheme`). `shadcn-nsh add theme-apple` copies this directory into the
// app's `themes/apple/`; it is the app's, then, to change.
import type { AppTheme } from "@shadcn-nsh/theme";

import finishes from "./finishes.json";
import theme from "./theme.json";

/** Apple's system palette and HIG metrics: capsule controls, continuous corners, systemBlue, and Liquid Glass on the glass, menu and raised finishes. */
export const apple: AppTheme = {
  id: "apple",
  label: "Apple",
  theme,
  // JSON types `material.apple.glass` as `string`; the file holds "regular" or "clear", which
  // `check:theme` holds it to.
  finishes: finishes as AppTheme["finishes"],
};

export default apple;
