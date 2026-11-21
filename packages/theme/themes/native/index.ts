import type { AppTheme } from "@shadcn-nsh/theme";
// The theme of the platform the app runs on: Apple's on iOS and macOS, the default theme elsewhere
// until the platform's own (Material, Fluent) is shipped. `shadcn-nsh add theme-native` copies this
// file and the themes it names into the app's `themes/`; it is the app's, then, to change.
//
//   selectTheme(nativeTheme());
//
// `platform.os` is fixed for the run, so the call returns the same theme every time.
import { platform } from "nsh";

import apple from "../apple";
import defaultTheme from "../default";

/** The theme that draws this platform's own look: Apple's on iOS and macOS, the default theme on every other platform. */
export function nativeTheme(): AppTheme {
  switch (platform.os) {
    case "ios":
    case "macos":
      return apple;
    default:
      return defaultTheme;
  }
}

export default nativeTheme;
