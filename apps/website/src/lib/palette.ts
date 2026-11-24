/**
 * The demos' theme, as the site keeps it: the palette in the demo app's storage, which is
 * localStorage under `nsh:<the app's id>:` (nsh's `Storage` prefixes an app's keys with its id), and
 * the choices the demos themselves read (`apps/website/demos/palettes.ts`). Neither the app's id nor a
 * palette is written here: both come from the demos.
 *
 * A choice is written before the panels load again: a running app reads its storage once, when it
 * starts, and cannot see a later write. Each panel subscribes to `onPaletteChange` and loads its
 * frame again (`src/components/fd/demo-panel.tsx`).
 */
import demos from "../../demos/nsh.json";
import { PALETTES, PALETTE_KEY, type PaletteId } from "../../demos/palettes";

/** Where the demo app's `Storage` keeps the palette: `nsh:<its id>:palette`. */
export const PALETTE_STORAGE_KEY = `nsh:${demos.id}:${PALETTE_KEY}`;

/** The palette the next page load draws in: the one stored, `nsh-gallery` when there is none or the
 * value is no palette this site offers. */
export function storedPalette(): PaletteId {
  try {
    const value = localStorage.getItem(PALETTE_STORAGE_KEY);
    return PALETTES.find((palette) => palette.id === value)?.id ?? "nsh-gallery";
  } catch {
    return "nsh-gallery";
  }
}

/** Keeps `id` for the demos, `nsh-gallery` taking the key out: an app with no palette draws the
 * build-time theme without loading a theme file. */
export function storePalette(id: PaletteId) {
  try {
    if (id === "nsh-gallery") localStorage.removeItem(PALETTE_STORAGE_KEY);
    else localStorage.setItem(PALETTE_STORAGE_KEY, id);
  } catch {}
}

/** A palette was chosen: every switch on the page shows the same one (`onPaletteChange`). */
const PALETTE_EVENT = "palette-change";

/**
 * Chooses a palette for the demos: stored for the next load, and every demo panel loads again in
 * it. The site itself stays in the shadcn theme (`sitePaletteCss`). A running app reads its storage once (nsh's `Storage` has no change event), so the panels
 * load again rather than switch in place.
 */
export function choosePalette(id: PaletteId) {
  storePalette(id);
  document.dispatchEvent(new CustomEvent(PALETTE_EVENT));
}

/**
 * Calls `change` whenever a switch on the page chose another palette; returns the unsubscribe, for
 * callers that mount and unmount (the React panel).
 */
export function onPaletteChange(change: () => void) {
  document.addEventListener(PALETTE_EVENT, change);
  return () => document.removeEventListener(PALETTE_EVENT, change);
}
