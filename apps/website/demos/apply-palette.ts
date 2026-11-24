// The theme a demo draws, as the docs site chose it: the palette in this app's storage, which the
// site's switch writes before it loads a panel again (`nsh:<nsh.json's id>:palette` in the page's
// localStorage). A page that is not switched to anything loads no theme file and keeps the
// build-time theme, so its first frame is the one `port:render` records.
//
// Every demo imports this module before it mounts (`kit.tsx` and the pages that skip the kit), and
// the palette is applied as the app starts. `Storage.getItem` answers a promise (an app's entries
// live in the engine, and `nsh run`'s hot-reload bundle is cjs, which has no top-level `await`), so
// the palette arrives a moment after the app has mounted. The page's frame is therefore hidden
// before the app draws into it and shown once the palette is in: no frame of the app's own theme is
// ever shown (`one theme, from the first frame the visitor sees`). `#app` is the element the player
// draws into: the page around this app's own (the player gives an app an iframe), or this document
// when the app runs in the page's realm; without one (a native target) nothing is hidden and the
// theme is simply selected.
//
// The engine takes a theme up one render behind `setTheme`: a view keeps the styles it drew with
// until the next render. So the page is shown two frames after the theme is selected, and
// `check:palette` (the colors of the first frame a visitor can see) and `check:first-frame` (that
// it comes within budget) hold both ends. Then the palette's id goes into `PALETTE_DRAWN_KEY`, the
// one sign from inside the app that its theme is drawn, which the theme render check waits on.
//
// The theme files are imported on demand: a page that is not switched to one carries neither its
// tokens nor its finishes. A running app cannot see a later write (the engine loads its entries
// once, and `Storage` has no change event), which is why the site loads a panel again instead of
// switching it in place.
import { selectTheme } from "@shadcn-nsh/theme";
import { Storage } from "nsh";

import { paletteTheme } from "./palette-themes";
import { PALETTES, PALETTE_DRAWN_KEY, PALETTE_KEY, type PaletteId } from "./palettes";

/** A document, as far as this module needs one: `#app`, the element the player draws an app into. */
type Page = { getElementById(id: string): { style: { visibility: string } } | null };

/** The app as the browser runs it: the page it is in (the player gives an app a page of its own, an
 * iframe, so the page carrying `#app` is usually the one around it), and the document itself when
 * the app runs in the page's own realm. Nothing on a native target. */
const view = globalThis as unknown as { document?: Page; parent?: { document?: Page } };

/** The element the app draws into: `#app` of the document around it, else of its own. */
const frame = (): { style: { visibility: string } } | null => {
  for (const page of [view.parent?.document, view.document]) {
    const element = page?.getElementById("app");
    if (element) return element;
  }
  return null;
};

// The page is hidden before the app's first frame; `start` shows it once the palette is in.
const app = frame();
if (app) app.style.visibility = "hidden";

void start();

/** Applies the palette this page was switched to, shows the page once it is drawn, and records
 * that it is. */
async function start() {
  let drawn: PaletteId | null = null;
  try {
    const stored = await Storage.getItem(PALETTE_KEY);
    /** An id nothing offers is as good as none: the page keeps the build-time theme. */
    const chosen = PALETTES.find((palette) => palette.id === stored);
    if (chosen) {
      selectTheme(await paletteTheme(chosen.id));
      await twoFrames();
      drawn = chosen.id;
    }
  } finally {
    if (app) app.style.visibility = "";
  }
  if (drawn) await Storage.setItem(PALETTE_DRAWN_KEY, drawn);
}

/** Resolves once a theme selected now is on screen: `setTheme` reaches the views one render behind
 * it, so two frames. */
function twoFrames() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
