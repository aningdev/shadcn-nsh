// The Solid Glass theme as one `AppTheme`: its tokens and its finishes, for an app to switch to
// while it runs (`selectTheme`, `currentTheme`). `shadcn-nsh add theme-solid-glass` copies this
// directory into the app's `themes/solid-glass/`; it is the app's, then, to change.
import type { AppTheme } from "@shadcn-nsh/theme";

import semantics from "./semantics.json";
import theme from "./theme.json";

/** Solid Glass (deeplethe/solid-glass, MIT): panes of thick smoky glass — a rim of light on each top edge, a hairline round it, a shadow underneath, and no gradient across a face. */
export const solidGlass: AppTheme = {
  id: "solid-glass",
  label: "Solid Glass",
  theme,
  semantics: semantics as AppTheme["semantics"],
};

export default solidGlass;
