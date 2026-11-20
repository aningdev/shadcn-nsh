// The theme a demo draws, as the docs site chose it: the palette in this app's storage, which the
// site's switch writes before it loads a panel again (`nsh:<nsh.json's id>:palette` in the page's
// localStorage). A page that is not switched to anything loads no theme file and keeps the
// build-time theme, so its first frame is the one `port:render` records.
//
// Every demo imports this module before it mounts (`kit.tsx` and the pages that skip the kit), and
// a module waits for what it imports: the page's module is evaluated after this one. `Storage.getItem`
// answers a promise (an app's entries live in the engine), and the web runtime's loader keeps
// top-level await, which is what holds the mount.
//
// The engine takes a theme up one render behind `setTheme`: the render that mounts a page is drawn
// with the app's own tokens, and the chosen theme's arrive with the next one. So a page switched to
// a palette has its frame hidden until that next render is in, and no frame of the app's own theme
// is ever shown (`one theme, from the first frame the visitor sees`). The frame is the player page's
// `#app`, the document around this app; without one (a native target) nothing is hidden and the
// theme is simply selected.
//
// The theme files are imported on demand: a page that is not switched to one carries neither its
// tokens nor its finishes. A running app cannot see a later write (the engine loads its entries
// once, and `Storage` has no change event), which is why the site loads a panel again instead of
// switching it in place.
import { selectTheme } from "@shadcn-nsh/theme";
import { Storage } from "nsh";

import { paletteTheme } from "./palette-themes";
import { PALETTES, PALETTE_KEY } from "./palettes";

/** The element an app draws into, in the document around it (`#app` of the player page): the one
 * thing this module needs of a page, none of a native target. */
type Page = { getElementById(id: string): { style: { visibility: string } } | null };

/** The app as the browser runs it: its page is `parent`, or itself when it is the page. */
const view = globalThis as unknown as { parent?: { document?: Page }; document?: Page };

const stored: string | null = await Storage.getItem(PALETTE_KEY);
/** An id nothing offers is as good as none: the page keeps the build-time theme. */
const chosen = PALETTES.find((palette) => palette.id === stored);

if (chosen) {
  const theme = await paletteTheme(chosen.id);
  const page = (view.parent?.document ?? view.document) as Page | undefined;
  const app = page?.getElementById("app") ?? null;
  if (app) app.style.visibility = "hidden";
  selectTheme(theme);
  if (app) {
    requestAnimationFrame(() => {
      selectTheme(null);
      selectTheme(theme);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          app.style.visibility = "";
        });
      });
    });
  }
}
