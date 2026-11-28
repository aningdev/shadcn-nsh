// The theme a demo draws, as the docs site chose it: the palette in this app's storage, which the
// site's switch writes before it loads a panel again (`nsh:<nsh.json's id>:palette` in the page's
// localStorage). A page that is not switched to anything loads no theme file and keeps the
// build-time theme.
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
// until the next render. So the page is shown two frames after the theme is selected — frames of
// the page that shows the app, not the app's own: the player's realm iframe is `display: none`,
// and Firefox runs no `requestAnimationFrame` in a frame that is not rendered (#428) — and
// `check:palette` (the colors of the first frame a visitor can see) and `check:first-frame` (that
// it comes within budget) hold both ends.
//
// The theme files are imported on demand: a page that is not switched to one carries neither its
// tokens nor its finishes. A running app cannot see a later write (the engine loads its entries
// once, and `Storage` has no change event), which is why the site loads a panel again instead of
// switching it in place.
import { selectTheme } from "@shadcn-nsh/theme";
import { Storage } from "nsh";

import { paletteTheme } from "./palette-themes";
import { PALETTES, PALETTE_KEY } from "./palettes";

/** `#app`, the element the player draws an app into. */
type Frame = { style: { visibility: string } };

/** A window, as far as this module needs one: its document's `#app`, and its frames. */
type Window = {
  document?: { getElementById(id: string): Frame | null };
  requestAnimationFrame?(callback: () => void): number;
};

/** The app as the browser runs it: the page it is in (the player gives an app a page of its own, an
 * iframe, so the page carrying `#app` is usually the one around it), and the window itself when
 * the app runs in the page's own realm. Nothing on a native target. */
const view = globalThis as unknown as Window & { parent?: Window };

/** The page the app draws into: `#app` and the window that renders it — the window around the
 * app's, else its own. */
const page = ((): { frame: Frame; window: Window } | null => {
  for (const window of [view.parent, view]) {
    const frame = window?.document?.getElementById("app");
    if (window && frame) return { frame, window };
  }
  return null;
})();

// The page is hidden before the app's first frame; `start` shows it once the palette is in.
if (page) page.frame.style.visibility = "hidden";

void start();

/** Applies the palette this page was switched to and shows the page once it is drawn. */
async function start() {
  try {
    const stored = await Storage.getItem(PALETTE_KEY);
    /** An id nothing offers is as good as none: the page keeps the build-time theme. */
    const chosen = PALETTES.find((palette) => palette.id === stored);
    if (chosen) {
      selectTheme(await paletteTheme(chosen.id));
      await twoFrames();
    }
  } finally {
    if (page) page.frame.style.visibility = "";
  }
}

/** Resolves once a theme selected now is on screen: `setTheme` reaches the views one render behind
 * it, so two frames of the page that shows them. */
function twoFrames() {
  const frames = page?.window.requestAnimationFrame
    ? (callback: () => void) => page.window.requestAnimationFrame!(callback)
    : requestAnimationFrame;
  return new Promise<void>((resolve) => {
    frames(() => frames(() => resolve()));
  });
}
