// The shadcn neutral theme as one `AppTheme`: its tokens and its finishes, for an app to switch to
// while it runs (`selectTheme`, `currentTheme`). `shadcn-nsh add theme-shadcn` copies this directory
// into the app's `themes/shadcn/`; it is the app's, then, to change.
import type { AppTheme } from "@shadcn-nsh/theme";

import semantics from "./semantics.json";
import theme from "./theme.json";

/** shadcn's neutral palette (new-york-v4, light and dark) and its flat finishes: near-black and near-white fills, a 10-point base radius: 8-point controls, 14-point cards. */
export const shadcn: AppTheme = {
  id: "shadcn",
  label: "shadcn neutral",
  theme,
  semantics: semantics as AppTheme["semantics"],
};

export default shadcn;
