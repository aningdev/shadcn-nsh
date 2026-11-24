// The showcase's theme, chosen in the app and kept in its storage: which palette it draws in
// (`PALETTES` of `apps/website/demos/palettes.ts`, the one list both sides share) and which
// appearance (the system's, or light or dark whatever it shows). Both switch live — `selectTheme`
// for the palette, `setColorScheme` for the appearance — so no reload is ever needed.
//
// The start-up palette follows the docs demos' approach (`apps/website/demos/apply-palette.ts`):
// the choice in this app's storage, applied as the app starts, the page hidden until it is in so
// no visitor sees a frame of the build-time theme — and a page that carries the website's palette
// key (same origin, so the entry the site keeps for the docs demos is this page's localStorage
// too) starts in that palette when the app has none of its own.
import { selectTheme } from "@shadcn-nsh/theme";
import { setColorScheme, signal } from "nsh";
import { Storage } from "nsh";

import demos from "@/apps/website/demos/nsh.json";
import { paletteTheme } from "@/apps/website/demos/palette-themes";
import { PALETTES, PALETTE_KEY, type PaletteId } from "@/apps/website/demos/palettes";

/** Where the app keeps the palette (`nsh.json`'s id prefixes it in the engine's entries). */
export const PALETTE_STORAGE = PALETTE_KEY;
/** Where the app keeps the appearance (`"system"`, `"light"` or `"dark"`). */
const APPEARANCE_KEY = "appearance";

/** Where the website keeps the docs demos' palette: `nsh:<the demos' id>:palette`
 * (`apps/website/src/lib/palette.ts` builds the same key). */
const SITE_PALETTE_KEY = `nsh:${demos.id}:${PALETTE_KEY}`;

/** The appearance the app is shown in: the system's, or light or dark whatever the system shows. */
export type Appearance = "system" | "light" | "dark";

/** The appearance chosen (the sidebar footer's control, the phone's theme menu). */
export const appearance = signal<Appearance>("system");

/** Shows the app in `next` and keeps the choice. */
export function setAppearance(next: Appearance) {
  appearance.set(next);
  setColorScheme(next);
  void Storage.setItem(APPEARANCE_KEY, next);
}

/** The palette chosen, as `palettes.ts` names it. */
export const palette = signal<PaletteId>("nsh-gallery");

/** Draws the app in `id` while it runs and keeps the choice; `nsh-gallery` needs no theme file. */
export function choosePalette(id: PaletteId) {
  palette.set(id);
  if (id === "nsh-gallery") {
    selectTheme(null);
    void Storage.removeItem(PALETTE_KEY);
    return;
  }
  void paletteTheme(id).then((theme) => {
    // Another choice arrived while this one was loading: it applies its own.
    if (palette() === id) selectTheme(theme);
  });
  void Storage.setItem(PALETTE_KEY, id);
}

/** A document, as far as this module needs one: `#app`, the element the player draws an app into. */
type Page = { getElementById(id: string): { style: { visibility: string } } | null };

/** The app as the browser runs it: the page it is in (the player gives an app a page of its own, an
 * iframe, so the page carrying `#app` is usually the one around it), the document itself when the
 * app runs in the page's own realm, and that page's storage for the site's palette. Nothing on a
 * native target. */
const view = globalThis as unknown as {
  document?: Page;
  parent?: { document?: Page };
  localStorage?: { getItem(key: string): string | null };
};

/** The element the app draws into: `#app` of the document around it, else of its own. */
function frame(): { style: { visibility: string } } | null {
  for (const page of [view.parent?.document, view.document]) {
    const element = page?.getElementById("app");
    if (element) return element;
  }
  return null;
}

/** The website's palette, if the page this app runs in has one chosen; none elsewhere. */
function sitePalette(): string | null {
  try {
    return view.localStorage?.getItem(SITE_PALETTE_KEY) ?? null;
  } catch {
    return null;
  }
}

/** A palette id a palette of ours answers, else null: an id nothing offers is as good as none. */
function paletteOf(stored: string | null): PaletteId | null {
  return PALETTES.find((p) => p.id === stored)?.id ?? null;
}

// The page is hidden before the app's first frame; `start` shows it once the palette is in. A
// native target has no page: nothing is hidden, and the app draws as soon as it mounts.
const app = frame();
if (app) app.style.visibility = "hidden";

void start();

/**
 * Applies the palette and the appearance the app starts in, then shows the page. `Storage.getItem`
 * answers a promise, so this runs while the app mounts; hiding `#app` is what keeps the build-time
 * theme off screen until it is in (`apps/website/demos/apply-palette.ts` does the same).
 */
async function start() {
  let themed = false;
  try {
    // The palette the app starts in: its own choice, else the website's, else the build-time theme.
    const own = await Storage.getItem(PALETTE_KEY);
    const start = paletteOf(own) ?? paletteOf(sitePalette()) ?? "nsh-gallery";
    palette.set(start);

    // An appearance kept from an earlier run (`"system"` when the entry is gone or unknown).
    const kept = await Storage.getItem(APPEARANCE_KEY);
    const chosen: Appearance = kept === "light" || kept === "dark" ? kept : "system";
    appearance.set(chosen);
    setColorScheme(chosen);

    if (start !== "nsh-gallery") {
      selectTheme(await paletteTheme(start));
      themed = true;
    }
  } finally {
    show(themed);
  }
}

/** Shows the page, once the theme has been drawn when one was chosen: `setTheme` reaches the views
 * one render behind it, so two frames. */
function show(themed: boolean) {
  if (!app) return;
  if (!themed) {
    app.style.visibility = "";
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      app.style.visibility = "";
    });
  });
}
