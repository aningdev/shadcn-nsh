// The showcase's theme, chosen in the app and kept in its storage: which palette it draws in
// (`PALETTES` of `apps/website/demos/palettes.ts`, the one list both sides share) and which
// appearance (the system's, or light or dark whatever it shows). Both switch live — `selectTheme`
// for the palette, `setColorScheme` for the appearance — so no reload is ever needed.
//
// The start-up palette follows the docs demos' approach (`apps/website/demos/apply-palette.ts`):
// the choice in this app's storage, applied before the first frame a visitor can see — and a page
// that carries the website's palette key (same origin, so the entry the site keeps for the docs
// demos is this page's localStorage too) starts in that palette when the app has none of its own.
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
export const palette = signal<PaletteId>("default");

/** Draws the app in `id` while it runs and keeps the choice; `default` needs no theme file. */
export function choosePalette(id: PaletteId) {
  palette.set(id);
  if (id === "default") {
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

/** The element an app draws into, in the document around it: the one thing of a page the
 * start-up palette needs, none of a native target. */
type Page = { getElementById(id: string): { style: { visibility: string } } | null };

/** The app as the browser runs it: its page is `parent`, or itself when it is the page. */
const view = globalThis as unknown as {
  parent?: { document?: Page };
  document?: Page;
  localStorage?: { getItem(key: string): string | null };
};

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

// The palette the app starts in: its own choice, else the website's, else the build-time theme.
const own = await Storage.getItem(PALETTE_KEY);
const start = paletteOf(own) ?? paletteOf(sitePalette()) ?? "default";
palette.set(start);

// An appearance kept from an earlier run (`"system"` when the entry is gone or unknown).
const keptAppearance = await Storage.getItem(APPEARANCE_KEY);
const startAppearance: Appearance =
  keptAppearance === "light" || keptAppearance === "dark" ? keptAppearance : "system";
appearance.set(startAppearance);
setColorScheme(startAppearance);

// The theme arrives one render behind `setTheme`, so the frame that mounts the app is hidden
// until the chosen palette's has been drawn — the same approach as `apply-palette.ts`. A native
// target has no page: nothing is hidden and the theme is simply selected.
if (start !== "default") {
  const theme = await paletteTheme(start);
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
