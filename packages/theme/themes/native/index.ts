import type { AppTheme } from "@shadcn-nsh/theme";
// The theme of the platform the app runs on: Apple's on iOS and macOS, Material on Android, and
// the default theme elsewhere until Fluent is shipped. `shadcn-nsh add theme-native` copies this
// file and the themes it names into the app's `themes/`; it is the app's, then, to change.
//
//   selectTheme(nativeTheme());
//
// `platform.os` is fixed for the run, so the call returns the same theme every time.
import { platform } from "nsh";

import apple from "../apple";
import defaultTheme from "../default";
import material from "../material";

/** The theme that draws this platform's own look: Apple's on iOS and macOS, Material on Android, and the default theme on every other platform. */
export function nativeTheme(): AppTheme {
  switch (platform.os) {
    case "ios":
    case "macos":
      return apple;
    case "android":
      return material;
    default:
      return defaultTheme;
  }
}

export default nativeTheme;
