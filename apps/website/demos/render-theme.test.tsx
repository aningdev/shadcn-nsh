// The render check under the themes a demo can switch to: every demo, and its reference page
// beside it, drawn with the theme its palette names, and the two compared, so a component drawn by
// hand still draws what its theme says.
//
//   bun run port:render:theme        (nsh test render-theme.test.tsx --target web)
//
// The pages are in `render-theme-pages.tsx`; this file is the run that takes both pictures and
// leaves them for `scripts/port/render-theme.ts` to compare. `render-theme-components.test.tsx` is
// the same pages without the reference page, which `--against` compares with an earlier run.
import { renderThemePages } from "./render-theme-pages";

renderThemePages();
