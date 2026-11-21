// The Material theme as one `AppTheme`: its tokens and its semantics, for an app to switch to
// while it runs (`selectTheme`, `currentTheme`). `shadcn-nsh add theme-material` copies this
// directory into the app's `themes/material/`; it is the app's, then, to change.
import type { AppTheme } from "@shadcn-nsh/theme";

import semantics from "./semantics.json";
import theme from "./theme.json";

/** Material 3 Expressive baseline palette and metrics: tonal surfaces, capsule controls, circular corners, 8/10/10% state layers, press ripple, and expressive springs. */
export const material: AppTheme = {
  id: "material",
  label: "Material",
  theme,
  // JSON types `indicator.*`, `focus.style`, and `shape.curve` as `string`; `check:theme` holds
  // them to the schema whitelists.
  semantics: semantics as AppTheme["semantics"],
};

export default material;
