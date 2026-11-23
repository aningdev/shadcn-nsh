// The theme render check without the reference pages: every demo alone, under the theme its
// palette names, for `scripts/port/render-theme.ts --against <dir>`. The earlier run's picture is
// the reference there, so drawing the reference page again would only cost time; the pairwise gate
// is `render-theme.test.tsx`'s.
//
//   bun run port:render:theme --against <dir>   (runs this file, not the pair one)
import { renderThemePages } from "./render-theme-pages";

renderThemePages({ reference: false });
