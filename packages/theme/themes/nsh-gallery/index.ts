// The build-time theme (NSH Gallery, the official look) as one `AppTheme`: the same tokens and
// finishes an app built on another theme does not have, for it to switch back to while it runs
// (`selectTheme`, `currentTheme`). `shadcn-nsh add theme-nsh-gallery` copies this directory into the
// app's `themes/nsh-gallery/`; it is the app's, then, to change. Its two files are the build-time
// ones, copied byte for byte.
import type { AppTheme } from "@shadcn-nsh/theme";

import semantics from "./semantics.json";
import theme from "./theme.json";

/** NSH Gallery, the official look (the citrus accent, the graphite surfaces, 8-point controls,
 * 12-point containers, 14-point modals) as a theme: what an app built on another one switches back to. */
export const nshGallery: AppTheme = {
  id: "nsh-gallery",
  label: "NSH Gallery",
  theme,
  semantics: semantics as AppTheme["semantics"],
};

export default nshGallery;
