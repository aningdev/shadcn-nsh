// The WinUI 3 theme as one `AppTheme`: its tokens and its semantics, for an app to switch to
// while it runs (`selectTheme`, `currentTheme`). `shadcn-nsh add theme-winui` copies this
// directory into the app's `themes/winui/`; it is the app's, then, to change.
import type { AppTheme } from "@shadcn-nsh/theme";

import semantics from "./semantics.json";
import theme from "./theme.json";

/** WinUI 3 (Windows 11 / Fluent 2) palette and metrics: WinUI fill/stroke tokens, 4/8 px circular corners, Segoe UI Variable, double focus ring, timing motion, and Windows blur material. */
export const winui: AppTheme = {
  id: "winui",
  label: "WinUI 3",
  theme,
  // JSON types `indicator.*`, `focus.style`, and `shape.curve` as `string`; `check:theme` holds
  // them to the schema whitelists.
  semantics: semantics as AppTheme["semantics"],
};

export default winui;
